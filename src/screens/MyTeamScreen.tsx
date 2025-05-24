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
  { id: 'OB', logo: require('../assets/team_logos/ob_logo.png') },
  { id: 'LT', logo: require('../assets/team_logos/lt_logo.png') },
  { id: 'SS', logo: require('../assets/team_logos/ss_logo.png') },
  { id: 'WO', logo: require('../assets/team_logos/wo_logo.png') },
  { id: 'HH', logo: require('../assets/team_logos/hh_logo.png') },
  { id: 'HT', logo: require('../assets/team_logos/ht_logo.png') },
  { id: 'KT', logo: require('../assets/team_logos/kt_logo.png') },
  { id: 'LG', logo: require('../assets/team_logos/lg_logo.png') },
  { id: 'NC', logo: require('../assets/team_logos/nc_logo.png') },
  { id: 'SK', logo: require('../assets/team_logos/sk_logo.png') },
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