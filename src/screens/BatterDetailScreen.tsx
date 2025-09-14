import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '../components/Header';
import PlayerHeader from '../components/archive/PlayerHeader';
import BatterBasicStats from '../components/archive/batter/BatterBasicStats';
import BatterAdvancedStats from '../components/archive/batter/BatterAdvancedStats';
import BatterValueStats from '../components/archive/batter/BatterValueStats';
import GroundHeatMap from '../components/archive/batter/GroundHeatMap';

import teamNameMap from '../constants/teamNames';
import teamSymbolMap from '../constants/teamSymbols';
import { RootStackParamList } from '../navigation/RootStackParamList';
import axiosInstance from '../utils/axiosInstance';

type BatterRouteProp = RouteProp<RootStackParamList, 'BatterDetailScreen'>;

interface BatterData {
  id: number;
  name: string;
  team: string;
  birth: string;
  pitch: string;
  bat: string;
  position: string;
  image: any;
  G: number;
  AVG: number;
  WAR: number;
  wRC: number;
  OBP: number;
  SLG: number;
  OPS: number;
  HR: number;
  WAR_percentile: number;
  wRCp_percentile: number;
  OBP_percentile: number;
  SLG_percentile: number;
  OPS_percentile: number;
  HR_percentile: number;
  BABIP: number;
  IsoP: number;
  BBK: number;
  BABIP_percentile: number;
  IsoP_percentile: number;
  BBK_percentile: number;
  attackRAA: number;
  defenseRAA: number;
  baseRAA: number;
  throwRAA: number;
  runRAA: number;
  overallRAA: number;
}

const BatterDetailScreen = () => {
  const route = useRoute<BatterRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { playerId } = route.params;

  const [batter, setBatter] = useState<BatterData | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  axiosInstance
    .get(`/api/players/batter/`, {
      params: { id: playerId }
    })
    .then((res) => {
      const raw = res.data.data;
      const metrics = raw.metrics ?? {};
      const teamId = raw.player.team_id.toLowerCase();

      const mappedBatter: BatterData = {
        id: raw.player.id,
        name: raw.player.player_name,
        team: raw.player.team_id,
        birth: '-',
        pitch: '-',
        bat: '-',
        position: '타자',
        image: teamSymbolMap[teamId] ?? null,
        G: raw.games ?? 0,
        AVG: raw.stats.avg ?? 0,
        WAR: raw.war ?? 0,
        wRC: raw.wrc ?? 0,
        OBP: raw.stats.obp ?? 0,
        SLG: raw.stats.slg ?? 0,
        OPS: raw.stats.ops ?? 0,
        HR: raw.homeruns ?? 0,
        WAR_percentile: metrics.war_percentile ?? 0,
        wRCp_percentile: metrics.wrc_percentile ?? 0,
        OBP_percentile: metrics.obp_percentile ?? 0,
        SLG_percentile: metrics.slg_percentile ?? 0,
        OPS_percentile: metrics.ops_percentile ?? 0,
        HR_percentile: metrics.homeruns_percentile ?? 0,
        BABIP: raw.babip ?? 0,
        IsoP: raw.stats.isop ?? 0,
        BBK: raw.stats['bb/k'] ?? 0,
        BABIP_percentile: metrics.babip_percentile ?? 0,
        IsoP_percentile: metrics.iso_percentile ?? 0,
        BBK_percentile: metrics.bb_k_percentile ?? 0,
        attackRAA: 0,
        defenseRAA: 0,
        baseRAA: 0,
        throwRAA: 0,
        runRAA: 0,
        overallRAA: 0,
      };

      setBatter(mappedBatter);
      setLoading(false);
    })
    .catch((err) => {
      console.error('타자 정보 로딩 실패:', err);
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

  if (!batter) {
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
        id={batter.id}
        name={batter.name}
        team={teamNameMap[batter.team] ?? batter.team}
        position={batter.position}
        image={batter.image}
      />
      <GroundHeatMap />

      <BatterBasicStats
        G={batter.G}
        AVG={batter.AVG}
        WAR={batter.WAR}
        wRC={batter.wRC}
        OBP={batter.OBP}
        SLG={batter.SLG}
        OPS={batter.OPS}
        HR={batter.HR}
        WAR_percentile={batter.WAR_percentile}
        wRC_percentile={batter.wRCp_percentile}
        OBP_percentile={batter.OBP_percentile}
        SLG_percentile={batter.SLG_percentile}
        OPS_percentile={batter.OPS_percentile}
        HR_percentile={batter.HR_percentile}
      />

      <BatterAdvancedStats
        BABIP={batter.BABIP}
        IsoP={batter.IsoP}
        BBK={batter.BBK}
        BABIP_percentile={batter.BABIP_percentile}
        IsoP_percentile={batter.IsoP_percentile}
        BBK_percentile={batter.BBK_percentile}
        HR_percentile={batter.HR_percentile}
      />

      <BatterValueStats
        attackRAA={batter.attackRAA}
        defenseRAA={batter.defenseRAA}
        baseRAA={batter.baseRAA}
        throwRAA={batter.throwRAA}
        runRAA={batter.runRAA}
        overallRAA={batter.overallRAA}
      />
    </ScrollView>
  );
};

export default BatterDetailScreen;

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