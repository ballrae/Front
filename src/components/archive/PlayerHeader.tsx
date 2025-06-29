// src/components/archive/PlayerHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';


interface PlayerHeaderProps {
  id: string; 
  name: string;
  team: string;
  birth: string;
  pitch: string;
  bat: string;
  position: string;
  image?: any; // optional
}

// 생년월일 포맷팅
const formatBirthDate = (birth: string) => {
  const [year, month, day] = birth.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
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
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 40,
    marginRight: 20,
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