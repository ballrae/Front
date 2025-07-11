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
import axiosInstance from '../utils/axiosInstance';
import teamLogoMap from '../constants/teamLogos';

const teams = Object.entries(teamLogoMap).map(([id, logo]) => ({ id, logo }));

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
          <View style={{ marginHorizontal: -20 }}>
            <Header
              title="마이팀 설정"
              showBackButton
              onBackPress={() => navigation.goBack()}
              showCompleteButton
              onCompletePress={handleComplete}
            />
          </View>
        }
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
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