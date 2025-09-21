// src/services/BackgroundLiveActivityService.ts
import { AppState } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { updateGameLiveActivity, endLiveActivity, hasActiveLiveActivity, getActiveGameId } from '../bridge/SharedData';
import teamNameMap from '../constants/teamNames';
import { generateGameComment, extractSituationFromAtBat } from '../utils/gameCommentGenerator';

interface GameData {
  gameId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  inning: string;
  half: string;
  homePlayer: string;
  awayPlayer: string;
  gameMessage: string;
  isLive: boolean;
}

class BackgroundLiveActivityService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private currentGameId: string | null = null;
  private lastUpdateData: string = '';
  private pollInterval: number = 10000; // 10초마다 업데이트 (더 빠른 업데이트)
  private appStateSubscription: any = null;
  private errorCount: number = 0;
  private maxErrors: number = 5; // 최대 5번 에러 후 중지
  private latestComment: string = ''; // 최신 멘트 저장
  private lastScore: string = '0:0'; // 이전 스코어 저장
  private lastSuccessfulData: GameData | null = null; // 마지막으로 성공적으로 업데이트된 데이터 저장

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('🔍 AppState changed to:', nextAppState);
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // 앱이 백그라운드로 갈 때 백그라운드 폴링 시작
        if (hasActiveLiveActivity()) {
          this.startBackgroundPolling();
        }
      } else if (nextAppState === 'active') {
        // 앱이 포그라운드로 올 때 백그라운드 폴링 중지
        this.stopBackgroundPolling();
      }
    });
  }

  public startBackgroundPolling(gameId?: string) {
    if (this.isRunning) {
      console.log('🔍 Background polling already running');
      return;
    }

    this.currentGameId = gameId || getActiveGameId();
    
    if (!this.currentGameId) {
      console.log('🔍 No active game ID found, cannot start background polling');
      return;
    }

    console.log('🔍 Starting background polling for game:', this.currentGameId);
    this.isRunning = true;
    this.errorCount = 0; // 에러 카운터 리셋

    // 마지막으로 성공한 데이터가 있으면 먼저 표시
    if (this.lastSuccessfulData) {
      console.log('🔍 Using last successful data while loading new data:', this.lastSuccessfulData);
      updateGameLiveActivity(this.lastSuccessfulData);
    }

    // 즉시 한 번 실행
    this.fetchAndUpdateGameData();

    // 정기적 업데이트
    this.intervalId = setInterval(() => {
      this.fetchAndUpdateGameData();
    }, this.pollInterval);
  }

  public stopBackgroundPolling() {
    if (!this.isRunning) {
      return;
    }

    console.log('🔍 Stopping background polling');
    this.isRunning = false;
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // 마지막 데이터는 유지 (라이브 액티비티는 종료하지 않음)
    console.log('🔍 Background polling stopped, keeping last data');
  }

  private async fetchAndUpdateGameData() {
    if (!this.currentGameId) {
      console.log('🔍 No game ID available for background update');
      return;
    }

    try {
      console.log('🔍 Fetching game data in background for game:', this.currentGameId);
      
      // 현재 진행 중인 이닝 찾기 (최신 이닝부터 확인)
      let currentInning = 1;
      let relayData = null;
      let currentHalf = 'top';
      let currentPitcher = '투수';
      let currentBatter = '타자';
      let currentScore = '0:0';
      
      console.log('🔍 Finding current inning for game:', this.currentGameId);
      
      // 이닝을 3개씩 배치로 나누어 병렬 처리 (9-7, 6-4, 3-1)
      const inningBatches = [
        [9, 8, 7],
        [6, 5, 4], 
        [3, 2, 1]
      ];
      
      for (const batch of inningBatches) {
        try {
          // 현재 배치의 이닝들을 병렬로 요청
          const batchPromises = batch.map(inning => 
            axiosInstance.get(`/api/games/${this.currentGameId}/relay/${inning}/`)
              .then(res => ({ 
                inning, 
                data: res.data?.data, 
                success: true,
                fullResponse: res.data 
              }))
              .catch(error => ({ 
                inning, 
                data: null, 
                success: false, 
                fullResponse: null,
                error: error.response?.status === 404 ? 'not_found' : 'error' 
              }))
          );
          
          const batchResults = await Promise.all(batchPromises);
          
          // 결과를 이닝 순서대로 정렬 (높은 이닝부터)
          const sortedResults = batchResults.sort((a, b) => b.inning - a.inning);
          
          for (const result of sortedResults) {
            const { inning, data, success, fullResponse, error } = result as any;
            
            if (!success) {
              if (error === 'not_found') {
                console.log('🔍 Inning', inning, 'not available (404)');
              } else {
                console.log('🔍 Inning', inning, 'error');
              }
              continue;
            }
            
            if (!data) continue;
            
            const topAtBats = data.top?.atbats || [];
            const botAtBats = data.bot?.atbats || [];
            
            // 진행 중인 타석 찾기
            const ongoingTopAtBat = topAtBats.find((atBat: any) => atBat.full_result === '(진행 중)');
            const ongoingBotAtBat = botAtBats.find((atBat: any) => atBat.full_result === '(진행 중)');
            
            if (ongoingTopAtBat || ongoingBotAtBat) {
              currentInning = inning;
              relayData = fullResponse;
              const ongoingAtBat = ongoingTopAtBat || ongoingBotAtBat;
              currentHalf = ongoingTopAtBat ? 'top' : 'bot';
              
              // 현재 투수/타자 정보 추출
              if (ongoingAtBat.actual_batter && ongoingAtBat.pitcher) {
                currentBatter = typeof ongoingAtBat.actual_batter === 'object' 
                  ? ongoingAtBat.actual_batter.player_name || '타자'
                  : String(ongoingAtBat.actual_batter);
                currentPitcher = typeof ongoingAtBat.pitcher === 'object'
                  ? ongoingAtBat.pitcher.player_name || '투수'
                  : String(ongoingAtBat.pitcher);
              }
              
              // 현재 스코어 추출
              if (ongoingAtBat.score) {
                currentScore = ongoingAtBat.score;
              }
              
              console.log('🔍 Found ongoing at-bat in inning:', inning, 'half:', currentHalf);
              break;
            }
            
            // 진행 중인 타석이 없으면 최근 완료된 타석에서 정보 추출
            if (!ongoingTopAtBat && !ongoingBotAtBat) {
              const lastTopAtBat = topAtBats[topAtBats.length - 1];
              const lastBotAtBat = botAtBats[botAtBats.length - 1];
              const lastAtBat = lastBotAtBat || lastTopAtBat;
              
              if (lastAtBat) {
                currentInning = inning;
                relayData = fullResponse;
                currentHalf = lastBotAtBat ? 'bot' : 'top';
                
                // 최근 투수/타자 정보 추출
                if (lastAtBat.actual_batter && lastAtBat.pitcher) {
                  currentBatter = typeof lastAtBat.actual_batter === 'object' 
                    ? lastAtBat.actual_batter.player_name || '타자'
                    : String(lastAtBat.actual_batter);
                  currentPitcher = typeof lastAtBat.pitcher === 'object'
                    ? lastAtBat.pitcher.player_name || '투수'
                    : String(lastAtBat.pitcher);
                }
                
                // 최근 스코어 추출
                if (lastAtBat.score) {
                  currentScore = lastAtBat.score;
                }
                
                console.log('🔍 Found last completed at-bat in inning:', inning, 'half:', currentHalf);
                break;
              }
            }
          }
          
          // 진행 중인 타석을 찾았으면 더 이상 배치를 처리하지 않음
          if (relayData) break;
          
        } catch (batchError) {
          console.log('🔍 Batch processing error:', batchError);
          continue;
        }
      }
      
      if (!relayData) {
        console.warn('🔍 No relay data found for any inning');
        // 기본값으로 1회 시도
        try {
          const fallbackResponse = await axiosInstance.get(`/api/games/${this.currentGameId}/relay/1/`);
          relayData = fallbackResponse.data;
          currentInning = 1;
        } catch (fallbackError) {
          throw new Error('No inning data available');
        }
      }
      
      console.log('🔍 Using inning:', currentInning, 'half:', currentHalf);

      // 게임 기본 정보 가져오기 (스코어 확인용)
      const gameResponse = await axiosInstance.get(`/api/games/${this.currentGameId}/`);
      const gameData = gameResponse.data;

      // 게임이 종료되었으면 라이브 액티비티에 종료 메시지 보내고 종료
      if (gameData.status === 'DONE' || gameData.status === 'FINISHED' || gameData.status === 'END') {
        console.log('🔍 Game finished, ending live activity. Status:', gameData.status);
        
        // 최종 스코어와 함께 종료 메시지 전송
        const homeTeamName = teamNameMap[gameData.home_team] || gameData.home_team;
        const awayTeamName = teamNameMap[gameData.away_team] || gameData.away_team;
        const finalHomeScore = gameData.home_total_score || 0;
        const finalAwayScore = gameData.away_total_score || 0;
        
        const finalMessage = `🏁 경기 종료\n최종 스코어: ${finalAwayScore} : ${finalHomeScore}`;
        
        // 마지막 업데이트로 종료 메시지 전송
        updateGameLiveActivity({
          homeScore: finalHomeScore,
          awayScore: finalAwayScore,
          inning: "경기종료",
          half: "",
          homePlayer: homeTeamName,
          awayPlayer: awayTeamName,
          gameMessage: finalMessage,
          isLive: false
        });
        
        // 3초 후 라이브 액티비티 완전 종료
        setTimeout(() => {
          endLiveActivity();
        }, 3000);
        
        this.stopBackgroundPolling();
        return;
      }
      
      // 경기 상태가 예약됨이나 취소됨인 경우도 종료
      if (gameData.status === 'SCHEDULED' || gameData.status === 'CANCELLED') {
        console.log('🔍 Game not active, ending live activity. Status:', gameData.status);
        endLiveActivity();
        this.stopBackgroundPolling();
        return;
      }

      const homeTeamName = teamNameMap[gameData.home_team] || gameData.home_team;
      const awayTeamName = teamNameMap[gameData.away_team] || gameData.away_team;
      
      // 스코어 파싱 (relay 데이터 우선, 없으면 게임 데이터 사용)
      let homeScore, awayScore;
      if (currentScore && currentScore.includes(':')) {
        [awayScore, homeScore] = currentScore.split(':').map(Number);
      } else {
        homeScore = gameData.home_total_score || 0;
        awayScore = gameData.away_total_score || 0;
      }
      
      // 점수 변경 감지
      const currentScoreStr = `${awayScore}:${homeScore}`;
      const scoreChanged = this.lastScore !== currentScoreStr;
      if (scoreChanged) {
        console.log('🔍 Score changed:', this.lastScore, '->', currentScoreStr);
        this.lastScore = currentScoreStr;
      }

      // 초/말에 따라 투수/타자 위치 결정
      let homePlayer, awayPlayer;
      
      if (currentHalf === 'top') {
        // 초 이닝: 원정팀이 공격
        homePlayer = currentPitcher;  // 홈팀 투수
        awayPlayer = currentBatter;   // 원정팀 타자
      } else {
        // 말 이닝: 홈팀이 공격
        homePlayer = currentBatter;   // 홈팀 타자
        awayPlayer = currentPitcher;  // 원정팀 투수
      }

      // 게임 멘트 생성 - 생성된 메시지만 표시
      let gameMessage = '';
      
      // 최신 멘트가 있으면 우선 사용
      if (this.latestComment) {
        gameMessage = this.latestComment;
        console.log('🔍 Using latest comment from LiveTextBroadcast:', this.latestComment);
      } else {
        // 현재 진행 중인 투타 정보 기반으로 멘트 생성 시도
        try {
          if (relayData.data) {
            // 현재 진행 중인 타석 찾기
            let currentAtBat = null;
            let currentHalfForAtBat: 'top' | 'bot' | null = null;
            
            // 말 이닝에서 진행 중인 타석 찾기
            if (relayData.data.bot?.atbats) {
              const ongoingBotAtBat = relayData.data.bot.atbats.find((atBat: any) => atBat.full_result === '(진행 중)');
              if (ongoingBotAtBat) {
                currentAtBat = ongoingBotAtBat;
                currentHalfForAtBat = 'bot';
              }
            }
            
            // 초 이닝에서 진행 중인 타석 찾기
            if (!currentAtBat && relayData.data.top?.atbats) {
              const ongoingTopAtBat = relayData.data.top.atbats.find((atBat: any) => atBat.full_result === '(진행 중)');
              if (ongoingTopAtBat) {
                currentAtBat = ongoingTopAtBat;
                currentHalfForAtBat = 'top';
              }
            }

            console.log('🔍 현재 진행 중인 타석:', currentAtBat);
            console.log('🔍 현재 하프:', currentHalfForAtBat);

            // 현재 진행 중인 타석이 있으면 해당 타석으로 멘트 생성
            if (currentAtBat && currentHalfForAtBat) {
              const attackingTeamName = currentHalfForAtBat === 'top' ? awayTeamName : homeTeamName;
              
              console.log(`🔍 현재 투타 정보 - 공격팀: ${attackingTeamName}, 하프: ${currentHalfForAtBat}`);
              console.log(`🔍 홈팀: ${homeTeamName}, 원정팀: ${awayTeamName}`);
              console.log(`🔍 계산 로직: ${currentHalfForAtBat === 'top' ? '초이닝(원정팀공격)' : '말이닝(홈팀공격)'}`);
              console.log(`🔍 투수: ${currentAtBat.pitcher?.player_name}, 타자: ${currentAtBat.actual_batter?.player_name}`);
              
              // 현재 투타 정보를 기반으로 상황 생성
              const situation = {
                playerName: currentAtBat.actual_batter?.player_name || '타자',
                teamName: attackingTeamName,
                homeTeamName: homeTeamName,
                awayTeamName: awayTeamName,
                pitcherName: currentAtBat.pitcher?.player_name || '투수',
                inning: currentInning,
                half: currentHalfForAtBat,
                outs: currentAtBat.outs || 0,
                score: currentAtBat.score || '0:0',
                onBase: currentAtBat.on_base || { base1: '0', base2: '0', base3: '0' },
                mainResult: currentAtBat.main_result || '',
                fullResult: currentAtBat.full_result || '',
                isOngoing: true
              };
              
              const eventText = Array.isArray(currentAtBat.event) ? currentAtBat.event[0] : currentAtBat.event;
              const comment = generateGameComment(situation, eventText);
              gameMessage = comment;
              console.log('🔍 Generated current at-bat comment:', comment);
            } else {
              // 진행 중인 타석이 없으면 현재 투타 정보만 표시
              const attackingTeamName = currentHalf === 'top' ? awayTeamName : homeTeamName;
              gameMessage = `${currentInning}회 ${currentHalf === 'top' ? '초' : '말'} ${attackingTeamName}의 공격\n${currentBatter} vs ${currentPitcher}`;
              console.log('🔍 No ongoing at-bat, showing current pitcher vs batter info:', gameMessage);
            }
          }
        } catch (commentError) {
          console.warn('🔍 Comment generation failed, using default message');
        }
      }

      const updateData: GameData = {
        gameId: this.currentGameId,
        homeTeamName,
        awayTeamName,
        homeScore,
        awayScore,
        inning: String(currentInning),
        half: currentHalf === 'top' ? '초' : '말',
        homePlayer,
        awayPlayer,
        gameMessage,
        isLive: gameData.status !== 'DONE'
      };

      // 데이터가 변경되었을 때만 업데이트
      const dataSignature = JSON.stringify(updateData);
      if (this.lastUpdateData !== dataSignature) {
        console.log('🔍 Game data changed, updating live activity');
        console.log('🔍 Update data:', updateData);
        
        updateGameLiveActivity(updateData);
        this.lastUpdateData = dataSignature;
        this.lastSuccessfulData = updateData; // 성공적으로 업데이트된 데이터 저장
      } else {
        console.log('🔍 No changes in game data, skipping update');
      }

    } catch (error: any) {
      this.errorCount++;
      console.warn('🔍 Background polling error:', error.message);
      
      // 너무 많은 에러 발생 시 중지
      if (this.errorCount >= this.maxErrors) {
        console.log('🔍 Too many errors, stopping background polling');
        this.stopBackgroundPolling();
        return;
      }
      
      // 404나 심각한 에러는 바로 중지
      if (error.response?.status === 404 || error.response?.status >= 500) {
        console.log('🔍 Critical error, stopping background polling');
        this.stopBackgroundPolling();
      }
    }
  }

  public setGameId(gameId: string) {
    this.currentGameId = gameId;
  }

  public setLatestComment(comment: string) {
    this.latestComment = comment;
    console.log('🎤 최신 멘트 설정:', comment);
  }

  public getLatestComment(): string {
    return this.latestComment;
  }

  public setPollInterval(interval: number) {
    this.pollInterval = Math.max(interval, 10000); // 최소 10초
    
    // 이미 실행 중이면 재시작
    if (this.isRunning) {
      this.stopBackgroundPolling();
      this.startBackgroundPolling();
    }
  }

  public getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  public isPollingActive(): boolean {
    return this.isRunning;
  }

  public getLastSuccessfulData(): GameData | null {
    return this.lastSuccessfulData;
  }

  public hasLastSuccessfulData(): boolean {
    return this.lastSuccessfulData !== null;
  }

  public cleanup() {
    this.stopBackgroundPolling();
    if (this.appStateSubscription) {
      this.appStateSubscription?.remove();
      this.appStateSubscription = null;
    }
  }
}

// 싱글톤 인스턴스
const backgroundLiveActivityService = new BackgroundLiveActivityService();

export default backgroundLiveActivityService;
