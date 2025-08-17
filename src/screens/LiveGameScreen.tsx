import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import teamLogoMap from '../constants/teamLogos';
import teamNameToId from '../constants/teamIdMap';
import Header from '../components/Header';
import FieldStatusBoard from '../components/livegame/FieldStatusBoard';
import PlayerInfoBoard from '../components/livegame/PlayerInfoBoard';
import LiveTextBroadcast from '../components/livegame/LiveTextBroadcast';

const LiveGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'LiveGameScreen'>>();
  const navigation = useNavigation();
  const { gameId, homeTeamName, awayTeamName, homeTeam, awayTeam,homeScore, awayScore, status } = route.params;

  const homeTeamId = teamNameToId[homeTeamName.split(' ')[0]];
  const awayTeamId = teamNameToId[awayTeamName.split(' ')[0]];

  const [selectedInning, setSelectedInning] = useState(1);

  return (
    <ScrollView style={styles.container}>
      <Header
        title={` ${awayTeamName.split(' ')[0]} vs ${homeTeamName.split(' ')[0]}`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

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
          {status === 'DONE' ? (
            <View style={{ marginBottom: 10 }}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>경기 종료</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.inningText}>{`${selectedInning}회`}</Text>
          )}

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
          homeTeam={homeTeam}     
          awayTeam={awayTeam}    
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
  },
  scoreBoxFull: {
    flexDirection: 'row',
    alignItems: 'flex-end', // 로고, 팀명, 점수 정렬 ↓로 맞추기
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
    marginBottom: 5,
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
  statusBadge: {
    backgroundColor: '#9DCC8A',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6, // 경기 종료와 스코어 사이 간격
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});