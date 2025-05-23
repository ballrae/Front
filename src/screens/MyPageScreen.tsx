import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import Header from '../components/Header';
import KakaoButtonIcon from '../assets/kakao_btn.svg';
import teamLogoMap from '../constants/teamLogos';

const MyPageScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  const [jwtToken, setJwtToken] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUserInfo = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:8000/api/users/me/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = res.data;
      setJwtToken(token);
      setUserNickname(user.user_nickname || '');
      setTeamName(user.team_name || '');
      setTeamId(user.team_id || '');
      setIsLoggedIn(true);
    } catch (error) {
      console.error('유저 정보 불러오기 실패:', error);
      Alert.alert('에러', '유저 정보를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserInfo();
    }
  }, [isFocused]);

  const teamLogoSource = teamId && teamLogoMap[teamId]
    ? teamLogoMap[teamId]
    : require('../assets/app_logos/ballrae_logo_white.png');

  return (
    <View style={styles.container}>
      <Header title="마이" showBackButton={false} />
      {!isLoggedIn ? (
        <View style={styles.loginBox}>
          <Image source={require('../assets/app_logos/ballrae_logo_white.png')} style={styles.logo} />
          <View style={styles.loginTextBox}>
            <Text style={styles.text}>로그인을 해 주세요.</Text>
            <TouchableOpacity style={styles.kakaoBtnWrapper}>
              <KakaoButtonIcon width={160} height={42} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.loginBox}>
          <Image source={teamLogoSource} style={styles.logo} />
          <View style={styles.loginTextBox}>
            <Text style={styles.text}>{userNickname}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyTeamScreen')}>
              <Text style={styles.subText}>{teamName || '마이팀 설정'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
    borderRadius: 50,
  },
  loginTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subText: {
    fontSize: 14,
    color: '#888',
  },
  kakaoBtnWrapper: {
    alignSelf: 'flex-start',
  },
});