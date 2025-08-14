import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Alert,
} from 'react-native';

//API
import axiosInstance from '../utils/axiosInstance';
//로그인
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '@react-native-seoul/kakao-login';

// 네비게이션
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

// 탭바 렌더링
import FadeInView from '../components/FadeInView';

// 기타
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
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const res = await axiosInstance.get('/api/users/me/', {
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
      setIsLoggedIn(false);
      Alert.alert('에러', '유저 정보를 불러오지 못했습니다.');
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const token = await login();
      console.log('Kakao access token:', token.accessToken);

      const res = await axiosInstance.post('/api/users/kakao/', {
        access_token: token.accessToken,
      });

      const { access, refresh } = res.data.data.tokens;
      if (!access || !refresh) {
        throw new Error('JWT 토큰이 응답에 포함되지 않았습니다.');
      }

      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      console.log('👉 Django JWT access token:', access);

      await fetchUserInfo();
    } catch (err) {
      console.error('카카오 로그인 실패:', err);
      Alert.alert('로그인 실패', '카카오 로그인 중 문제가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        onPress: async () => {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          setIsLoggedIn(false);
          setUserNickname('');
          setTeamName('');
          setTeamId('');
        },
      },
    ]);
  };

  const goToSetting = (type: 'broadcast' | 'alarm') => {
    navigation.navigate('SettingsScreen', { type });
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
    <FadeInView style={styles.container}>
      <Header title="마이" showBackButton={false} />

      <View style={styles.loginBox}>
        <Image source={teamLogoSource} style={styles.logo} />
        <View style={styles.loginTextBox}>
          {!isLoggedIn ? (
            <>
              <Text style={styles.text}>로그인을 해 주세요.</Text>
              <TouchableOpacity style={styles.kakaoBtnWrapper} onPress={handleKakaoLogin}>
                <KakaoButtonIcon width={160} height={42} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.text}>{userNickname}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyTeamScreen')}>
                <Text style={styles.subText}>{teamName || '마이팀 설정'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 설정 항목 */}
      {isLoggedIn ? (
        <View style={[styles.menuBox, styles.menuGroupTop]}>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MyTeamScreen')}>
            <Text style={styles.menuText}>마이팀 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => goToSetting('broadcast')}>
            <Text style={styles.menuText}>중계실 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => goToSetting('alarm')}>
            <Text style={styles.menuText}>알림 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.item, styles.noBorder]} onPress={handleLogout}>
            <Text style={[styles.menuText, styles.logout]}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.menuBox, styles.menuGroupTop]}>
          <TouchableOpacity style={styles.item} onPress={() => goToSetting('broadcast')}>
            <Text style={styles.menuText}>중계실 설정</Text>
          </TouchableOpacity>
        </View>
      )}
    </FadeInView>
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
    marginBottom: 20,
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
  menuBox: {
    marginTop: 5,
  },
  menuGroupTop: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
  },
  logout: {
    color: 'gray',
  },
});