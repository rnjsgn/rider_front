import React, { useState } from "react";
import { StyleSheet, TextInput, View, Text, Button, Alert } from "react-native";

export const Login = () => {
    const login_sylte = StyleSheet.create({
        container: {
            flex: 1,
            // justifyContent: 'center',
            alignItems: 'center',
          },
    })

    const [no, setNo ] = useState('');
    const [pw, setPw ] = useState('');
    const [check, setCheck] = useState(false);

    const ownerSignIn = async () => {
        const result = await fetch('http://192.168.116.169:3000/owner/signin', {
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
            })
        })

        console.log(result.status)
        // 메인페이지 ------- (메인페이지 navigate 추가)
        // native 전용 tokenStorage 
        const d = await result.json();
        const token = d.data;

        if (result.status === 200) {
            Alert.alert("로그인에 성공하셨습니다.")
            const result2 = await fetch('http://192.168.116.169:3000/owner/', {
                method: 'get',
                headers: {
                    'Content-Type' : 'application/json',
                    Accept: 'application/json',
                    mode: 'no-cors',
                    'Access-Control-Allow-Origin':'*',
                    Authorization: `Bearer ${encodeURIComponent(token)}`,
                },
            })
            // console.log(result)
            const data = await result2.json();
            // 메인페이지 ------
            console.log(data);
        } else {
            console.log(result)
        }
    }

    return(
        <View style = {login_sylte.container}>
            <Text>로그인</Text>
            <TextInput
                placeholder = '사업자 번호'
                onChangeText={(text) => setNo(text)}
            />
            <TextInput
                placeholder = '비밀번호'
                onChangeText={(text) => setPw(text)}
            />
            <Button 
                title="로그인"
                onPress={ownerSignIn}
            />
        </View>
    )
}