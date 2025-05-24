import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import teamLogoMap from '../constants/teamLogos';
import LogoHeader from '../components/LogoHeader';

interface Team {
  id: string;
  team_name: string;
}

const BoardScreen = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/teams/');
        const result = await response.json();

        // ✅ 정렬 추가
        const sorted = result.responseDto.sort((a: Team, b: Team) =>
          a.team_name.localeCompare(b.team_name, 'ko')
        );

        setTeams(sorted);
      } catch (error) {
        console.error('팀 목록 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const renderTeamItem = ({ item }: { item: Team }) => {
    const logoSource =
      teamLogoMap[item.id] || require('../assets/app_logos/ballrae_logo_white.png');

    return (
      <TouchableOpacity style={styles.teamItem}>
        <Image source={logoSource} style={styles.logo} />
        <Text style={styles.teamText}>{item.team_name} 게시판</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<LogoHeader title="게시판" />}
      />
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, // 게시판 리스트 간격
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 14,
  },
  teamText: {
    fontSize: 16,
    fontWeight: '600', // 세미볼드
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});