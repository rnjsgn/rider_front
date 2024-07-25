import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
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
                          >
                                <Image
                                source={require('../components/rider.png')}
                                style={gps_style.icon}
                                />
                          </Marker>
                        )}
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
                </>
            )}
        </View>
    );
};
