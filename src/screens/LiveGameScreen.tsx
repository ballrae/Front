// LiveGameScreen.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

// API 응답 캐시
const gameDataCache = new Map<string, { data: any; timestamp: number }>();
const GAME_DATA_CACHE_DURATION = 3000; // 3초 캐시

// 디바운싱을 위한 타이머 관리
const debounceTimers = new Map<string, NodeJS.Timeout>();

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
import { playCheerSong, stopCheerSong } from '../utils/playCheerSong';
import { startGameLiveActivity, updateGameLiveActivity, endLiveActivity } from '../bridge/SharedData';
import backgroundLiveActivityService from '../services/BackgroundLiveActivityService';

type EffectType = 'HIT' | 'HR_OR_SCORE' | 'WIN';

const LiveGameScreen = memo(() => {
  const route = useRoute<RouteProp<RootStackParamList, 'LiveGameScreen'>>();
  const navigation = useNavigation();
  const { gameId, homeTeamName, awayTeamName, homeTeam, awayTeam, status, homeScore: initialHomeScore, awayScore: initialAwayScore } = route.params as any;

  // 메모이제이션된 팀 ID 계산
  const homeTeamId = useMemo(() => teamNameToId[homeTeamName.split(' ')[0]], [homeTeamName]);
  const awayTeamId = useMemo(() => teamNameToId[awayTeamName.split(' ')[0]], [awayTeamName]);

  const [selectedInning, setSelectedInning] = useState<number>(1);
  const [homeScore, setHomeScore] = useState<number>(typeof initialHomeScore === 'number' ? initialHomeScore : 0);
  const [awayScore, setAwayScore] = useState<number>(typeof initialAwayScore === 'number' ? initialAwayScore : 0);
  const [pitcherPcode, setPitcherPcode] = useState<string | null>(null);
  const [batterPcode, setBatterPcode] = useState<string | null>(null);
  const [pitcherName, setPitcherName] = useState<string | null>(null);
  const [batterName, setBatterName] = useState<string | null>(null);
  const [actualBatterId, setActualBatterId] = useState<string | null>(null);
  const [currentHalf, setCurrentHalf] = useState<'top' | 'bot'>('top');
  const [maxInning, setMaxInning] = useState(9);
  const { myTeamId } = useMyTeam();
  const [cheerSongEnabled, setCheerSongEnabled] = useState<boolean>(true);
  const [isLiveActivityActive, setIsLiveActivityActive] = useState<boolean>(false);

  // 캐싱된 API 호출 함수
  const fetchCachedGameData = useCallback(async (url: string) => {
    const cacheKey = `game_${gameId}_${url}`;
    const cached = gameDataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < GAME_DATA_CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await axiosInstance.get(url);
      const data = response.data;
      
      // 캐시에 저장
      gameDataCache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.log(`API 호출 실패: ${url}`, error);
      return null;
    }
  }, [gameId]);

  // 디바운싱된 함수 실행
  const debouncedFunction = useCallback((key: string, fn: () => void, delay: number = 1000) => {
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(() => {
      fn();
      debounceTimers.delete(key);
    }, delay);
    
    debounceTimers.set(key, timer);
  }, []);

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

  // 응원가 재생 함수
  const playCheerSongForPlayer = useCallback((playerId: string) => {
    if (cheerSongEnabled && playerId) {
      playCheerSong(playerId);
    }
  }, [cheerSongEnabled]);

  // 라이브 액티비티 시작 함수
  const startLiveActivityForGame = useCallback(() => {
    if (isLiveActivityActive) return;
    
    const gameMessage = `⚾ ${awayTeamName} vs ${homeTeamName}\n📊 ${awayScore} : ${homeScore}`;
    const halfText = currentHalf === 'top' ? '초' : '말';
    
    // 초/말에 따라 투수/타자 위치 결정
    let homePlayer, awayPlayer;
    if (currentHalf === 'top') {
      // 초 이닝: 원정팀이 공격
      homePlayer = pitcherName || "투수";  // 홈팀 투수
      awayPlayer = batterName || "타자";   // 원정팀 타자
    } else {
      // 말 이닝: 홈팀이 공격
      homePlayer = batterName || "타자";   // 홈팀 타자
      awayPlayer = pitcherName || "투수";  // 원정팀 투수
    }
    
    startGameLiveActivity({
      gameId: gameId,
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      homeScore: homeScore,
      awayScore: awayScore,
      inning: selectedInning.toString(),
      half: halfText,
      homePlayer,
      awayPlayer,
      gameMessage: gameMessage,
      isLive: status !== 'DONE'
    });
    
    // 백그라운드 서비스 시작
    backgroundLiveActivityService.setGameId(gameId);
    backgroundLiveActivityService.startBackgroundPolling(gameId);
    
    setIsLiveActivityActive(true);
    console.log('🔍 라이브 액티비티 시작:', gameId);
  }, [isLiveActivityActive, gameId, homeTeamName, awayTeamName, homeTeam, awayTeam, homeScore, awayScore, selectedInning, currentHalf, pitcherName, batterName, status]);


  // 응원가 토글 변경 시 현재 재생 중인 소리 정리
  useEffect(() => {
    if (!cheerSongEnabled) {
      // OFF로 바뀌면 현재 재생 중인 응원가 즉시 정리
      stopCheerSong();
    }
  }, [cheerSongEnabled]);

  // 화면을 벗어날 때 응원가 정리 (라이브 액티비티는 유지하되 백그라운드 서비스 시작)
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 응원가만 정리
      stopCheerSong();
      // 라이브 액티비티는 마이팀 경기이므로 유지하되 백그라운드 폴링은 AppState에 따라 자동 관리됨
      console.log('🔍 화면 이탈 - 라이브 액티비티 유지, 백그라운드 서비스는 AppState에 따라 관리');
    };
  }, []);

  // 타자 정보가 변경될 때 응원가 재생
  useEffect(() => {
    if (actualBatterId && cheerSongEnabled) {
      playCheerSongForPlayer(actualBatterId);
    }
  }, [actualBatterId, cheerSongEnabled]);


  // 화면 진입 시 라이브 액티비티 시작 (마이팀 경기만)
  useEffect(() => {
    const isMyTeamsGame = myTeamId === homeTeam || myTeamId === awayTeam;
    if (status !== 'DONE' && !isLiveActivityActive && isMyTeamsGame) {
      startLiveActivityForGame();
    } else if (!isMyTeamsGame) {
      // 다른 팀 경기를 볼 때는 라이브 액티비티를 시작하지 않음 (기존 것 유지)
      console.log('🔍 다른 팀 경기 - 라이브 액티비티 시작하지 않음');
    }
  }, [status, isLiveActivityActive, startLiveActivityForGame, myTeamId, homeTeam, awayTeam]);

  // 경기 종료 시 라이브 액티비티 자동 종료 (마이팀 경기만)
  useEffect(() => {
    const isMyTeamsGame = myTeamId === homeTeam || myTeamId === awayTeam;
    const isGameFinished = status === 'DONE' || status === 'FINISHED' || status === 'END' || status === 'CANCELLED';
    
    if (isGameFinished && isLiveActivityActive && isMyTeamsGame) {
      console.log('🔍 경기 종료로 인한 라이브 액티비티 종료. Status:', status);
      endLiveActivity();
      backgroundLiveActivityService.stopBackgroundPolling();
      setIsLiveActivityActive(false);
    }
  }, [status, isLiveActivityActive, myTeamId, homeTeam, awayTeam]);

  // 라이브 액티비티 업데이트를 위한 메모이제이션된 데이터
  const liveActivityData = useMemo(() => {
    // 초/말에 따라 투수/타자 위치 결정
    let homePlayer, awayPlayer;
    if (currentHalf === 'top') {
      // 초 이닝: 원정팀이 공격
      homePlayer = pitcherName || "투수";  // 홈팀 투수
      awayPlayer = batterName || "타자";   // 원정팀 타자
    } else {
      // 말 이닝: 홈팀이 공격
      homePlayer = batterName || "타자";   // 홈팀 타자
      awayPlayer = pitcherName || "투수";  // 원정팀 투수
    }
    
    return {
      homeScore,
      awayScore,
      selectedInning,
      currentHalf,
      homePlayer,
      awayPlayer,
      gameMessage: `⚾ ${awayTeamName} vs ${homeTeamName}\n📊 ${awayScore} : ${homeScore}`,
      isLive: status !== 'DONE'
    };
  }, [homeScore, awayScore, selectedInning, currentHalf, pitcherName, batterName, awayTeamName, homeTeamName, status]);

  // 실시간 데이터 변경 시 라이브 액티비티 업데이트 (디바운싱 적용, 마이팀 경기만)
  useEffect(() => {
    const isMyTeamsGame = myTeamId === homeTeam || myTeamId === awayTeam;
    if (!isLiveActivityActive || status === 'DONE' || !isMyTeamsGame) return;
    
    // 디바운싱: 3초 내에 연속 호출 방지
    const timeoutId = setTimeout(() => {
      const halfText = liveActivityData.currentHalf === 'top' ? '초' : '말';
      
      updateGameLiveActivity({
        homeScore: liveActivityData.homeScore,
        awayScore: liveActivityData.awayScore,
        inning: liveActivityData.selectedInning.toString(),
        half: halfText,
        homePlayer: liveActivityData.homePlayer,  // 초/말에 따라 투수 또는 타자
        awayPlayer: liveActivityData.awayPlayer,  // 초/말에 따라 타자 또는 투수
        gameMessage: liveActivityData.gameMessage,
        isLive: liveActivityData.isLive
      });
      
      console.log('🔍 라이브 액티비티 업데이트:', gameId);
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [liveActivityData, isLiveActivityActive, gameId, status, myTeamId, homeTeam, awayTeam]);

  // 메모이제이션된 효과 트리거 함수
  const triggerFromCompletedAtbat = useCallback((
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
  }, [myTeamId, awayTeam, homeTeam, status, addEffectToQueue]);

  const fetchCurrentInning = useCallback(async () => {
    try {

      // 연장 이닝(10회, 11회)을 병렬로 확인 (캐싱 적용)
      try {
        const [res10, res11] = await Promise.all([
          fetchCachedGameData(`/api/games/${gameId}/relay/10/`),
          fetchCachedGameData(`/api/games/${gameId}/relay/11/`)
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
              // 실제 타자 ID 설정 (id가 없으면 pcode 사용)
              const batterId = actual_batter.id || actual_batter.pcode;
              if (batterId) {
                setActualBatterId(String(batterId));
                console.log('🎵 타자 ID 업데이트:', batterId, actual_batter.player_name);
              }
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

      // 연장 이닝에 진행 중인 타석이 없으면 일반 이닝을 최적화된 방식으로 확인
      // 최신 이닝부터 확인하여 진행 중인 이닝을 빠르게 찾기
      let foundOngoing = false;
      
      // 9회부터 1회까지 역순으로 확인 (최신 이닝 우선, 캐싱 적용)
      for (let inning = 9; inning >= 1 && !foundOngoing; inning--) {
        try {
          const res = await fetchCachedGameData(`/api/games/${gameId}/relay/${inning}/`);
          if (!res) continue;
          const data = res.data?.data;
          
          if (!data) continue;
          
          const top = data.top?.atbats ?? [];
          const bot = data.bot?.atbats ?? [];

          if ([...top, ...bot].length > 0) {
            setMaxInning((prev) => Math.max(prev, inning));
          }

          const isOngoing = [...top, ...bot].some((ab: any) => ab.full_result === '(진행 중)');
          if (isOngoing && status !== 'DONE') {
            foundOngoing = true;
            
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
                // 실제 타자 ID 설정 (id가 없으면 pcode 사용)
                const batterId = actual_batter.id || actual_batter.pcode;
                if (batterId) {
                  setActualBatterId(String(batterId));
                  console.log('🎵 타자 ID 업데이트:', batterId, actual_batter.player_name);
                }
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
          }
        } catch (error: any) {
          // 404 오류는 정상적인 경우이므로 로그 레벨을 낮춤
          if (error.response?.status === 404) {
            console.log(`🔍 ${inning}회 데이터 없음 (404)`);
          } else {
            console.log(`🔍 ${inning}회 데이터 오류:`, error.message);
          }
          continue;
        }
      }
      
      // 진행 중인 타석이 없으면, 우리 팀이 공격했던 half의 최근 확정 타석만 검사 (캐싱 적용)
      if (!foundOngoing) {
        for (let inning = 9; inning >= 1; inning--) {
          try {
            const res = await fetchCachedGameData(`/api/games/${gameId}/relay/${inning}/`);
            if (!res) continue;
            const data = res.data?.data;
            
            if (!data) continue;
            
            const top = data.top?.atbats ?? [];
            const bot = data.bot?.atbats ?? [];
            
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
          } catch (error: any) {
            // 404 오류는 정상적인 경우이므로 로그 레벨을 낮춤
            if (error.response?.status === 404) {
              console.log(`🔍 ${inning}회 데이터 없음 (404)`);
            } else {
              console.log(`🔍 ${inning}회 데이터 오류:`, error.message);
            }
            continue;
          }
        }
      }
    } catch (err) {
      // 예외 무시
    } finally {
      // 최초 1회 데이터 로딩이 끝나면 이후부터 효과 활성화
      if (!effectsEnabledRef.current) effectsEnabledRef.current = true;
    }
  }, [gameId, myTeamId, homeTeam, awayTeam, status, triggerFromCompletedAtbat, fetchCachedGameData]);

  // 디바운싱된 데이터 새로고침
  const debouncedFetchCurrentInning = useCallback(() => {
    debouncedFunction('fetchCurrentInning', fetchCurrentInning, 500);
  }, [fetchCurrentInning, debouncedFunction]);

  useEffect(() => {
    fetchCurrentInning();
  }, [fetchCurrentInning]);

  // 화면 포커스 시 데이터 새로고침 (뒤로가기 후 재진입 시 렌더링 문제 해결)
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 LiveGameScreen 포커스 - 데이터 새로고침');
      debouncedFetchCurrentInning();
    }, [debouncedFetchCurrentInning])
  );

  // 경기 종료 시 1회를 기본값으로 설정 (빠른 로딩을 위해)
  useEffect(() => {
    if (status === 'DONE') {
      setSelectedInning(1);
    }
  }, [status]);

  // 화면 진입 시 WIN 이펙트만 다시 재생되도록
  useFocusEffect(
    useCallback(() => {
      // 경기가 종료되고 내 팀이 승리한 경우에만 WIN 이펙트 재생
      if (status === 'DONE' && myTeamId) {
        const isMyTeamsGame = myTeamId === homeTeam || myTeamId === awayTeam;
        if (isMyTeamsGame) {
          const myScore = myTeamId === homeTeam ? homeScore : awayScore;
          const oppScore = myTeamId === homeTeam ? awayScore : homeScore;
          
          if (typeof myScore === 'number' && typeof oppScore === 'number' && myScore > oppScore) {
            console.log('🏆 Screen focused, triggering WIN effect for victory');
            setEffectType('WIN');
            setLastEffectId(`focus_${gameId}_${myTeamId}_win`);
          }
        }
      }
    }, [status, myTeamId, homeTeam, awayTeam, homeScore, awayScore, gameId])
  );


  // 폴링 간격을 늘려서 성능 최적화 (15초로 변경)
  useEffect(() => {
    if (status === 'DONE') return;
    const intervalId = setInterval(() => {
      debouncedFetchCurrentInning();
    }, 15000); // 15초로 변경하여 성능 최적화
    return () => clearInterval(intervalId);
  }, [status, debouncedFetchCurrentInning]);

  // 투구수가 변할 때만 즉시 업데이트 (성능 최적화, 디바운싱 적용)
  const lastPitchFetchRef = useRef<number>(0);
  useEffect(() => {
    if (status === 'DONE') return;
    const now = Date.now();
    if (now - lastPitchFetchRef.current < 2000) return; // 2초 디바운싱으로 변경
    lastPitchFetchRef.current = now;
    debouncedFetchCurrentInning();
  }, [pitchCount, status, debouncedFetchCurrentInning]);

  const renderEffect = useCallback(() => {
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
  }, [effectType, effectRef, playNextEffect]);

  // 메모이제이션된 헤더 제목
  const headerTitle = useMemo(() => 
    ` ${awayTeamName.split(' ')[0]} vs ${homeTeamName.split(' ')[0]}`,
    [awayTeamName, homeTeamName]
  );

  // 메모이제이션된 백 핸들러
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 메모이제이션된 팀 이름들
  const awayTeamDisplayName = useMemo(() => awayTeamName.split(' '), [awayTeamName]);
  const homeTeamDisplayName = useMemo(() => homeTeamName.split(' '), [homeTeamName]);

  return (
    <View style={styles.mainContainer}>
      {renderEffect()}
      <ScrollView style={styles.container}>
        <Header
          title={headerTitle}
          showBackButton
          onBackPress={handleBackPress}
        />

        {status !== 'DONE' && (
          <View style={styles.fieldStatusContainer}>
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
            <View style={styles.teamBlockLeft}>
              <Text style={styles.teamLabel}>{awayTeamDisplayName[0]}</Text>
              <Text style={styles.teamLabel}>{awayTeamDisplayName[1]}</Text>
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
            <View style={styles.teamBlockRight}>
              <Text style={styles.teamLabel}>{homeTeamDisplayName[0]}</Text>
              <Text style={styles.teamLabel}>{homeTeamDisplayName[1]}</Text>
            </View>
            <Image source={teamLogoMap[homeTeamId]} style={styles.logo} />
          </View>
        </View>

        {status !== 'DONE' && (
          <View style={styles.playerInfoContainer}>
            <PlayerInfoBoard
              pitcherPcode={pitcherPcode}
              batterPcode={batterPcode}
              pitcherName={pitcherName}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              batterName={batterName}
              currentHalf={currentHalf}
              onPitchCountUpdate={setPitchCount}
              isGameDone={status === 'DONE'}
            />
          </View>
        )}

        <View style={styles.liveTextContainer}>
          <LiveTextBroadcast
            gameId={gameId}
            selectedInning={selectedInning}
            setSelectedInning={setSelectedInning}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            maxInning={maxInning}
            isGameDone={status === 'DONE'}
            cheerSongEnabled={cheerSongEnabled}
            setCheerSongEnabled={setCheerSongEnabled}
          />
        </View>
      </ScrollView>
    </View>
  );
});

export default LiveGameScreen;

// 스타일 객체를 컴포넌트 외부로 이동하여 메모이제이션
const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
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
  fieldStatusContainer: {
    marginHorizontal: -18,
  },
  teamBlockLeft: {
    marginHorizontal: 6,
    alignItems: 'flex-start',
  },
  teamBlockRight: {
    marginHorizontal: 6,
    alignItems: 'flex-end',
  },
  playerInfoContainer: {
    marginBottom: 24,
  },
  liveTextContainer: {
    marginBottom: 24,
  },
});