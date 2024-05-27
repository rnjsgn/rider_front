// geocoding 기술을 이용하여 지역을 구로 나누었던 경우

import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, Text, Image} from "react-native";
import * as Location from 'expo-location';
import YoutubeIframe from 'react-native-youtube-iframe';

import Owner from '../../assets/images/owner.jpg';
import { ScrollView } from "react-native-gesture-handler";

export const Video = () => {
    const video_sylte = StyleSheet.create({
        container: {
            flex: 1,
            // justifyContent: 'center',
            alignItems: 'center',
          },
        video:{
            width: '100%',
            height: 300,
        }
    })

    const [location, setLocation] = useState({});
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    

    // 위치 권한 요청 및 현재 위치 가져오기
    useEffect(() => {
        const requestLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                getCurrentLocation();
            }
        };

        const getCurrentLocation = async () => {
            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            reverseGeocode(location.coords.latitude, location.coords.longitude);
        };

        const reverseGeocode = async (latitude, longitude) => {
            const add = await Location.reverseGeocodeAsync({ latitude, longitude });
            setAddress(add[0].formattedAddress);
            setDistrict(add[0].district);
            // setDistrict('부산진구')
            // console.log(add[0])
        };

        requestLocationPermission();

    //     // 이미지 변경 간격(밀리초)
    //     const interval = setInterval(() => {
    //     // 다음 이미지로 인덱스를 변경
    //     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    //   }, 5000); // 3초마다 이미지 변경
  
      // 컴포넌트가 언마운트될 때 clearInterval로 interval 정리
      return () => clearInterval(interval);
    }, []);

    const [videoId, setVideoId] = useState('');
    const [owners, setOwners] = useState([]);
    const [uses, setUses] = useState([]);

    // 유튜브 URL에서 videoId 추출
    const extractVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    };

    useEffect(() => {
        (
            async () => {
                try {
                    const result = await fetch('http://192.168.116.169:3000/owner/all', {
                        method: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            mode: 'no-cors',
                        },
                    });
                    const owner_data = await result.json();
                    setOwners(owner_data.data);
                    // console.log(owners)
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        )();
    }, []);

    useEffect(() => {
        if (owners.length > 0 && district) {
            const uses = owners.filter(owner => owner.location === district);
            setUses(uses);
            // console.log(uses)
        }
    }, [owners, district]);

    useEffect(() => {
        (
          async () => {
              const url = uses[currentIndex]?.ad;
              const id = extractVideoId(url);
              if (id) {
                  setVideoId(id);
              } else {
                  alert('Invalid YouTube URL');
              }
          }
        )();
      }, [uses, currentIndex]);
    
      const onStateChange = (state) => {
        if (state === "ended") {
          // 마지막 영상이 끝나면 currentIndex를 0으로 리셋하거나, 다음 영상으로 이동
          setCurrentIndex((prevIndex) => (prevIndex + 1) % uses.length);
        }
      };
    
    return (
        <ScrollView>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>출력 화면</Text>
                <Text>현재 위치 : {district}</Text>
                <Text>가게 이름 : {uses[currentIndex]?.name}</Text>
                <Text>가게 번호 : {uses[currentIndex]?.tel}</Text>
                <Text>가게 위치 : {uses[currentIndex]?.location}</Text>
                {
                    district === uses[currentIndex]?.location
                    ?
                    <View style={{ width: '100%', height: 300 }}>
                        <YoutubeIframe
                            height={300}
                            play={true}
                            videoId={videoId}
                            onChangeState={onStateChange}
                        />
                    </View>
                    :
                    <Image source={Owner} />
                }
            </View>
        </ScrollView>
    );
}
