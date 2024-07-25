import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator, FlatList, Alert, ScrollView, Image } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import YoutubeIframe from 'react-native-youtube-iframe';

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
        videoContainer: {
            width: '100%',
            height: 300,
            marginTop: 20,
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
        icon: {
            width: 30,  // 원하는 너비
            height: 30, // 원하는 높이
            resizeMode: 'contain',
        },
    });

    const [location, setLocation] = useState([]);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [owners, setOwners] = useState([]);
    const [uses, setUses] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoId, setVideoId] = useState('');
    const [replay, setReplay] = useState(false);
    const [riderIndex, setRiderIndex] = useState(0);

    // 유튜브 URL에서 videoId 추출
    const extractVideoId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    };

    // 위치 권한 요청 및 현재 위치 가져오기
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
                setLocation([
                    {
                        latitude: 35.1458,
                        longitude: 128.9787,
                    },
                    {
                        latitude: 35.1558,
                        longitude: 128.9887,
                    },
                    {
                        latitude: 35.1158,
                        longitude: 129.0087,
                    }
                ]);
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

    // 가게 데이터 받아오기
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

    // 반경 2km 내의 원의 경계를 따는 코드
    const isWithinRadius = (lat1, lon1, lat2, lon2, radius = 2) => {
        // 도(degree)를 라디안(radian)으로 변환하는 함수
        const toRadians = degree => degree * (Math.PI / 180);

        // 지구의 반지름 (킬로미터 단위)
        const earthRadiusKm = 6371;

        // 두 지점 간의 위도 차이를 라디안으로 변환
        const dLat = toRadians(lat2 - lat1);
        // 두 지점 간의 경도 차이를 라디안으로 변환
        const dLon = toRadians(lon2 - lon1);

        // Haversine 공식을 사용하여 두 지점 간의 거리 계산
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        // 두 지점 간의 대권 거리 계산
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // 최종 거리 (킬로미터 단위)
        const distance = earthRadiusKm * c;

        // 계산된 거리가 주어진 반경 내에 있는지 여부 반환
        return distance <= radius;
    };


    useEffect(() => {
        if (location[riderIndex] && owners.length > 0) {
            const nearbyOwners = owners.filter(owner =>
                isWithinRadius(location[riderIndex].latitude, location[riderIndex].longitude, owner.latitude, owner.longitude)
            );
            setUses(nearbyOwners);
            if (nearbyOwners.length === 1) setCurrentIndex(0);
        }
    }, [location, owners]);

    useEffect(() => {
        if (uses.length > 0) {
            const url = uses[currentIndex]?.ad;
            const id = extractVideoId(url);
            if (id) {
                setVideoId(id);
            } else {
                Alert.alert('유효하지 않은 유튜브 URL입니다');
            }
        }
    }, [uses, currentIndex]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLocation((prevLocation) => {
                return prevLocation.map((loc, idx) => {
                    if (!loc || loc.longitude >= 129.1187) {
                        clearInterval(intervalId);
                        return loc;
                    }
                    if (idx == 0)
                        return { ...loc, longitude: loc.longitude + 0.0001 };
                    else
                        return { ...loc, latitude: loc.latitude + 0.0001 };
                })
            });
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    const onStateChange = (state) => {
        // console.log(videoId)
        if (state === "ended") {
            if (uses.length === 1) {
                setVideoId('');
                setReplay(prev => !prev);
                setCurrentIndex(0);
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
                    <Text>위도: {location[riderIndex]?.latitude}</Text>
                    <Text>경도: {location[riderIndex]?.longitude}</Text>
                    <Text>주소: {address}</Text>
                    <MapView
                        style={gps_style.map}
                        region={{
                            latitude: location[riderIndex]?.latitude || 35.1457924,
                            longitude: location[riderIndex]?.longitude || 129.0075623,
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
                                <Circle
                                    center={{ latitude: parseFloat(owner.latitude), longitude: parseFloat(owner.longitude) }}
                                    radius={2000}
                                    strokeColor="rgba(0,0,255,0.5)"
                                    fillColor="rgba(0,0,255,0.1)"
                                />
                            </React.Fragment>
                        ))}
                    </MapView>
                    <View style={gps_style.videoContainer}>
                        {uses.length > 0 ? (
                            <>
                                <Text>가게 이름: {uses[currentIndex]?.name}</Text>
                                <Text>총 광고 갯수 : {uses.length}</Text>
                                <Text>현재 지역 광고 리스트 : {
                                        uses.map((use) => (
                                             '"' + use.name + '" '
                                        ))
                                    }</Text>
                                {/* {
                                    uses.length > 1
                                        ?
                                        (!uses[currentIndex + 1] ?
                                            <Text>다음 가게: {uses[0]?.name}</Text>
                                            :
                                            <Text>다음 가게: {uses[currentIndex + 1]?.name}</Text>
                                        )
                                        :
                                        <></>
                                } */}
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