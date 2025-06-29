// screens/PitcherDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { pitcherDummy } from '../data/pitcherDummy';

import Header from '../components/Header';
import PlayerHeader from '../components/archive/PlayerHeader';
import PitcherBasicStats from '../components/archive/pitcher/PitcherBasicStats';
import PitcherValueStats from '../components/archive/pitcher/PitcherValueStats';

type PitcherRouteProp = RouteProp<RootStackParamList, 'PitcherDetailScreen'>;

const PitcherDetailScreen = () => {
  const route = useRoute<PitcherRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { playerId } = route.params;

  const pitcher = pitcherDummy.find(p => p.id === playerId);

  if (!pitcher) {
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
        onBackPress={() => navigation.goBack()} title={''} />
      <PlayerHeader
        id = {pitcher.id}
        name={pitcher.name}
        team={pitcher.team}
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
});