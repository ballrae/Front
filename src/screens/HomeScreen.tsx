// HomeScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, AppState,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axiosInstance from '../utils/axiosInstance';
import LogoHeader from '../components/LogoHeader';
import FadeInView from '../components/FadeInView';
import teamNameMap from '../constants/teamNames';
import teamLogoMap from '../constants/teamLogos';
import { useMyTeam } from '../hooks/useMyTeam';
import homerunEffect from '../assets/effect/homerun_effect.json';

LocaleConfig.locales['ko'] = {
  monthNames: [...Array(12).keys()].map((i) => `${i + 1}월`),
  monthNamesShort: [...Array(12).keys()].map((i) => `${i + 1}월`),
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const statusStyleMap: { [key: string]: string } = {
  LIVE: '#408A21',
  DONE: '#92C17D',
  SCHEDULED: '#7C7C7C',
  CANCELLED: '#000000', // 검정 배경
};

const getTodayDateStr = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  stadium: string;
  status: 'LIVE' | 'DONE' | 'SCHEDULED' | 'CANCELLED';
  startTime?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [showCalendar, setShowCalendar] = useState(false);
  const { myTeamId } = useMyTeam();
  const prevScoreMapRef = useRef<Record<string, number>>({}); // gameId -> my팀 스코어
  const lastTriggeredRef = useRef<string>('');
  const [showScoreEffect, setShowScoreEffect] = useState(false);
  const hasShownEffectRef = useRef<boolean>(false); // 이팩트를 이미 보여줬는지 체크

  const fetchGames = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/games/gamelist/${selectedDate}`);
      const json = res.data;

      if (json.status === 'OK') {
        const parsedGames = json.data
          .map((item: any) => {
            const [awayScore, homeScore] =
              typeof item.score === 'string' && item.score.includes(':')
                ? item.score.split(':').map(Number)
                : [null, null];

            return {
              id: item.id,
              homeTeam: item.home_team,
              awayTeam: item.away_team,
              homeTeamName: teamNameMap[item.home_team],
              awayTeamName: teamNameMap[item.away_team],
              homeScore,
              awayScore,
              stadium: item.stadium ?? '',
              status: (item.status ?? 'SCHEDULED').toUpperCase() as Game['status'],
              startTime: item.date ? item.date.slice(11, 16) : undefined,
            };
          })
          .sort((a: Game, b: Game) => {
            if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
            if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
            return 0;
          });

        setGames(parsedGames);

        // 마이팀 득점 감지 → 홈런/득점 이팩트 1회 재생 (화면에 처음 들어왔을 때만)
        if (myTeamId && !hasShownEffectRef.current) {
          // 가장 최근 득점을 찾기 위해 모든 경기를 순회하면서 최신 득점 찾기
          let latestScore: { gameId: string; score: number; timestamp: string } | null = null;
          
          parsedGames.forEach((g: Game) => {
            if (g.status !== 'LIVE') return;
            if (g.homeTeam !== myTeamId && g.awayTeam !== myTeamId) return;
            const myScore = g.homeTeam === myTeamId ? g.homeScore : g.awayScore;
            if (typeof myScore !== 'number' || myScore === 0) return;
            
            // 이전 스코어와 비교해서 득점이 있었는지 확인
            const prev = prevScoreMapRef.current[g.id];
            if (typeof prev === 'number' && myScore > prev) {
              // 가장 최근 득점 업데이트
              if (!latestScore || myScore > latestScore.score) {
                latestScore = { gameId: g.id, score: myScore, timestamp: Date.now().toString() };
              }
            }
            prevScoreMapRef.current[g.id] = myScore;
          });

          // 가장 최근 득점에 대해서만 이팩트 재생
          if (latestScore && !hasShownEffectRef.current) {
            setShowScoreEffect(true);
            hasShownEffectRef.current = true; // 이팩트를 보여줬다고 표시
          }
        }
      }
    } catch (err) {
      console.error('경기 데이터 불러오기 실패:', err);
    }
  }, [selectedDate]);

  // 처음 마운트/날짜 변경 시 1회 로드
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // 화면 포커스 시 최신화
  useFocusEffect(
    useCallback(() => {
      fetchGames();
    }, [fetchGames]),
  );

  // 앱이 포그라운드로 돌아올 때 최신화
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchGames();
      }
    });
    return () => sub.remove();
  }, [fetchGames]);

  // 5분 간격 폴링 (화면이 켜져 있을 때만)
  useEffect(() => {
    const FIVE_MIN = 3 * 60 * 1000;
    const id = setInterval(fetchGames, FIVE_MIN);
    return () => clearInterval(id);
  }, [fetchGames]);

  return (
    <FadeInView style={styles.container}>
      {showScoreEffect && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject as any, { zIndex: 9999 }] }>
          <LottieView
            source={homerunEffect}
            autoPlay
            loop={false}
            onAnimationFinish={() => setShowScoreEffect(false)}
            style={[StyleSheet.absoluteFillObject as any]}
          />
        </View>
      )}
      <TouchableOpacity onPress={() => setShowCalendar(true)}>
        <LogoHeader title="최근 경기" />
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={(day) => {
                const formatted = day.dateString.replace(/-/g, '');
                setSelectedDate(formatted);
                setShowCalendar(false);
              }}
              markedDates={{
                [selectedDate.slice(0, 4) + '-' + selectedDate.slice(4, 6) + '-' + selectedDate.slice(6, 8)]: {
                  selected: true,
                  selectedColor: '#408A21',
                },
              }}
              theme={{
                arrowColor: '#408A21',
                todayTextColor: '#FF4D4D',
                textDayFontWeight: 'bold',
                textMonthFontWeight: 'bold',
                textDayFontSize: 16,
                textMonthFontSize: 18,
              }}
            />
          </View>
        </View>
      </Modal>

      {games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../assets/app_logos/ballrae_title_logo.png')}
            style={styles.emptyLogo}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>오늘은 경기가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('LiveGameScreen', {
                  gameId: item.id,
                  homeTeam: item.homeTeam,
                  awayTeam: item.awayTeam,
                  homeTeamName: item.homeTeamName,
                  awayTeamName: item.awayTeamName,
                  homeScore: item.homeScore ?? 0,
                  awayScore: item.awayScore ?? 0,
                  status: item.status,
                })
              }
            >
              <View style={styles.row}>
                <View style={styles.teamLeft}>
                  <Image source={teamLogoMap[item.awayTeam]} style={styles.logo} />
                  <View style={styles.teamTextBoxLeft}>
                    <Text style={styles.teamTextLine}>{item.awayTeamName.split(' ')[0]}</Text>
                    <Text style={styles.teamTextLine}>{item.awayTeamName.split(' ')[1]}</Text>
                  </View>
                </View>

                <View style={styles.center}>
                  <Text style={styles.stadium}>{item.stadium}</Text>
                <View style={styles.scoreBox}>
                  {item.status === 'CANCELLED' ? (
                    <Text style={styles.cancelledText}>경기 취소</Text>
                  ) : (
                    <>
                      <Text style={styles.score}>{item.awayScore ?? '0'}</Text>
                      <Text style={styles.vs}>vs</Text>
                      <Text style={styles.score}>{item.homeScore ?? '0'}</Text>
                    </>
                  )}
                </View>
                <View
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor: statusStyleMap[item.status],
                      marginTop: item.status === 'CANCELLED' ? 4 : 6,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status === 'LIVE' && 'Live'}
                    {item.status === 'DONE' && '종료'}
                    {item.status === 'SCHEDULED' && (item.startTime ?? '예정')}
                    {item.status === 'CANCELLED' && '취소'}
                  </Text>
                </View>
                </View>

                <View style={styles.teamRight}>
                  <View style={styles.teamTextBoxRight}>
                    <Text style={styles.teamTextLine}>{item.homeTeamName.split(' ')[0]}</Text>
                    <Text style={styles.teamTextLine}>{item.homeTeamName.split(' ')[1]}</Text>
                  </View>
                  <Image source={teamLogoMap[item.homeTeam]} style={styles.logo} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </FadeInView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  card: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  teamTextBoxLeft: {
    marginLeft: 8,
  },
  teamTextBoxRight: {
    marginRight: 8,
    alignItems: 'flex-end',
  },
  teamTextLine: {
    fontSize: 13,
    lineHeight: 18,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stadium: {
    fontSize: 12,
    color: '#000',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  vs: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    marginRight: 10,
  },
  statusTag: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
    alignSelf: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 20,
    borderRadius: 12,
    width: '90%',
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  emptyLogo: {
    position: 'absolute',
    width: 290,
    height: 220,
    opacity: 0.08,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    zIndex: 10,
  },
  cancelledTag: {
  backgroundColor: '#000',
  paddingHorizontal: 10,
  paddingVertical: 3,
  borderRadius: 12,
  marginBottom: 4,
  },
  cancelledText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
});