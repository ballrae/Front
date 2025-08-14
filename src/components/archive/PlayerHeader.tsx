// src/components/archive/PlayerHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';


interface PlayerHeaderProps {
  id: number; 
  name: string;
  team: string;
  birth: string;
  pitch: string;
  bat: string;
  position: string;
  image?: any; // optional
}

// 생년월일 포맷팅
const formatBirthDate = (birth?: string) => {
  if (!birth) return '생년월일 정보 없음';
  try {
    const [year, month, day] = birth.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  } catch (e) {
    return '날짜 형식 오류';
  }
};

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ name, team, birth, pitch, bat, position, image }) => {
  return (
    <View style={styles.container}>
      <Image source={image || require('../../assets/dummy.png')} style={styles.avatar} />
      <View style={styles.infoBox}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.team}>{team}</Text>
        </View>
        <Text style={styles.detail}>{formatBirthDate(birth)}</Text>
        <Text style={styles.detail}>{`${pitch}${bat}`}</Text>
        <Text style={styles.detail}>{position}</Text>
      </View>
    </View>
  );
};

export default PlayerHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 20,
    marginBottom: 15,
  },
  infoBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
    marginBottom:4,
  },
  team: {
    fontSize: 12,
    color: '#444',
  },
  detail: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
});