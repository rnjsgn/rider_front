import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator, FlatList } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

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
    });

    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [owners, setOwners] = useState([]);

    // 위치 권한 요청 및 현재 위치 가져오기
    useEffect(() => {
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
                const location = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
                reverseGeocode(location.coords.latitude, location.coords.longitude);
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

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구의 반경 (킬로미터)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            0.5 - Math.cos(dLat) / 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            (1 - Math.cos(dLon)) / 2;
        return R * 2 * Math.asin(Math.sqrt(a));
    };

    return (
        <View style={gps_style.container}>
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
                                icon={require('../components/rider.png')}
                            />
                        )}
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
                                {owners.map((innerOwner, innerIndex) => {
                                    if (innerOwner._id !== owner._id) {
                                        const distance = getDistance(
                                            parseFloat(owner.latitude),
                                            parseFloat(owner.longitude),
                                            parseFloat(innerOwner.latitude),
                                            parseFloat(innerOwner.longitude)
                                        );
                                        if (distance <= 2) {
                                            return (
                                                <Marker
                                                    key={innerIndex}
                                                    coordinate={{ latitude: parseFloat(innerOwner.latitude), longitude: parseFloat(innerOwner.longitude) }}
                                                    title={innerOwner.name}
                                                    description={`전화 번호: ${innerOwner.tel}`}
                                                    pinColor="blue"
                                                />
                                            );
                                        }
                                    }
                                    return null;
                                })}
                            </React.Fragment>
                        ))}
                    </MapView>
                </>
            )}
        </View>
    );
};

