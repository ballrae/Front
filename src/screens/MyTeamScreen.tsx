import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Text,
} from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance'; // ✅ axiosInstance 사용

const teams = [
  { id: 'DS', logo: require('../assets/team_logos/ds_logo.png') }, // 두산 베어스
  { id: 'LT', logo: require('../assets/team_logos/lt_logo.png') }, // 롯데 자이언츠
  { id: 'SS', logo: require('../assets/team_logos/ss_logo.png') }, // 삼성 라이온즈
  { id: 'HE', logo: require('../assets/team_logos/he_logo.png') }, // 키움 히어로즈
  { id: 'HH', logo: require('../assets/team_logos/hh_logo.png') }, // 한화 이글스
  { id: 'KA', logo: require('../assets/team_logos/ka_logo.png') }, // KIA 타이거즈
  { id: 'KT', logo: require('../assets/team_logos/kt_logo.png') }, // KT 위즈
  { id: 'LG', logo: require('../assets/team_logos/lg_logo.png') }, // LG 트윈스
  { id: 'NC', logo: require('../assets/team_logos/nc_logo.png') }, // NC 다이노스
  { id: 'SL', logo: require('../assets/team_logos/sl_logo.png') }, // SSG 랜더스
];

const MyTeamScreen = () => {
  const navigation = useNavigation();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!selectedTeamId) {
      Alert.alert('알림', '마이팀을 선택해주세요.');
      return;
    }

    try {
      await axiosInstance.patch('/api/users/myteam/', {
        team_id: selectedTeamId,
      });

      Alert.alert('완료', '마이팀이 설정되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error('마이팀 설정 실패', error);
      Alert.alert('에러', '마이팀 설정에 실패했습니다.');
    }
  };

  const renderItem = ({ item }: { item: { id: string; logo: any } }) => {
    const isSelected = item.id === selectedTeamId;
    return (
      <TouchableOpacity
        style={[styles.logoWrapper, isSelected && styles.selected]}
        onPress={() => setSelectedTeamId(item.id)}
      >
        <Image source={item.logo} style={styles.logo} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
<FlatList
  ListHeaderComponent={
    <Header
      title="마이팀 설정"
      showBackButton
      onBackPress={() => navigation.goBack()}
      showCompleteButton
      onCompletePress={handleComplete}
    />
  }
  data={teams}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  numColumns={2}
  // padding을 헤더 포함 전체가 아니라 리스트 항목에만 적용
  contentContainerStyle={styles.listOnlyContent}
/>
    </View>
  );
};

export default MyTeamScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    paddingHorizontal: 0,
  },
  listOnlyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  selected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});