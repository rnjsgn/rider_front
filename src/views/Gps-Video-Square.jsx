import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Alert, ScrollView } from "react-native";
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import YoutubeIframe from 'react-native-youtube-iframe';

export const Gps2 = () => {
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
        videoContainer: {
            width: '100%',
            height: 300,
            marginTop: 20,
        },
        icon: {
            width: 30,  // 원하는 너비
            height: 30, // 원하는 높이
            resizeMode: 'contain',
          },
    });

    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [owners, setOwners] = useState([]);
    const [uses, setUses] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [replay, setReplay] = useState(false);
    const [videoId, setVideoId] = useState('');

    const extractVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url?.match(regex);
        return matches ? matches[1] : null;
    };

    useEffect(() => {
        const requestLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                getCurrentLocation();
            } else {
                setLoading(false);
                Alert.alert('위치 접근 권한이 거부되었습니다');
            }
        };

        const getCurrentLocation = async () => {
            try {
                setLocation({
                    latitude: 35.1458,
                    longitude: 128.9787,
                });
                reverseGeocode(35.1458, 128.9787);
            } catch (error) {
                console.error("위치 정보를 가져오는 중 오류가 발생했습니다:", error);
                setLoading(false);
            }
        };

        const reverseGeocode = async (latitude, longitude) => {
            try {
                const address = await Location.reverseGeocodeAsync({ latitude, longitude });
                setAddress(address[0].formattedAddress || `${address[0].city} ${address[0].district}`);
            } catch (error) {
                console.error("주소를 가져오는 중 오류가 발생했습니다:", error);
            } finally {
                setLoading(false);
            }
        };

        requestLocationPermission();
    }, []);

    useEffect(() => {
        const fetchOwners = async () => {
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
        };

        fetchOwners();
    }, []);

    const isWithinSquareBoundary = (lat1, lon1, lat2, lon2, length = 4) => {
        const toRadians = (degree) => degree * (Math.PI / 180);
        const earthRadiusKm = 6371;

        const deltaLat = toRadians(lat2 - lat1);
        const deltaLon = toRadians(lon2 - lon1);

        const a = Math.sin(deltaLat / 2) ** 2 +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(deltaLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = earthRadiusKm * c;

        return distance <= (length / 2);
    };

    useEffect(() => {
        if (location && owners.length > 0) {
            const nearbyOwners = owners.filter(owner => 
                isWithinSquareBoundary(location.latitude, location.longitude, owner.latitude, owner.longitude)
            );
            setUses(nearbyOwners);
        }
    }, [location, owners]);

    useEffect(() => {
        console.log(uses)
        console.log(currentIndex)
        if (uses.length > 0) {
            const url = uses[currentIndex]?.ad;
            const id = extractVideoId(url);
            if (id) {
                setVideoId(id);
            } else {
                Alert.alert('유효하지 않은 유튜브 URL입니다');
            }
        }
    }, [uses, currentIndex, replay]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLocation((prevLocation) => {
                if (!prevLocation || prevLocation.longitude >= 129.1187) {
                    clearInterval(intervalId);
                    return prevLocation;
                }
                return { ...prevLocation, longitude: prevLocation.longitude + 0.0001 };
            });
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    const onStateChange = (state) => {
        console.log(videoId)
        if (state === "ended") {
            if (uses.length === 1) {
                setVideoId('');
                setReplay(prev => !prev);
            } else if (uses.length > 1) {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % uses.length);
            }
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
                        {
                            location &&
                            location?.map((loc, idx) => {
                                // console.log(loc)
                                return (
                                    <Marker
                                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                                        title="현재 위치"
                                        description="라이더의 현재위치"
                                        onPress={() => { setRiderIndex(idx); }}
                                    >
                                        <Image
                                            source={require('../components/rider.png')}
                                            style={gps_style.icon}
                                        />
                                    </Marker>
                                )
                            })
                        }
                        {owners.map((owner, index) => (
                            <React.Fragment key={index}>
                                <Marker
                                    coordinate={{ latitude: parseFloat(owner.latitude), longitude: parseFloat(owner.longitude) }}
                                    title={owner.name}
                                    description={`전화 번호: ${owner.tel}`}
                                    pinColor="blue"
                                />
                                <Polygon
                                    coordinates={[
                                        { latitude: parseFloat(owner.latitude) - 0.015, longitude: parseFloat(owner.longitude) - 0.015 },
                                        { latitude: parseFloat(owner.latitude) - 0.015, longitude: parseFloat(owner.longitude) + 0.015 },
                                        { latitude: parseFloat(owner.latitude) + 0.015, longitude: parseFloat(owner.longitude) + 0.015 },
                                        { latitude: parseFloat(owner.latitude) + 0.015, longitude: parseFloat(owner.longitude) - 0.015 },
                                    ]}
                                    fillColor="rgba(0,0,255,0.1)"
                                    strokeColor="rgba(0,0,255,0.5)"
                                />
                            </React.Fragment>
                        ))}
                    </MapView>
                    <View style={gps_style.videoContainer}>
                        {uses.length > 0 ? (
                            <>
                                <Text>가게 이름: {uses[currentIndex]?.name}</Text>
                                {
                                    uses.length > 1
                                    ?
                                    <Text>다음 가게: {uses[currentIndex+1]?.name}</Text>
                                    :
                                    <></>
                                }
                                <Text>가게 번호: {uses[currentIndex]?.tel}</Text>
                                <Text>가게 위치: {uses[currentIndex]?.latitude}, {uses[currentIndex]?.longitude}</Text>
                                <YoutubeIframe
                                    height={300}
                                    play={true}
                                    videoId={videoId}
                                    onChangeState={onStateChange}
                                />
                            </>
                        ) : (
                            <Text>반경 5km 내에 광고를 재생할 가게가 없습니다.</Text>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    );
};
