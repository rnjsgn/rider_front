import React, { useState } from "react";
import { StyleSheet, TextInput, View, Text, Button, Alert} from "react-native";

export const RiderSignUp = () => {
    const signup_sylte = StyleSheet.create({
        container: {
            flex: 1,
            // justifyContent: 'center',
            alignItems: 'center',
          },
    })

    const [no, setNo ] = useState('');
    const [pw, setPw ] = useState('');
    const [name, setName ] = useState('');
    const [location, setLocation ] = useState('');
    const [tel, setTel ] = useState('');

    const riderSignUp = async () => {
        const result = await fetch('http://192.168.116.169:3000/rider/signup', {
            method: 'post',
            headers: {
                'Content-Type' : 'application/json',
                Accept: 'application/json',
                mode: 'no-cors',
                'Access-Control-Allow-Origin':'*',
            },
            body : JSON.stringify({
                no : no,
                pw : pw,
                name : name,
                location : location,
                tel : tel,
            })
        })

        if (result.status === 200) {
            Alert.alert("회원가입에 성공하셨습니다.")
            // console.log(result)
        } else {
            console.log(result)
        }
    }

    return(
        <View style = {signup_sylte.container}>
            <Text>라이더 회원가입</Text>
            <TextInput
                placeholder = '오토바이 번호'
                onChangeText={(text) => setNo(text)}
            />
            <TextInput
                placeholder = '비밀번호'
                onChangeText={(text) => setPw(text)}
            />
            <TextInput
                placeholder = '배달원 이름'
                onChangeText={(text) => setName(text)}
            />
            <TextInput
                placeholder = '주 배달 지역'
                onChangeText={(text) => setLocation(text)}
            />
            <TextInput
                placeholder = '전화 번호'
                onChangeText={(text) => setTel(text)}
            />
            <Button
                title="회원가입"
                onPress={() => riderSignUp()}
            />
        </View>
    )
}