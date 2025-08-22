import React, { useState, useEffect } from 'react';
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
import axiosInstance from '../utils/axiosInstance';

const LiveGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'LiveGameScreen'>>();
  const navigation = useNavigation();
  const { gameId, homeTeamName, awayTeamName, homeTeam, awayTeam, status } = route.params;

  const homeTeamId = teamNameToId[homeTeamName.split(' ')[0]];
  const awayTeamId = teamNameToId[awayTeamName.split(' ')[0]];

  const [selectedInning, setSelectedInning] = useState<number>(1);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [pitcherPcode, setPitcherPcode] = useState<string | null>(null);
  const [batterPcode, setBatterPcode] = useState<string | null>(null);
  const [pitcherName, setPitcherName] = useState<string | null>(null);
  const [batterName, setBatterName] = useState<string | null>(null); 
  const [currentHalf, setCurrentHalf] = useState<'top' | 'bot'>('top');
  const [maxInning, setMaxInning] = useState(9);

  useEffect(() => {
    const fetchCurrentInning = async () => {
      try {
        for (let inning = 1; inning <= 11; inning++) {
          const res = await axiosInstance.get(`/api/games/${gameId}/relay/${inning}/`);
          const data = res.data?.data;
          const top = data.top?.atbats ?? [];
          const bot = data.bot?.atbats ?? [];

          // 이 코드를 바로 밑에 추가
          if ([...top, ...bot].length > 0) {
            setMaxInning(prev => Math.max(prev, inning));
          }

          const isOngoing = [...top, ...bot].some(
            (atbat: any) => atbat.full_result === '(진행 중)'
          );

          if (isOngoing) {
            setSelectedInning(inning);

            const ongoingAtbat = [...top, ...bot].find(
              (atbat: any) => atbat.full_result === '(진행 중)'
            );

            if (ongoingAtbat) {

              const isTop = top.includes(ongoingAtbat);
              setCurrentHalf(isTop ? 'top' : 'bot'); 


              const { pitcher, actual_batter, score } = ongoingAtbat;
              if (pitcher?.pcode && actual_batter?.pcode) {
                setPitcherPcode(pitcher.pcode);
                setBatterPcode(actual_batter.pcode);
                setPitcherName(pitcher.player_name);  
                setBatterName(actual_batter.player_name); 
              }

              if (score) {
                const [away, home] = score.split(':').map(Number);
                setAwayScore(away);
                setHomeScore(home);
              }
            }

            return;
          }
        }

        setSelectedInning(9);
      } catch (err) {
        console.error('이닝 자동 설정 실패:', err);
      }
    };

    fetchCurrentInning();
  }, [gameId]);

  return (
    <ScrollView style={styles.container}>
      <Header
        title={` ${awayTeamName.split(' ')[0]} vs ${homeTeamName.split(' ')[0]}`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={{ marginHorizontal: -18 }}>
        <FieldStatusBoard
          gameId={gameId}
          selectedInning={selectedInning}
          setSelectedInning={setSelectedInning}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
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
            <Text style={styles.score}>{awayScore}</Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={styles.score}>{homeScore}</Text>
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
       <PlayerInfoBoard
      pitcherPcode={pitcherPcode}
      batterPcode={batterPcode}
      pitcherName={pitcherName}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      batterName={batterName}
      currentHalf={currentHalf}
    />
      </View>

      <View style={{ marginBottom: 24 }}>
        <LiveTextBroadcast
          gameId={gameId}
          selectedInning={selectedInning}
          setSelectedInning={setSelectedInning}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          maxInning={maxInning}
        />
      </View>
    </ScrollView>
  );
};

export default LiveGameScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scoreBoxFull: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  statusBadge: {
    backgroundColor: '#9DCC8A',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});