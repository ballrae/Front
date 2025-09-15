// src/components/archive/PlayerHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';


interface PlayerHeaderProps {
  id: number; 
  name: string;
  team: string;
  position: string;
  image?: any; // optional
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ name, team, position, image }) => {
  return (
    <View style={styles.container}>
      <Image source={image || require('../../assets/dummy.png')} style={styles.avatar} />
      <View style={styles.infoBox}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.team}>{team}</Text>
        </View>
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
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
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