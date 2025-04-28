import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { login } from '@react-native-seoul/kakao-login';

const MyPageScreen = () => {

  const handleKakaoLogin = async () => {
    try {
      const token = await login();
      console.log('카카오 로그인 성공', token);
      Alert.alert('로그인 성공', `AccessToken: ${token.accessToken}`);
    } catch (err) {
      const error = err as Error;   // 👈 추가 (명시적 타입 캐스팅)
      console.error('카카오 로그인 실패', error);
      Alert.alert('로그인 실패', error.message);
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