// 투수
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

import Header from '../components/Header';
import PlayerHeader from '../components/archive/PlayerHeader';
import PitcherBasicStats from '../components/archive/pitcher/PitcherBasicStats';
import PitcherValueStats from '../components/archive/pitcher/PitcherValueStats';

import teamNameMap from '../constants/teamNames';

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
  S: number;
  IP: number;
  SO: number;
  ERA: number;
  FIP: number;
  WHIP: number;
  WAR: number;
  AVG: number;
  W_percentile: number;
  L_percentile: number;
  SO_percentile: number;
  ERA_percentile: number;
  FIP_percentile: number;
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
    axios.get(`http://3.237.44.38:8000/api/players/pitcher/${playerId}/`)
      .then(response => {
        const raw = response.data.data;

        const mappedPitcher: Pitcher = {
          id: raw.player.id,
          name: raw.player.player_name,
          team: raw.player.team_id,
          birth: '-', // 서버 응답에 없음
          pitch: '-', // 기본값
          bat: '-',   // 기본값

          G: raw.games,
          W: raw.stats.w ?? 0,
          L: raw.stats.l ?? 0,
          S: raw.stats.sv ?? 0,
          IP: raw.innings,
          SO: raw.strikeouts,
          ERA: raw.stats.era,
          FIP: raw.stats.fip,
          WHIP: raw.stats.whip,
          WAR: raw.stats.war,
          AVG: raw.stats.avg,

          // 퍼센타일은 아직 서버에 없으니 기본값
          W_percentile: 0,
          L_percentile: 0,
          SO_percentile: 0,
          ERA_percentile: 0,
          FIP_percentile: 0,
          WHIP_percentile: 0,
          WAR_percentile: 0,
          AVG_percentile: 0,

          K9: raw.stats['k/9'],
          BB9: raw.stats['bb/9'],
          K9_percentile: 0,
          BB9_percentile: 0,
          RAA_percentile: 0,
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
    <ScrollView
      style={styles.container}
    >
      <Header showBackButton onBackPress={() => navigation.goBack()} title="" />
      <PlayerHeader
        id={pitcher.id}
        name={pitcher.name}
        team={teamNameMap[pitcher.team] ?? pitcher.team}
        birth={pitcher.birth}
        pitch={pitcher.pitch}
        bat={pitcher.bat}
        position="투수"
      />
      <PitcherBasicStats
        G={pitcher.G}
        W={pitcher.W}
        L={pitcher.L}
        S={pitcher.S}
        IP={pitcher.IP}
        SO={pitcher.SO}
        ERA={pitcher.ERA}
        FIP={pitcher.FIP}
        WHIP={pitcher.WHIP}
        WAR={pitcher.WAR}
        AVG={pitcher.AVG}
        W_percentile={pitcher.W_percentile}
        L_percentile={pitcher.L_percentile}
        SO_percentile={pitcher.SO_percentile}
        ERA_percentile={pitcher.ERA_percentile}
        FIP_percentile={pitcher.FIP_percentile}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});