// 현재 가게를 기준으로 반경 5km 반지름으로 하는 원의 경계를 딴 경우

import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, Alert } from "react-native";
import * as Location from 'expo-location';
import YoutubeIframe from 'react-native-youtube-iframe';

import Owner from '../../assets/images/owner.jpg';
import { ScrollView } from "react-native-gesture-handler";

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
                Alert.alert('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                // latitude: 35.10397238310485,
                longitude: location.coords.longitude,
                // longitude : 129.028492251304,
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
                console.error('Error fetching data:', error);
            }
        };

        fetchOwners();
    }, []);

    // 반경 5km 내에 있는지 확인
    const isWithinRadius = (lat1, lon1, lat2, lon2, radius = 2) => {
        const toRadians = degree => degree * (Math.PI / 180);
        const earthRadiusKm = 6371;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadiusKm * c;

        return distance <= radius;
    };

    useEffect(() => {
        if (location && owners.length > 0) {
            const nearbyOwners = owners.filter(owner => 
                isWithinRadius(location.latitude, location.longitude, owner.latitude, owner.longitude)
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
                Alert.alert('Invalid YouTube URL');
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
                <Text>현재 위치: {location ? `${location.latitude}, ${location.longitude}` : 'Loading...'}</Text>
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

