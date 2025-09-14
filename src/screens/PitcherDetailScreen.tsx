import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    axiosInstance
    .get(`/api/players/pitcher/`, {
      params: { id: playerId }
    })
      .then(response => {
        const raw = response.data.data;
        const metrics = raw.metrics ?? {};

        const mappedPitcher: Pitcher = {
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
          RAA_percentile: 0, // JSON에 없음
        };

        setPitcher(mappedPitcher);
      })
      .catch(error => {
        console.error('투수 데이터 불러오기 실패:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [playerId]);

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
      <Header showBackButton onBackPress={() => navigation.goBack()} title="" />
      
      <PlayerHeader
        id={pitcher.id}
        name={pitcher.name}
        team={teamNameMap[pitcher.team] ?? pitcher.team}
        position="투수"
        image={teamSymbols[pitcher.team.toLowerCase()]}
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

export default PitcherDetailScreen;

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