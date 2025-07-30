import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import LogoHeader from '../components/LogoHeader';
import SearchIcon from '../assets/icons/search.svg';
import XIcon from '../assets/icons/X.svg';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';


import { filterPlayers } from '../utils/filterPlayer';


import teamNameMap from '../constants/teamNames';

import FadeInView from '../components/FadeInView';
import axios from 'axios';

interface Player {
  id: number;
  player_name: string;
  team_id: string;
  position: 'P' | 'B';
}

const ArchiveScreen = () => {
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    axios.get('http://3.237.44.38:8000/api/players/')
      .then(response => {
        setPlayers(response.data.data);
      })
      .catch(error => {
        console.error('API 요청 실패:', error);
      });
  }, []);

  const filteredPlayers = filterPlayers(players, search);

  return (
    <FadeInView style={styles.container}>
      <LogoHeader title="기록실" />

      <View style={styles.searchContainer}>
        <SearchIcon width={30} height={30} style={styles.searchIconOutside} />
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="검색어를 입력하세요"
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
        keyExtractor={(item) => `${item.position}-${item.id}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.position === 'P') {
                navigation.navigate('PitcherDetailScreen', { playerId: Number(item.id) });
              } else {
                navigation.navigate('BatterDetailScreen', { playerId: Number(item.id) });
              }
            }}
          >
            <View style={styles.card}>
              <Image source={require('../assets/dummy.png')} style={styles.avatar} />
              <View style={styles.infoBox}>
                <Text style={styles.name}>{item.player_name}</Text>
                <Text style={styles.team}>
                  {teamNameMap[item.team_id] ?? item.team_id}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </FadeInView>
  );
};

export default ArchiveScreen;

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
    borderBottomWidth: 1,
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
  },
});