import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// 네비게이션
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
// 매핑
import teamLogoMap from '../constants/teamLogos';
import teamNameToId from '../constants/teamIdMap';
//컴포넌트
import Header from '../components/Header';
import FieldStatusBoard from '../components/livegame/FieldStatusBoard';
import PlayerInfoBoard from '../components/livegame/PlayerInfoBoard';
import LiveTextBroadcast from '../components/livegame/LiveTextBroadcast'

const innings = [1, 2, 3, 4, 5, 6, 7, 8, 9];


const LiveGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'LiveGameScreen'>>();
  const navigation = useNavigation();
  const { gameId, homeTeamName, awayTeamName, homeScore, awayScore } = route.params;
  const homeTeamId = teamNameToId[homeTeamName.split(' ')[0]];
  const awayTeamId = teamNameToId[awayTeamName.split(' ')[0]];

  const [selectedInning, setSelectedInning] = useState(1);

  return (
    <ScrollView style={styles.container}>
      <View>
        <Header
          title={` ${awayTeamName.split(' ')[0]} vs ${homeTeamName.split(' ')[0]}`}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <View style={{ marginHorizontal: -18 }}>
        <FieldStatusBoard />
      </View>

      {/* 스코어 */}
      <View style={styles.scoreBoxFull}>
        <View style={styles.teamBlockContainer}>
          <Image source={teamLogoMap[awayTeamId]} style={styles.logo} />
          <View style={[styles.teamBlock, { alignItems: 'flex-start' }]}>
            <Text style={styles.teamLabel}>{awayTeamName.split(' ')[0]}</Text>
            <Text style={styles.teamLabel}>{awayTeamName.split(' ')[1]}</Text>
          </View>
        </View>

        <View style={styles.scoreSet}>
          <Text style={styles.inningText}>{selectedInning}회</Text>
         <View style={styles.scoreNumbers}>
          <Text style={styles.score}>
            {awayScore !== null ? awayScore : '0'}
          </Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.score}>
            {homeScore !== null ? homeScore : '0'}
          </Text>
        </View>
        </View>

        <View style={styles.teamBlockContainer}>
          <View style={[styles.teamBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.teamLabel}>{homeTeamName.split(' ')[0]}</Text>
            <Text style={styles.teamLabel}>{homeTeamName.split(' ')[1]}</Text>
          </View>
          <Image source={teamLogoMap[homeTeamId]} style={styles.logo} />
        </View>
      </View>

      {/* 투타 정보 */}
      <View style={{ marginBottom: 24 }}>
        <PlayerInfoBoard />
      </View>

        <View style={{ marginBottom: 24 }}>
         <LiveTextBroadcast
            gameId={gameId}
            selectedInning={selectedInning}
            setSelectedInning={setSelectedInning}
            />
        </View>      
    </ScrollView>
  );
};

export default LiveGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
   // paddingHorizontal:5,
  },
  scoreBoxFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  teamBlockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  teamBlock: {
    marginHorizontal: 6,
  },
  teamLabel: {
    fontSize: 13,
  },
  scoreSet: {
    alignItems: 'center',
  },
  scoreNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 25,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  vs: {
    fontSize: 25,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  inningText: {
    fontSize: 14,
    marginBottom: 4,
  },
  inningTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inningTabText: {
    fontSize: 14,
    color: '#888',
  },
  selectedTab: {
    fontWeight: 'bold',
    color: '#408A21',
    textDecorationLine: 'underline',
  },
  inningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  playerImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 24,
  },
  batterName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pitchText: {
    fontSize: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    marginTop: 4,
  },
});