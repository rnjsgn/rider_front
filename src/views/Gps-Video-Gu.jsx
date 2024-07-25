import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import YoutubeIframe from 'react-native-youtube-iframe';

import Owner from '../../assets/images/owner.jpg';

export const Gps = () => {
    const gps_style = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
        },
        map: {
            width: "100%",
            height: "40%",
        },
        loading: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -25,
            marginTop: -25,
        },
        listContainer: {
            width: '100%',
            padding: 10,
        },
        listItem: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
        },
        videoContainer: {
            width: '100%',
            height: 300,
        },
        icon: {
            width: 30,  // 원하는 너비
            height: 30, // 원하는 높이
            resizeMode: 'contain',
          },
    });

    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [loading, setLoading] = useState(true);
    const [owners, setOwners] = useState([]);
    const [uses, setUses] = useState([]);
    const [videoId, setVideoId] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            getCurrentLocation();
        } else {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        } catch (error) {
            console.error("위치 정보를 가져오는 중 오류가 발생했습니다:", error);
            setLoading(false);
        }
    };

    const reverseGeocode = async (latitude, longitude) => {
        try {
            const address = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (address.length > 0) {
                setAddress(address[0].formattedAddress || `${address[0].city} ${address[0].district}`);
                setDistrict(address[0].district);
            }
        } catch (error) {
            console.error("주소를 가져오는 중 오류가 발생했습니다:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const fetchOwners = useCallback(async () => {
        try {
            const response = await fetch('http://192.168.116.169:3000/owner/all', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    mode: 'no-cors',
                },
            });
            const owner_data = await response.json();
            setOwners(owner_data.data);
        } catch (error) {
            console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
        }
    }, []);

    useEffect(() => {
        fetchOwners();
    }, [fetchOwners]);

    const extractVideoId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    };

    useEffect(() => {
        if (uses.length > 0) {
            const url = uses[currentIndex]?.ad;
            const id = extractVideoId(url);
            if (id) {
                setVideoId(id);
            }
        }
    }, [uses, currentIndex]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLocation((prevLocation) => {
                if (!prevLocation || (prevLocation.longitude >= 129.0187 && prevLocation.latitude >= 35.2418)) {
                    clearInterval(intervalId);
                    return prevLocation;
                }
                const newLocation = {
                    latitude: prevLocation.latitude + 0.00012,
                    longitude: prevLocation.longitude + 0.000016,
                };
                reverseGeocode(newLocation.latitude, newLocation.longitude);
                return newLocation;
            });
        }, 100);

        return () => clearInterval(intervalId);
    }, [location]);

    useEffect(() => {
        if (owners.length > 0 && district) {
            const filteredOwners = owners.filter(owner => owner.location === district);
            setUses(filteredOwners);
            setCurrentIndex(0); // Ensure to reset currentIndex when uses updates
        }
    }, [owners, district]);

    useEffect(() => {
        if (uses.length > 0) {
            const url = uses[0]?.ad;
            const id = extractVideoId(url);
            if (id) {
                setVideoId(id);
            }
        }
    }, [uses]);

    const onStateChange = (state) => {
        if (state === "ended") {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % uses.length);
        }
    };

    return (
        <ScrollView contentContainerStyle={gps_style.container}>
            {loading ? (
                <ActivityIndicator style={gps_style.loading} size="large" color="#0000ff" />
            ) : (
                <>
                    <Text>현재 위치</Text>
                    <Text>위도: {location?.latitude}</Text>
                    <Text>경도: {location?.longitude}</Text>
                    <Text>주소: {address}</Text>
                    <MapView
                        style={gps_style.map}
                        region={{
                            latitude: location?.latitude || 35.1457924,
                            longitude: location?.longitude || 129.0075623,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        provider={PROVIDER_GOOGLE}
                    >
                        {location && (
                            <Marker
                            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                            title="현재 위치"
                            description="라이더의 현재위치"
                          >
                                <Image
                                source={require('../components/rider.png')}
                                style={gps_style.icon}
                                />
                          </Marker>
                        )}
                    </MapView>
                    <View style={gps_style.videoContainer}>
                        {uses.length > 0 ? (
                            <>
                                <Text>가게 이름: {uses[currentIndex]?.name}</Text>
                                <Text>현재 지역 광고 리스트 : {
                                        uses.map((use) => (
                                             '"' + use.name + '" '
                                        ))
                                    }</Text>
                                {/* {uses.length > 1 && (
                                    <Text>다음 가게: {uses[(currentIndex + 1) % uses.length]?.name}</Text>
                                )} */}
                                <Text>전화 번호: {uses[currentIndex]?.tel}</Text>
                                <Text>위치: {uses[currentIndex]?.location}</Text>
                                {district === uses[currentIndex]?.location ? (
                                    <YoutubeIframe
                                        height={300}
                                        play={true}
                                        videoId={videoId}
                                        onChangeState={onStateChange}
                                    />
                                ) : (
                                    <Image source={Owner} style={{ width: '100%', height: 300 }} />
                                )}
                            </>
                        ) : (
                            <Text>해당 지역에 가게가 없습니다.</Text>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    );
};