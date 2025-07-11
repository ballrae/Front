import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { batterDummy } from '../data/batterDummy';

import Header from '../components/Header';
import PlayerHeader from '../components/archive/PlayerHeader';
import BatterBasicStats from '../components/archive/batter/BatterBasicStats';
import BatterAdvancedStats from '../components/archive/batter/BatterAdvancedStats';
import BatterValueStats from '../components/archive/batter/BatterValueStats';
import GroundHeatMap from '../components/archive/batter/GroundHeatMap'; // 히트맵 컴포넌트 import
// (필요 시 아래에 BatterBasicStats, BatterValueStats 등 추가)

type BatterRouteProp = RouteProp<RootStackParamList, 'BatterDetailScreen'>;

const BatterDetailScreen = () => {
  const route = useRoute<BatterRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { playerId } = route.params;

  // playerId가 string일 경우 변환 필요 (b.id: number라면)
   const batter = batterDummy.find(p => p.id === playerId);

  if (!batter) {
    return (
      <View style={styles.container}>
        <Text>선수 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header
        showBackButton
        onBackPress={() => navigation.goBack()}
        title=""
      />
      <PlayerHeader
        id= {batter.id}
        name={batter.name}
        team={batter.team}
        birth={batter.birth}
        pitch={batter.pitch}
        bat={batter.bat}
        position={batter.position}
        image={batter.image}
      />
      <GroundHeatMap />

      {/* 기본 */}
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
      
      {/* 심화 */}
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
});