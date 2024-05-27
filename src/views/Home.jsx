import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';

import Superman from '../../assets/images/rider.jpg';
import Owner from '../../assets/images/owner.jpg';

const home_style = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
      },
    title: {
        color : 'skyblue',

        fontWeight: 'bold',
        fontSize: 30,

        paddingTop: 10,
    },
    img: {
        width: '100%',
        height: 200,
        
        marginTop: 20,
    },
    view: {
        width: '100%'
    },
    btn_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    button: {
        backgroundColor: 'skyblue',
        
        padding: 10,
        margin : 5,
        
        borderRadius: 5,
        
        width: 170,
        height: 65
    },
    btn_text: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16
    },
});

export const Home = () => {

    const imagePaths = [
        Superman,
        Owner
    ];

    const navigation = useNavigation();

    return(
        <View style={home_style.container}>
            <Text style={home_style.title}>라이더 광고 플랫폼</Text>
            {/* <Swiper 
                loop 
                timeout={3}
                showsButtons={false}
            >
                {imagePaths.map((imagePath, index) => (
                    <View key={index}>
                        <Image source={imagePath} style={home_style.img} />
                    </View>
                ))}
            </Swiper> */}
            <View style={home_style.btn_container}>
                <View style={home_style.row}>
                    <TouchableOpacity style={home_style.button} onPress={() => navigation.navigate('OwnerSignUp')}>
                        <Text style={home_style.btn_text}>광고주 회원가입</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={home_style.button} onPress={() => navigation.navigate('RiderSignUp')}>
                        <Text style={home_style.btn_text}>라이더 회원가입</Text>
                    </TouchableOpacity>
                </View>
                <View style={home_style.row}>
                    <TouchableOpacity style={home_style.button} onPress={() => navigation.navigate('Login')}>
                        <Text style={home_style.btn_text}>로그인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={home_style.button} onPress={() => navigation.navigate('Video')}>
                        <Text style={home_style.btn_text}>라이더 출력부분</Text>
                    </TouchableOpacity>
                </View>
                <View style={home_style.row}>
                    <TouchableOpacity style={home_style.button}>
                        <Text style={home_style.btn_text}>위치별 광고 리스트</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={home_style.button} onPress={() => navigation.navigate('Gps')}>
                        <Text style={home_style.btn_text}>라이더 위치 확인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}