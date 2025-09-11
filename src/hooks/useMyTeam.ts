import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MY_TEAM_KEY = 'myTeamId';

export const useMyTeam = () => {
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMyTeam = async () => {
    try {
      console.log("🔍 useMyTeam: 마이팀 불러오기 시작");
      const stored = await AsyncStorage.getItem(MY_TEAM_KEY);
      console.log("🔍 useMyTeam: AsyncStorage에서 마이팀 불러오기:", stored);
      
      // 상태를 동시에 업데이트
      setMyTeamId(stored);
      setLoading(false);
      
      console.log("🔍 useMyTeam: myTeamId 상태 설정 완료:", stored);
      console.log("🔍 useMyTeam: 로딩 완료");
    } catch (e) {
      console.error('useMyTeam: 마이팀 불러오기 실패:', e);
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