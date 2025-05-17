import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import axios from 'axios';

interface Team {
  id: string;              
  team_name: string;
  team_logo: string;       
}

const BoardScreen = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/teams/');
        setTeams(response.data.responseDto); // 서버 응답 그대로 활용
      } catch (error) {
        console.error('팀 목록 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const renderTeamItem: ListRenderItem<Team> = ({ item }) => (
    <TouchableOpacity style={styles.teamItem}>
      <View style={styles.logoWrapper}>
        <Image source={{ uri: item.team_logo }} style={styles.logo} />
      </View>
      <Text style={styles.teamText}>{item.team_name} 게시판</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>게시판</Text>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamItem}
      />
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logoWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logo: {
    width: 40,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  teamText: {
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});