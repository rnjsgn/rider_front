// import React, { useState } from "react";
// import { StyleSheet, TextInput, View, Text, Button, Alert } from "react-native";

// export const OwnerSignUp = () => {
//     const signup_sylte = StyleSheet.create({
//         container: {
//             flex: 1,
//             // justifyContent: 'center',
//             alignItems: 'center',
//           },
//     })

//     const [no, setNo ] = useState('');
//     const [pw, setPw ] = useState('');
//     const [name, setName ] = useState('');
//     const [location, setLocation ] = useState('');
//     const [tel, setTel ] = useState('');
//     const [ad, setAd ] = useState('');

//     const ownerSignUp = async () => {
//         const result = await fetch('http://192.168.116.169:3000/owner/signup', {
//             method: 'post',
//             headers: {
//                 'Content-Type' : 'application/json',
//                 Accept: 'application/json',
//                 mode: 'no-cors',
//                 'Access-Control-Allow-Origin':'*',
//             },
//             body : JSON.stringify({
//                 no : no,
//                 pw : pw,
//                 name : name,
//                 location : location,
//                 tel : tel,
//                 ad : ad,
//             })
//         })

//         console.log(result.status)

//         if (result.status === 200) {
//             Alert.alert("회원가입에 성공하셨습니다.")
//             // console.log(result)
//         } else {
//             console.log(result)
//         }
//     }

//     return(
//         <View style = {signup_sylte.container}>
//             <Text>광고주 회원가입</Text>
//             <TextInput
//                 onChangeText={(text) => setNo(text)}
//                 placeholder = '사업자 번호'
//             />
//             <TextInput
//                 onChangeText={(text) => setPw(text)}
//                 placeholder = '비밀번호'
//             />
//             <TextInput
//                 onChangeText={(text) => setName(text)}
//                 placeholder = '가게 이름'
//             />
//             <TextInput
//                 onChangeText={(text) => setLocation(text)}
//                 placeholder = '가게 위치'
//             />
//             <TextInput
//                 onChangeText={(text) => setTel(text)}
//                 placeholder = '가게 번호'
//             />
//             <TextInput
//                 onChangeText={(text) => setAd(text)}
//                 placeholder= '광고 등록'
//             />
//             <Button
//                 title="회원가입"
//                 onPress={() => ownerSignUp()}
//             />
//         </View>
//     )
// }

// ----------------------------------------------------------------------------------
// 위도 경도 입력 원과 사각형 경계 확인

import React, { useState } from "react";
import { StyleSheet, TextInput, View, Text, Button, Alert } from "react-native";
import * as Location from 'expo-location';

export const OwnerSignUp = () => {
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
    const [latitude, setLatitude ] = useState('');
    const [longitude, setLongtitude] = useState('');
    const [tel, setTel ] = useState('');
    const [ad, setAd ] = useState('');

    const ownerSignUp = async () => {
        const result = await fetch('http://192.168.116.169:3000/owner/signup', {
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
                latitude : latitude,
                longitude : longitude,
                tel : tel,
                ad : ad,
            })
        })

        console.log(result.status)

        if (result.status === 200) {
            Alert.alert("회원가입에 성공하셨습니다.")
            // console.log(result)
        } else {
            console.log(result)
        }
    }

    return(
        <View style = {signup_sylte.container}>
            <Text>광고주 회원가입</Text>
            <TextInput
                onChangeText={(text) => setNo(text)}
                placeholder = '사업자 번호'
            />
            <TextInput
                onChangeText={(text) => setPw(text)}
                placeholder = '비밀번호'
            />
            <TextInput
                onChangeText={(text) => setName(text)}
                placeholder = '가게 이름'
            />
            <TextInput
                onChangeText={(text) => setLatitude(text)}
                placeholder = '가게 위치(위도)'
            />
            <TextInput
                onChangeText={(text) => setLongtitude(text)}
                placeholder = '가게 위치(경도)'
            />
            <TextInput
                onChangeText={(text) => setTel(text)}
                placeholder = '가게 번호'
            />
            <TextInput
                onChangeText={(text) => setAd(text)}
                placeholder= '광고 등록'
            />
            <Button
                title="회원가입"
                onPress={() => ownerSignUp()}
            />
        </View>
    )
}
