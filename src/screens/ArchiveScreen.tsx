// src/screens/ArchiveScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LogoHeader from '../components/LogoHeader';
import SearchIcon from '../assets/icons/search.svg';
import XIcon from '../assets/icons/X.svg';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { pitcherDummy } from '../data/pitcherDummy';

const ArchiveScreen = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const filteredPlayers = pitcherDummy.filter(player =>
    player.name.includes(search)
  );

  return (
    <View style={styles.container}>
      <LogoHeader title="기록실" />

      <View style={styles.searchContainer}>
        <SearchIcon width={30} height={30} style={styles.searchIconOutside} />
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="선수 이름을 입력하세요"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#BDBDBD"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <XIcon width={18} height={18} style={styles.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredPlayers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PitcherDetailScreen', { playerId: item.id })}
          >
            <View style={styles.card}>
              <Image source={item.image} style={styles.avatar} />
              <View style={styles.infoBox}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.team}>{item.team}</Text>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>이닝 </Text>
                  <Text style={styles.statValue}>{item.IP}</Text>
                  <Text style={styles.statDivider}>|</Text>
                  <Text style={styles.statLabel}>탈삼진 </Text>
                  <Text style={styles.statValue}>{item.SO}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ArchiveScreen;

// 스타일은 그대로 유지
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  searchIconOutside: {
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#408A21',
    borderRadius: 30,
    paddingHorizontal: 14,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 0,
  },
  icon: {
    marginLeft: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderColor: '#eee',
  },
  avatar: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    marginRight: 16,
    borderRadius: 30,
  },
  infoBox: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  team: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
  },
  statValue: {
    fontSize: 13,
    color: '#999',
    fontWeight: 'bold',
  },
  statDivider: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 6,
  },
});