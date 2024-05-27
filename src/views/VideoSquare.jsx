// 현재 가게를 기준으로 반경 5km으로 하는 정사각형의 경계를 딴 경우

import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, Alert, ScrollView } from "react-native";
import * as Location from 'expo-location';
import YoutubeIframe from 'react-native-youtube-iframe';

import Owner from '../../assets/images/owner.jpg';

export const Video = () => {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoId, setVideoId] = useState('');
    const [owners, setOwners] = useState([]);
    const [uses, setUses] = useState([]);

    // 유튜브 URL에서 videoId 추출
    const extractVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    };

    // 위치 권한 요청 및 현재 위치 가져오기
    useEffect(() => {
        const requestLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('위치 접근 권한이 거부되었습니다');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
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

    // 정사각형 경계 내에 있는지 확인
    const isWithinSquareBoundary = (lat1, lon1, lat2, lon2, length = 3) => {
        const kmPerDegree = 111.32; // 위도와 경도의 1도는 대략 111.32 km
        const halfLength = length / 2;

        const latDiff = halfLength / kmPerDegree;
        const lonDiff = halfLength / kmPerDegree;

        const minLat = lat1 - latDiff;
        const maxLat = lat1 + latDiff;
        const minLon = lon1 - lonDiff;
        const maxLon = lon1 + lonDiff;

        return (lat2 >= minLat && lat2 <= maxLat && lon2 >= minLon && lon2 <= maxLon);
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

    const onStateChange = (state) => {
        if (state === "ended") {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % uses.length);
        }
    };

    return (
        <ScrollView>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>출력 화면</Text>
                <Text>현재 위치: {location ? `${location.latitude}, ${location.longitude}` : '로딩 중...'}</Text>
                {uses.length > 0 && (
                    <>
                        <Text>가게 이름: {uses[currentIndex]?.name}</Text>
                        <Text>가게 번호: {uses[currentIndex]?.tel}</Text>
                        <Text>가게 위치: {uses[currentIndex]?.latitude}</Text>
                        <Text>가게 위치: {uses[currentIndex]?.longitude}</Text>
                        <View style={{ width: '100%', height: 300 }}>
                            <YoutubeIframe
                                height={300}
                                play={true}
                                videoId={videoId}
                                onChangeState={onStateChange}
                            />
                        </View>
                    </>
                )}
                {uses.length === 0 && (
                    <Text>반경 5km 내에 광고를 재생할 가게가 없습니다.</Text>
                )}
            </View>
        </ScrollView>
    );
};