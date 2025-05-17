import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { login } from '@react-native-seoul/kakao-login';
import axios from 'axios';

const MyPageScreen = () => {
  const [jwtToken, setJwtToken] = useState('');

  const handleKakaoLogin = async () => {
    try {
      const token = await login();
      Alert.alert('로그인 성공', `AccessToken: ${token.accessToken}`);

      const response = await axios.post('http://localhost:8000/api/auth/kakao/', {
        access_token: token.accessToken,
      });

      const jwtAccessToken = response.data.data.tokens.access;
      setJwtToken(jwtAccessToken);
      console.log('JWT access token:', jwtAccessToken);
    } catch (err) {
      console.error('카카오 로그인 실패', err);
      Alert.alert('에러', '카카오 로그인에 실패했습니다.');
    }
  };

  const handleSetMyTeam = async (teamId: string) => {
    try {
      const res = await axios.patch(
        'http://localhost:8000/api/auth/myteam/',
        { team_id: teamId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('마이팀 설정 성공', `설정된 팀: ${res.data.team_id}`);
    } catch (err) {
      console.error('마이팀 설정 실패', err);
      Alert.alert('에러', '마이팀 설정에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>여기는 마이페이지 화면입니다!</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="카카오 로그인" onPress={handleKakaoLogin} />
      </View>
      <View style={{ marginTop: 30 }}>
        <Button title="마이팀: KT 설정하기" onPress={() => handleSetMyTeam('KT')} />
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