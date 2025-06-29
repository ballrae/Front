// screens/BatterDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';

type BatterRouteProp = RouteProp<RootStackParamList, 'BatterDetailScreen'>;

const BatterDetailScreen = () => {
  const route = useRoute<BatterRouteProp>();
  const { playerId } = route.params;

  return (
    <View style={styles.container}>
      <Text>⚾ 타자 상세 화면</Text>
      <Text>선수 ID: {playerId}</Text>
      {/* 실제 데이터 기반 타자 스탯 화면 넣기 */}
    </View>
  );
};

export default BatterDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});