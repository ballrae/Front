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

// 네비게이션
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

// 검색
import { filterPlayers } from '../utils/filterPlayer';

// 매핑
import teamNameMap from '../constants/teamNames';
import teamSymbolMap from '../constants/teamSymbols';

import FadeInView from '../components/FadeInView';

// axiosInstance
import axiosInstance from '../utils/axiosInstance';

// ✅ LiveActivity 테스트
import { startLiveActivity } from '../bridge/SharedData';

interface PlayerMain {
  player: {
    id: number;
    player_name: string;
    team_id: string;
    position: 'P' | 'B';
  };
  stats: {
    inn?: number;
    k?: number;
    avg?: number;
    ops?: number;
  };
}

const ArchiveScreen = () => {
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState<PlayerMain[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    axiosInstance
      .get('/api/players/main/')
      .then((response) => {
        setPlayers(response.data.data);
      })
      .catch((error) => {
        console.error('선수 정보 요청 실패:', error);
      });
  }, []);

  const filteredPlayers = filterPlayers(players, search);

  return (
    <FadeInView style={styles.container}>
      <LogoHeader title="기록실" />

      {/* ✅ LiveActivity 시작 버튼 하나만 */}
      <View style={styles.testContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            console.log('✅ LiveActivity 테스트 시작');
            startLiveActivity("📣 기록실에서 시작!");
          }}
        >
          <Text style={styles.testButtonText}>✅ LiveActivity 시작</Text>
        </TouchableOpacity>
      </View>

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
        keyExtractor={(item) => `${item.player.position}-${item.player.id}`}
        renderItem={({ item }) => {
          const teamId = item.player.team_id.toLowerCase();
          const teamImage = teamSymbolMap[teamId];

          return (
            <TouchableOpacity
              onPress={() => {
                if (item.player.position === 'P') {
                  navigation.navigate('PitcherDetailScreen', { playerId: item.player.id });
                } else {
                  navigation.navigate('BatterDetailScreen', { playerId: item.player.id });
                }
              }}
            >
              <View style={styles.card}>
                <Image
                  source={teamImage ?? require('../assets/app_logos/ballrae_logo_green.png')}
                  style={styles.avatar}
                />
                <View style={styles.infoBox}>
                  <Text style={styles.name}>{item.player.player_name}</Text>
                  <Text style={styles.team}>
                    {teamNameMap[item.player.team_id] ?? item.player.team_id}
                  </Text>

                  {item.stats && (
                    item.player.position === 'P' ? (
                      <Text style={styles.stat}>
                        이닝 <Text style={styles.bold}>{item.stats.inn ?? '-'}</Text> | 탈삼진 <Text style={styles.bold}>{item.stats.k ?? '-'}</Text>
                      </Text>
                    ) : (
                      <Text style={styles.stat}>
                        타율 <Text style={styles.bold}>{item.stats.avg?.toFixed(3) ?? '-'}</Text> | OPS <Text style={styles.bold}>{item.stats.ops?.toFixed(3) ?? '-'}</Text>
                      </Text>
                    )
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
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
  testContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 16,
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
  stat: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
});