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
import homerunEffect from '../assets/effect/homerun_effect.json';
import { startGameLiveActivity, updateGameLiveActivity, endLiveActivity } from '../bridge/SharedData';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const prevScoreMapRef = useRef<Record<string, number>>({}); // gameId -> my팀 스코어
  const lastTriggeredRef = useRef<string>('');
  const [showScoreEffect, setShowScoreEffect] = useState(false);
  const hasShownEffectRef = useRef<boolean>(false); // 이팩트를 이미 보여줬는지 체크
  const [activeLiveActivity, setActiveLiveActivity] = useState<string | null>(null); // 현재 활성화된 라이브 액티비티 게임 ID
  const prevGameStatusRef = useRef<Record<string, string>>({}); // gameId -> 이전 상태
  const appState = useRef(AppState.currentState);
  const lastLiveActivityCheckRef = useRef<string>(''); // 마지막 체크한 게임 ID
  const lastLiveActivityTimeRef = useRef<number>(0); // 마지막 라이브액티비티 시작 시간

  // 현재 이닝 정보를 가져오는 함수
  const fetchCurrentInningInfo = async (gameId: string) => {
    try {
      // 1회부터 9회까지 확인해서 진행 중인 이닝 찾기
      for (let inning = 1; inning <= 9; inning++) {
        const res = await axiosInstance.get(`/api/games/${gameId}/relay/${inning}/`);
        const data = res.data?.data;
        const top = data.top?.atbats ?? [];
        const bot = data.bot?.atbats ?? [];
        
        const isOngoing = [...top, ...bot].some((ab: any) => ab.full_result === '(진행 중)');
        if (isOngoing) {
          const ongoingAtbat = [...top, ...bot].find((ab: any) => ab.full_result === '(진행 중)');
          const isTop = top.includes(ongoingAtbat);
          const half = isTop ? '초' : '말';
          
          return {
            inning: inning,
            half: half,
            pitcher: ongoingAtbat?.pitcher?.player_name || '투수',
            batter: ongoingAtbat?.actual_batter?.player_name || '타자'
          };
        }
      }
      return null;
    } catch (err) {
      console.error('현재 이닝 정보 가져오기 실패:', err);
      return null;
    }
  };

  // 라이브 액티비티 체크 함수 (분리)
  const checkAndStartLiveActivity = useCallback(async (parsedGames: Game[]) => {
    try {
      const myTeamId = await AsyncStorage.getItem('myTeamId');
      if (!myTeamId) return;

      console.log("🔍 마이팀 ID:", myTeamId);
      console.log("🔍 전체 경기 수:", parsedGames.length);
      
      // 마이팀의 라이브 경기만 감지 (LiveGameScreen과 동일한 로직)
      const myTeamLiveGame = parsedGames.find((g: Game) => {
        const isMyTeamsGame = g.homeTeam === myTeamId || g.awayTeam === myTeamId;
        return g.status === 'LIVE' && isMyTeamsGame;
      });

      console.log("🔍 마이팀 라이브 경기:", myTeamLiveGame ? `${myTeamLiveGame.homeTeamName} vs ${myTeamLiveGame.awayTeamName}` : "없음");

      // 중복 체크: 같은 게임이면 스킵
      const currentGameId = myTeamLiveGame?.id || 'none';
      const now = Date.now();
      const timeSinceLastCheck = now - lastLiveActivityTimeRef.current;
      
      if (lastLiveActivityCheckRef.current === currentGameId && timeSinceLastCheck < 30000) { // 30초 내에 같은 게임이면 스킵
        console.log("⏭️ 같은 게임이므로 라이브액티비티 체크 스킵 (30초 내)");
        return;
      }
      
      lastLiveActivityCheckRef.current = currentGameId;
      lastLiveActivityTimeRef.current = now;

      if (myTeamLiveGame) {
        // 라이브 액티비티가 아직 시작되지 않았거나 다른 경기인 경우
        if (!activeLiveActivity || activeLiveActivity !== myTeamLiveGame.id) {
          console.log("🚀 새로운 라이브 액티비티 시작!");
          
          // 기존 라이브 액티비티 종료
          if (activeLiveActivity) {
            console.log("🛑 기존 라이브 액티비티 종료");
            endLiveActivity();
          }

          // 현재 이닝 정보 가져오기
          const currentInningInfo = await fetchCurrentInningInfo(myTeamLiveGame.id);
          
          // 새로운 라이브 액티비티 시작
          const isMyTeamHome = myTeamLiveGame.homeTeam === myTeamId;
          const myTeamName = isMyTeamHome ? myTeamLiveGame.homeTeamName : myTeamLiveGame.awayTeamName;
          const oppTeamName = isMyTeamHome ? myTeamLiveGame.awayTeamName : myTeamLiveGame.homeTeamName;
          
          const inningText = currentInningInfo ? `${currentInningInfo.inning}회 ${currentInningInfo.half}` : "1회 초";
          const playerText = currentInningInfo ? `${currentInningInfo.pitcher} vs ${currentInningInfo.batter}` : "투수 vs 타자";
          
          const gameMessage = `⚾ ${myTeamName} vs ${oppTeamName}\n📊 ${myTeamLiveGame.awayScore || 0} : ${myTeamLiveGame.homeScore || 0}\n🏟️ ${inningText} | ${playerText}`;

              startGameLiveActivity({
                gameId: myTeamLiveGame.id,
                homeTeamName: myTeamLiveGame.homeTeamName,
                awayTeamName: myTeamLiveGame.awayTeamName,
                homeScore: myTeamLiveGame.homeScore || 0,
                awayScore: myTeamLiveGame.awayScore || 0,
                inning: currentInningInfo?.inning?.toString() || "1",
                half: currentInningInfo?.half || "초",
                homePlayer: currentInningInfo?.pitcher || "투수",
                awayPlayer: currentInningInfo?.batter || "타자",
                gameMessage: gameMessage,
                isLive: true
              });
          setActiveLiveActivity(myTeamLiveGame.id);
          console.log("🏟️ 마이팀 라이브 경기 감지! 라이브 액티비티 시작:", myTeamLiveGame.id);
        } else {
          console.log("🔄 기존 라이브 액티비티 업데이트");
          // 기존 라이브 액티비티 업데이트
          const isMyTeamHome = myTeamLiveGame.homeTeam === myTeamId;
          const myTeamName = isMyTeamHome ? myTeamLiveGame.homeTeamName : myTeamLiveGame.awayTeamName;
          const oppTeamName = isMyTeamHome ? myTeamLiveGame.awayTeamName : myTeamLiveGame.homeTeamName;
          
          const currentInningInfo = await fetchCurrentInningInfo(myTeamLiveGame.id);
          const inningText = currentInningInfo ? `${currentInningInfo.inning}회 ${currentInningInfo.half}` : "1회 초";
          const playerText = currentInningInfo ? `${currentInningInfo.pitcher} vs ${currentInningInfo.batter}` : "투수 vs 타자";
          
          const gameMessage = `⚾ ${myTeamName} vs ${oppTeamName}\n📊 ${myTeamLiveGame.awayScore || 0} : ${myTeamLiveGame.homeScore || 0}\n🏟️ ${inningText} | ${playerText}`;

              updateGameLiveActivity({
                homeScore: myTeamLiveGame.homeScore || 0,
                awayScore: myTeamLiveGame.awayScore || 0,
                inning: currentInningInfo?.inning?.toString() || "1",
                half: currentInningInfo?.half || "초",
                homePlayer: currentInningInfo?.pitcher || "투수",
                awayPlayer: currentInningInfo?.batter || "타자",
                gameMessage: gameMessage,
                isLive: true
              });
        }
      } else {
        // 마이팀 라이브 경기가 없으면 라이브 액티비티 종료
        if (activeLiveActivity) {
          console.log("🛑 마이팀 라이브 경기 없음! 라이브 액티비티 종료");
          endLiveActivity();
          setActiveLiveActivity(null);
        }
      }
    } catch (err) {
      console.error('라이브 액티비티 체크 실패:', err);
    }
  }, [activeLiveActivity]);

  const fetchGames = useCallback(async () => {
    try {
      // AsyncStorage에서 직접 마이팀 불러오기
      const myTeamId = await AsyncStorage.getItem('myTeamId');
      console.log("🔍 fetchGames에서 직접 마이팀 불러오기:", myTeamId);
      
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

        // 현재 경기 상태를 이전 상태로 저장
        if (myTeamId) {
          parsedGames.forEach((g: Game) => {
            if (g.homeTeam === myTeamId || g.awayTeam === myTeamId) {
              prevGameStatusRef.current[g.id] = g.status;
            }
          });
          
          // 라이브 액티비티 체크 (마이팀이 있을 때만)
          checkAndStartLiveActivity(parsedGames);
        } else {
          console.log("❌ 마이팀이 설정되지 않음");
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

  // 5분 간격 폴링 (화면이 켜져 있을 때만) - 라이브액티비티 중복 방지를 위해 간격 증가
  useEffect(() => {
    const FIVE_MIN = 5 * 60 * 1000; // 3분에서 5분으로 증가
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