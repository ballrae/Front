// LiveGameScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import { RootStackParamList } from '../navigation/RootStackParamList';
import { useMyTeam } from '../hooks/useMyTeam';

import teamLogoMap from '../constants/teamLogos';
import teamNameToId from '../constants/teamIdMap';
import Header from '../components/Header';
import FieldStatusBoard from '../components/livegame/FieldStatusBoard';
import PlayerInfoBoard from '../components/livegame/PlayerInfoBoard';
import LiveTextBroadcast from '../components/livegame/LiveTextBroadcast';
import axiosInstance from '../utils/axiosInstance';

import hitEffect from '../assets/effect/hit_effect.json';
import homerunEffect from '../assets/effect/homerun_effect.json';
import winEffect from '../assets/effect/win_effect.json';

type EffectType = 'HIT' | 'HR_OR_SCORE' | 'WIN';

const LiveGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'LiveGameScreen'>>();
  const navigation = useNavigation();
  const { gameId, homeTeamName, awayTeamName, homeTeam, awayTeam, status, homeScore: initialHomeScore, awayScore: initialAwayScore } = route.params as any;

  const homeTeamId = teamNameToId[homeTeamName.split(' ')[0]];
  const awayTeamId = teamNameToId[awayTeamName.split(' ')[0]];

  const [selectedInning, setSelectedInning] = useState<number>(1);
  const [homeScore, setHomeScore] = useState<number>(typeof initialHomeScore === 'number' ? initialHomeScore : 0);
  const [awayScore, setAwayScore] = useState<number>(typeof initialAwayScore === 'number' ? initialAwayScore : 0);
  const [pitcherPcode, setPitcherPcode] = useState<string | null>(null);
  const [batterPcode, setBatterPcode] = useState<string | null>(null);
  const [pitcherName, setPitcherName] = useState<string | null>(null);
  const [batterName, setBatterName] = useState<string | null>(null);
  const [currentHalf, setCurrentHalf] = useState<'top' | 'bot'>('top');
  const [maxInning, setMaxInning] = useState(9);
  const { myTeamId } = useMyTeam();

  const addEffectToQueue = useCallback((type: EffectType, id: string) => {
    effectQueueRef.current.push({ type, id });
    if (!isPlayingEffectRef.current) {
      playNextEffect();
    }
  }, []);

  const playNextEffect = useCallback(() => {
    if (effectQueueRef.current.length === 0) {
      isPlayingEffectRef.current = false;
      return;
    }

    const nextEffect = effectQueueRef.current.shift();
    if (nextEffect) {
      isPlayingEffectRef.current = true;
      setEffectType(nextEffect.type);
      setLastEffectId(nextEffect.id);
      setLastEffectAtMs(Date.now());
    }
  }, []);

  const [effectType, setEffectType] = useState<EffectType | null>(null);
  const [lastEffectId, setLastEffectId] = useState<string>('');
  const [lastEffectAtMs, setLastEffectAtMs] = useState<number>(0);
  const effectRef = useRef<LottieView>(null);
  const effectQueueRef = useRef<{ type: EffectType; id: string }[]>([]);
  const isPlayingEffectRef = useRef<boolean>(false);
  const [pitchCount, setPitchCount] = useState<number>(0);
  const prevHomeScoreRef = useRef<number | null>(null);
  const prevAwayScoreRef = useRef<number | null>(null);
  const [lastScoreKey, setLastScoreKey] = useState<string>('');
  const effectsEnabledRef = useRef<boolean>(false); // 최초 진입 시 과거 안타로 효과 재생 방지
  const winEffectTriggeredRef = useRef<boolean>(false); // WIN 효과 중복 트리거 방지

  const fetchCurrentInning = useCallback(async () => {
    try {
      const triggerFromCompletedAtbat = (
        atbat: any | undefined,
        isTopHalf: boolean,
        inning: number,
      ) => {
        if (!atbat || !myTeamId) return;
        if (!effectsEnabledRef.current) return; // 최초 1회 로딩 시에는 효과 트리거 스킵
        const { main_result, full_result, appearance_number } = atbat;
        const full = typeof full_result === 'string' ? full_result : '';
        const hasConfirmedFull = full.length > 0 && full !== '(진행 중)';
        if (!main_result && !hasConfirmedFull) return;
        const atbatId = `${inning}_${isTopHalf ? 'top' : 'bot'}_${appearance_number}`;

        const isMyTeamAtBat = (isTopHalf && awayTeam === myTeamId) || (!isTopHalf && homeTeam === myTeamId);
        if (!isMyTeamAtBat) return;

        const resultText: string = String(main_result || full);
        const normalized = resultText.replace(/\s+/g, '');
        const isHit = ['안타', '1루타', '2루타', '3루타']
          .some((word) => normalized.includes(word.replace(/\s+/g, '')));
        // 홈인 이벤트를 더 정확하게 감지 (예: "3루주자 노진혁 : 홈인")
        const isHrOrScore = ['홈런', '득점', '홈인'].some((word) => resultText.includes(word)) || 
                           resultText.includes('홈인') || 
                           (full && full.includes('홈인'));

        // 우선순위: HR_OR_SCORE > HIT
        const now = Date.now();
        
        if (isHrOrScore && status !== 'DONE') {
          const effectKey = `${atbatId}_score_${appearance_number}`;
          addEffectToQueue('HR_OR_SCORE', effectKey);
        } else if (isHit && status !== 'DONE') {
          const effectKey = `${atbatId}_hit_${appearance_number}`;
          addEffectToQueue('HIT', effectKey);
        }
      };

      // 경기 종료 상태에서는 기존 상태 그대로 유지

      // 연장 이닝(10회, 11회)을 병렬로 확인
      try {
        const [res10, res11] = await Promise.all([
          axiosInstance.get(`/api/games/${gameId}/relay/10/`).catch(() => null),
          axiosInstance.get(`/api/games/${gameId}/relay/11/`).catch(() => null)
        ]);

        let ongoingInning = null;
        let ongoingData = null;

        // 11회부터 확인 (더 높은 우선순위)
        if (res11) {
          const data = res11.data?.data;
          const top = data.top?.atbats ?? [];
          const bot = data.bot?.atbats ?? [];

          if ([...top, ...bot].length > 0) {
            setMaxInning((prev) => Math.max(prev, 11));
          }

          const isOngoing = [...top, ...bot].some((ab: any) => ab.full_result === '(진행 중)');
          if (isOngoing && status !== 'DONE') {
            ongoingInning = 11;
            ongoingData = { data, top, bot };
          }
        }

        // 11회에 진행 중인 타석이 없으면 10회 확인
        if (!ongoingInning && res10) {
          const data = res10.data?.data;
          const top = data.top?.atbats ?? [];
          const bot = data.bot?.atbats ?? [];

          if ([...top, ...bot].length > 0) {
            setMaxInning((prev) => Math.max(prev, 10));
          }

          const isOngoing = [...top, ...bot].some((ab: any) => ab.full_result === '(진행 중)');
          if (isOngoing && status !== 'DONE') {
            ongoingInning = 10;
            ongoingData = { data, top, bot };
          }
        }

        // 진행 중인 연장 이닝이 있으면 처리
        if (ongoingInning && ongoingData) {
          const { data, top, bot } = ongoingData;
          // 사용자가 수동으로 선택한 이닝이 아니면 진행 중인 이닝으로 설정
          if (selectedInning === 1) {
            setSelectedInning(ongoingInning);
          }

          const ongoingAtbat = [...top, ...bot].find((ab: any) => ab.full_result === '(진행 중)');
          if (ongoingAtbat) {
            const isTop = top.includes(ongoingAtbat);
            setCurrentHalf(isTop ? 'top' : 'bot');

            const { pitcher, actual_batter, score, main_result, appearance_number } = ongoingAtbat;
            const atbatId = `${ongoingInning}_${isTop ? 'top' : 'bot'}_${appearance_number}`;

            if (pitcher?.pcode && actual_batter?.pcode) {
              setPitcherPcode(pitcher.pcode);
              setBatterPcode(actual_batter.pcode);
              setPitcherName(pitcher.player_name);
              setBatterName(actual_batter.player_name);
            }

            if (score) {
              const [away, home] = score.split(':').map(Number);

              // 득점 효과: 내 팀 점수가 증가하면 트리거 (텍스트에 '득점'이 없어도)
              const prevHome = prevHomeScoreRef.current;
              const prevAway = prevAwayScoreRef.current;
              const scoreKey = `${ongoingInning}_${isTop ? 'top' : 'bot'}_${away}_${home}_score`;
              const myTeamScored =
                (myTeamId === homeTeam && prevHome !== null && home > prevHome) ||
                (myTeamId === awayTeam && prevAway !== null && away > prevAway);
              if (myTeamId && myTeamScored && scoreKey !== lastScoreKey) {
                setEffectType('HR_OR_SCORE');
                setLastEffectId(scoreKey);
                setLastScoreKey(scoreKey);
              }

              prevAwayScoreRef.current = away;
              prevHomeScoreRef.current = home;
              setAwayScore(away);
              setHomeScore(home);
            }

            // 현재 우리 팀이 공격 중일 때만 (같은 half에 한해) 직전 확정 타석을 검사
            const myTeamAtBatNow = (isTop && awayTeam === myTeamId) || (!isTop && homeTeam === myTeamId);
            if (myTeamAtBatNow) {
              if (isTop) {
                const lastCompletedTop = [...top]
                  .reverse()
                  .find((ab: any) => ab && ab !== ongoingAtbat && (ab.main_result || (ab.full_result && ab.full_result !== '(진행 중)')));
                triggerFromCompletedAtbat(lastCompletedTop, true, ongoingInning);
              } else {
                const lastCompletedBot = [...bot]
                  .reverse()
                  .find((ab: any) => ab && ab !== ongoingAtbat && (ab.main_result || (ab.full_result && ab.full_result !== '(진행 중)')));
                triggerFromCompletedAtbat(lastCompletedBot, false, ongoingInning);
              }
            }
          }
          return;
        }
      } catch (_e) {
        // 연장 이닝 확인 실패 시 일반 이닝으로 진행
      }

      // 연장 이닝에 진행 중인 타석이 없으면 일반 이닝 확인
      for (let inning = 1; inning <= 9; inning++) {
        const res = await axiosInstance.get(`/api/games/${gameId}/relay/${inning}/`);
        const data = res.data?.data;
        const top = data.top?.atbats ?? [];
        const bot = data.bot?.atbats ?? [];

        if ([...top, ...bot].length > 0) {
          setMaxInning((prev) => Math.max(prev, inning));
        }

        const isOngoing = [...top, ...bot].some((ab: any) => ab.full_result === '(진행 중)');
        if (isOngoing && status !== 'DONE') {
          // 사용자가 수동으로 선택한 이닝이 아니면 진행 중인 이닝으로 설정
          if (selectedInning === 1) {
            setSelectedInning(inning);
          }

          const ongoingAtbat = [...top, ...bot].find((ab: any) => ab.full_result === '(진행 중)');
          if (ongoingAtbat) {
            const isTop = top.includes(ongoingAtbat);
            setCurrentHalf(isTop ? 'top' : 'bot');

            const { pitcher, actual_batter, score, main_result, appearance_number } = ongoingAtbat;
            const atbatId = `${inning}_${isTop ? 'top' : 'bot'}_${appearance_number}`;

            if (pitcher?.pcode && actual_batter?.pcode) {
              setPitcherPcode(pitcher.pcode);
              setBatterPcode(actual_batter.pcode);
              setPitcherName(pitcher.player_name);
              setBatterName(actual_batter.player_name);
            }

            if (score) {
              const [away, home] = score.split(':').map(Number);

              // 득점 효과: 내 팀 점수가 증가하면 트리거 (텍스트에 '득점'이 없어도)
              const prevHome = prevHomeScoreRef.current;
              const prevAway = prevAwayScoreRef.current;
              const scoreKey = `${inning}_${isTop ? 'top' : 'bot'}_${away}_${home}_score`;
              const myTeamScored =
                (myTeamId === homeTeam && prevHome !== null && home > prevHome) ||
                (myTeamId === awayTeam && prevAway !== null && away > prevAway);
              if (myTeamId && myTeamScored && scoreKey !== lastScoreKey) {
                setEffectType('HR_OR_SCORE');
                setLastEffectId(scoreKey);
                setLastScoreKey(scoreKey);
              }

              prevAwayScoreRef.current = away;
              prevHomeScoreRef.current = home;
              setAwayScore(away);
              setHomeScore(home);
            }

            // 현재 우리 팀이 공격 중일 때만 (같은 half에 한해) 직전 확정 타석을 검사
            const myTeamAtBatNow = (isTop && awayTeam === myTeamId) || (!isTop && homeTeam === myTeamId);
            if (myTeamAtBatNow) {
              if (isTop) {
                const lastCompletedTop = [...top]
                  .reverse()
                  .find((ab: any) => ab && ab !== ongoingAtbat && (ab.main_result || (ab.full_result && ab.full_result !== '(진행 중)')));
                triggerFromCompletedAtbat(lastCompletedTop, true, inning);
              } else {
                const lastCompletedBot = [...bot]
                  .reverse()
                  .find((ab: any) => ab && ab !== ongoingAtbat && (ab.main_result || (ab.full_result && ab.full_result !== '(진행 중)')));
                triggerFromCompletedAtbat(lastCompletedBot, false, inning);
              }
            }
          }
          return;
        }
        // 진행 중 타석이 없으면, 우리 팀이 공격했던 half의 최근 확정 타석만 검사
        if (myTeamId === awayTeam) {
          const lastCompletedTop = [...top]
            .reverse()
            .find((ab: any) => ab && (ab.main_result || (ab.full_result && ab.full_result !== '(진행 중)')));
          triggerFromCompletedAtbat(lastCompletedTop, true, inning);
        }
        if (myTeamId === homeTeam) {
          const lastCompletedBot = [...bot]
            .reverse()
            .find((ab: any) => ab && (ab.main_result || (ab.full_result && ab.full_result !== '(진행 중)')));
          triggerFromCompletedAtbat(lastCompletedBot, false, inning);
        }
      }
    } catch (err) {
      // 예외 무시
    } finally {
      // 최초 1회 데이터 로딩이 끝나면 이후부터 효과 활성화
      if (!effectsEnabledRef.current) effectsEnabledRef.current = true;
    }
  }, [gameId, myTeamId, lastEffectId, homeTeam, awayTeam]);

  useEffect(() => {
    fetchCurrentInning();
  }, [fetchCurrentInning]);

  // 경기 종료 상태에서 내 팀이 승리하면 진입 시 WIN 이팩트 1회 재생
  useEffect(() => {
    if (status !== 'DONE' || !myTeamId) return;
    // 내가 선택한 팀이 이 경기의 홈/원정에 포함되지 않으면 트리거하지 않음
    const isMyTeamsGame = myTeamId === homeTeam || myTeamId === awayTeam;
    if (!isMyTeamsGame) return;
    
    // 이미 WIN 효과가 트리거되었으면 다시 트리거하지 않음
    if (winEffectTriggeredRef.current) return;
    
    const myScore = myTeamId === homeTeam ? homeScore : awayScore;
    const oppScore = myTeamId === homeTeam ? awayScore : homeScore;
    const winKey = `done_${gameId}_${myTeamId}_win`;
    if (typeof myScore === 'number' && typeof oppScore === 'number' && myScore > oppScore && lastEffectId !== winKey) {
      setEffectType('WIN');
      setLastEffectId(winKey);
      winEffectTriggeredRef.current = true; // WIN 효과 트리거 완료 표시
    }
  }, [status, myTeamId, homeTeam, awayTeam, homeScore, awayScore, gameId, lastEffectId]);

  useEffect(() => {
    if (status === 'DONE') return;
    const intervalId = setInterval(() => {
      fetchCurrentInning();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [status, fetchCurrentInning]);

  // 투구수가 변할 때(=직후 이벤트 발생 가능 타이밍), 즉시 한 번 더 최신화
  const lastPitchFetchRef = useRef<number>(0);
  useEffect(() => {
    if (status === 'DONE') return;
    const now = Date.now();
    if (now - lastPitchFetchRef.current < 800) return; // 과도한 호출 방지
    lastPitchFetchRef.current = now;
    fetchCurrentInning();
  }, [pitchCount, status, fetchCurrentInning]);

  const renderEffect = () => {
    if (!effectType) return null;

    let source;
    if (effectType === 'HIT') source = hitEffect;
    else if (effectType === 'HR_OR_SCORE') source = homerunEffect;
    else if (effectType === 'WIN') source = winEffect;

    const isCenteredSize = effectType === 'HIT' || effectType === 'HR_OR_SCORE';
    const EFFECT_FULLSCREEN = true; // 필요 시 bottom 고정으로 바꾸려면 false
    const size = EFFECT_FULLSCREEN ? undefined : (effectType === 'HIT' ? 260 : effectType === 'HR_OR_SCORE' ? 320 : undefined);

    if (isCenteredSize) {
      if (EFFECT_FULLSCREEN) {
        return (
          <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }] }>
            <LottieView
              ref={effectRef}
              source={source}
              autoPlay
              loop={false}
              onAnimationFinish={() => {
                setEffectType(null);
                playNextEffect();
              }}
              style={[StyleSheet.absoluteFillObject]}
            />
          </View>
        );
      }
      return (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center', zIndex: 9999 }}
        >
          <LottieView
            ref={effectRef}
            source={source}
            autoPlay
            loop={false}
            onAnimationFinish={() => {
              setEffectType(null);
              playNextEffect();
            }}
            style={{ width: size, height: size }}
          />
        </View>
      );
    }

    // WIN 등은 풀스크린 유지
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }] }>
        <LottieView
          ref={effectRef}
          source={source}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            setEffectType(null);
            playNextEffect();
          }}
          style={[StyleSheet.absoluteFillObject]}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderEffect()}
      <ScrollView style={styles.container}>
        <Header
          title={` ${awayTeamName.split(' ')[0]} vs ${homeTeamName.split(' ')[0]}`}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />

        {status !== 'DONE' && (
          <View style={{ marginHorizontal: -18 }}>
            <FieldStatusBoard
              gameId={gameId}
              selectedInning={selectedInning}
              setSelectedInning={setSelectedInning}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              pitcherPitchCount={pitchCount}
            />
          </View>
        )}

        <View style={styles.scoreBoxFull}>
          <View style={styles.teamBlockContainer}>
            <Image source={teamLogoMap[awayTeamId]} style={styles.logo} />
            <View style={[styles.teamBlock, { alignItems: 'flex-start' }]}>
              <Text style={styles.teamLabel}>{awayTeamName.split(' ')[0]}</Text>
              <Text style={styles.teamLabel}>{awayTeamName.split(' ')[1]}</Text>
            </View>
          </View>

          <View style={styles.scoreSet}>
            <View style={styles.statusContainer}>
              {status === 'DONE' ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>경기 종료</Text>
                </View>
              ) : (
                <Text style={styles.inningText}>{`${selectedInning}회`}</Text>
              )}
            </View>

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

        {status !== 'DONE' && (
          <View style={{ marginBottom: 24 }}>
            <PlayerInfoBoard
              pitcherPcode={pitcherPcode}
              batterPcode={batterPcode}
              pitcherName={pitcherName}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              batterName={batterName}
              currentHalf={currentHalf}
              onPitchCountUpdate={setPitchCount}
            />
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          <LiveTextBroadcast
            gameId={gameId}
            selectedInning={selectedInning}
            setSelectedInning={setSelectedInning}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            maxInning={maxInning}
            isGameDone={status === 'DONE'}
          />
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  teamBlockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scoreNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 25,
    fontWeight: 'bold',
    marginHorizontal: 6,
    textAlign: 'center',
  },
  vs: {
    fontSize: 25,
    fontWeight: 'bold',
    marginHorizontal: 10,
    textAlign: 'center',
  },
  inningText: {
    fontSize: 14,
    marginBottom: 0,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 6,
    alignItems: 'center',
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
    textAlign: 'center',
  },
});