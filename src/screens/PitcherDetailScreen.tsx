import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

import Header from '../components/Header';
import PlayerHeader from '../components/archive/PlayerHeader';
import PitcherBasicStats from '../components/archive/pitcher/PitcherBasicStats';
import PitcherValueStats from '../components/archive/pitcher/PitcherValueStats';

import teamNameMap from '../constants/teamNames';
import teamSymbols from '../constants/teamSymbols';
import { RootStackParamList } from '../navigation/RootStackParamList';

import axiosInstance from '../utils/axiosInstance';

// API 응답 캐시
const pitcherCache = new Map<string, { data: Pitcher; timestamp: number }>();
const PITCHER_CACHE_DURATION = 300000; // 5분 캐시


type PitcherRouteProp = RouteProp<RootStackParamList, 'PitcherDetailScreen'>;

interface Pitcher {
  id: number;
  name: string;
  team: string;
  birth: string;
  pitch: string;
  bat: string;
  G: number;
  W: number;
  L: number;
  SV: number;
  IP: number;
  SO: number;
  ERA: number;
  WHIP: number;
  WAR: number;
  AVG: number;
  W_percentile: number;
  L_percentile: number;
  SO_percentile: number;
  ERA_percentile: number;
  WHIP_percentile: number;
  WAR_percentile: number;
  AVG_percentile: number;
  K9: number;
  BB9: number;
  K9_percentile: number;
  BB9_percentile: number;
  RAA_percentile: number;
}

const PitcherDetailScreen = () => {
  const route = useRoute<PitcherRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { playerId } = route.params;

  const [pitcher, setPitcher] = useState<Pitcher | null>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 매핑 함수를 메모이제이션
  const mapPitcherData = useCallback((raw: any): Pitcher => {
    const metrics = raw.metrics ?? {};
    const raaData = raw.raa_data ?? {};

    return {
      id: raw.player.id,
      name: raw.player.player_name,
      team: raw.player.team_id,
      birth: '-',
      pitch: '-',
      bat: '-',

      G: raw.games ?? 0,
      W: raw.w ?? 0,
      L: raw.l ?? 0,
      SV: raw.sv ?? 0,
      IP: raw.innings ?? 0,
      SO: raw.strikeouts ?? 0,
      ERA: raw.era ?? 0,
      WHIP: raw.stats?.whip ?? 0,
      WAR: raw.war ?? 0,
      AVG: raw.stats?.avg ?? 0,

      W_percentile: metrics.w_percentile ?? 0,
      L_percentile: metrics.l_percentile ?? 0,
      SO_percentile: metrics.strikeouts_percentile ?? 0,
      ERA_percentile: metrics.era_percentile ?? 0,
      WHIP_percentile: metrics.whip_percentile ?? 0,
      WAR_percentile: metrics.war_percentile ?? 0,
      AVG_percentile: metrics.avg_percentile ?? 0,

      K9: raw.stats?.['k/9'] ?? 0,
      BB9: raw.stats?.['bb/9'] ?? 0,
      K9_percentile: metrics.k9_percentile ?? 0,
      BB9_percentile: metrics.bb9_percentile ?? 0,
      RAA_percentile: raaData.total_raa_percentile ?? 0,
    };
  }, []);

  useEffect(() => {
    const cacheKey = `pitcher_${playerId}`;
    const cached = pitcherCache.get(cacheKey);
    
    // 캐시된 데이터가 있고 5분 이내라면 캐시 사용
    if (cached && Date.now() - cached.timestamp < PITCHER_CACHE_DURATION) {
      setPitcher(cached.data);
      setLoading(false);
      return;
    }

    axiosInstance
      .get(`/api/players/pitcher/`, {
        params: { id: playerId }
      })
      .then(response => {
        const mappedPitcher = mapPitcherData(response.data.data);
        
        // 캐시에 저장
        pitcherCache.set(cacheKey, { data: mappedPitcher, timestamp: Date.now() });
        
        setPitcher(mappedPitcher);
      })
      .catch(error => {
        console.error('투수 데이터 불러오기 실패:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [playerId, mapPitcherData]);

  // 메모이제이션된 핸들러
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 메모이제이션된 계산값들
  const teamName = useMemo(() => 
    pitcher?.team ? teamNameMap[pitcher.team] ?? pitcher.team : '',
    [pitcher?.team]
  );

  const teamImage = useMemo(() => 
    pitcher?.team ? teamSymbols[pitcher.team.toLowerCase()] : null,
    [pitcher?.team]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#408A21" />
      </View>
    );
  }

  if (!pitcher) {
    return (
      <View style={styles.centered}>
        <Text>선수 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header showBackButton onBackPress={handleBackPress} title="" />
      
      <PlayerHeader
        id={pitcher.id}
        name={pitcher.name}
        team={teamName}
        position="투수"
        image={teamImage}
      />

      <PitcherBasicStats
        G={pitcher.G}
        W={pitcher.W}
        L={pitcher.L}
        SV={pitcher.SV}
        IP={pitcher.IP}
        SO={pitcher.SO}
        ERA={pitcher.ERA}
        WHIP={pitcher.WHIP}
        WAR={pitcher.WAR}
        AVG={pitcher.AVG}
        W_percentile={pitcher.W_percentile}
        L_percentile={pitcher.L_percentile}
        SO_percentile={pitcher.SO_percentile}
        ERA_percentile={pitcher.ERA_percentile}
        WHIP_percentile={pitcher.WHIP_percentile}
        WAR_percentile={pitcher.WAR_percentile}
        AVG_percentile={pitcher.AVG_percentile}
      />

      <PitcherValueStats
        K9={pitcher.K9}
        BB9={pitcher.BB9}
        K9_percentile={pitcher.K9_percentile}
        BB9_percentile={pitcher.BB9_percentile}
        RAA_percentile={pitcher.RAA_percentile}
      />
    </ScrollView>
  );
};

export default memo(PitcherDetailScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});