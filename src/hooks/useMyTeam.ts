import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MY_TEAM_KEY = 'myTeamId';

export const useMyTeam = () => {
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMyTeam = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_TEAM_KEY);
      setMyTeamId(stored);
    } catch (e) {
      console.error('마이팀 불러오기 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveMyTeam = async (teamId: string) => {
    try {
      await AsyncStorage.setItem(MY_TEAM_KEY, teamId);
      setMyTeamId(teamId);
    } catch (e) {
      console.error('마이팀 저장 실패:', e);
    }
  };

  useEffect(() => {
    loadMyTeam();
  }, []);

  return { myTeamId, setMyTeamIdInStorage: saveMyTeam, loading };
};