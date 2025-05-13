import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { login } from '@react-native-seoul/kakao-login';
import axios from 'axios';

const MyPageScreen = () => {

  const handleKakaoLogin = async () => {
    try {
      const token = await login();
      console.log('카카오 로그인 성공', token);
      //성공확인용 alert
      Alert.alert('로그인 성공', `AccessToken: ${token.accessToken}`);

      //백엔드에 accesstoken 보내기
      //주소는 바꾸세요 smu에서 test한 주소임
      const response = await axios.post('http://172.20.26.173:8000/api/auth/kakao/', {
        access_token: token.accessToken,
      });
      
      console.log('백엔드 응답:', response.data);
    } catch (err) {
      const error = err as Error;  
      console.error('카카오 로그인 실패', error);
      //Alert.alert('로그인 실패', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>여기는 마이페이지 화면입니다!</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="카카오 로그인" onPress={handleKakaoLogin} />
      </View>
    </View>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});