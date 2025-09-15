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
  private pollInterval: number = 20000; // 20초마다 업데이트 (더 자주 업데이트)
  private appStateSubscription: any = null;
  private errorCount: number = 0;
  private maxErrors: number = 5; // 최대 5번 에러 후 중지

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
  }

  private async fetchAndUpdateGameData() {
    if (!this.currentGameId) {
      console.log('🔍 No game ID available for background update');
      return;
    }

    try {
      console.log('🔍 Fetching game data in background for game:', this.currentGameId);
      
      // 게임 기본 정보 가져오기
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
        
        const finalMessage = `🏁 경기 종료\n⚾ ${awayTeamName} vs ${homeTeamName}\n📊 최종 스코어: ${finalAwayScore} : ${finalHomeScore}`;
        
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

      // 현재 이닝 찾기 - 1회부터 순차적으로 확인해서 가장 높은 유효한 이닝 사용
      let currentInning = 1;
      let relayData = null;
      
      console.log('🔍 Finding current inning for game:', this.currentGameId);
      
      // 1회부터 9회까지 순차적으로 확인
      for (let inning = 1; inning <= 9; inning++) {
        try {
          console.log('🔍 Checking inning:', inning);
          const relayResponse = await axiosInstance.get(`/api/games/${this.currentGameId}/relay/${inning}/`);
          
          if (relayResponse.data && relayResponse.data.data) {
            currentInning = inning;
            relayData = relayResponse.data;
            console.log('🔍 Found valid inning:', inning);
          }
        } catch (inningError) {
          console.log('🔍 Inning', inning, 'not available, stopping search');
          break; // 더 이상 유효한 이닝이 없음
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
      
      console.log('🔍 Using inning:', currentInning);

      // 최신 투수/타자 정보 추출
      let currentPitcher = '투수';
      let currentBatter = '타자';
      let currentHalf = 'top';

      if (relayData.data) {
        // 말 이닝에서 진행 중인 경우
        if (relayData.data.bot && relayData.data.bot.atbats && relayData.data.bot.atbats.length > 0) {
          const lastBotAtBat = relayData.data.bot.atbats[relayData.data.bot.atbats.length - 1];
          if (lastBotAtBat.actual_batter && lastBotAtBat.pitcher) {
            currentBatter = typeof lastBotAtBat.actual_batter === 'object' 
              ? lastBotAtBat.actual_batter.player_name || '타자'
              : String(lastBotAtBat.actual_batter);
            currentPitcher = typeof lastBotAtBat.pitcher === 'object'
              ? lastBotAtBat.pitcher.player_name || '투수'
              : String(lastBotAtBat.pitcher);
            currentHalf = 'bot';
          }
        }
        // 초 이닝에서 진행 중이거나 말 이닝에 데이터가 없는 경우
        else if (relayData.data.top && relayData.data.top.atbats && relayData.data.top.atbats.length > 0) {
          const lastTopAtBat = relayData.data.top.atbats[relayData.data.top.atbats.length - 1];
          if (lastTopAtBat.actual_batter && lastTopAtBat.pitcher) {
            currentBatter = typeof lastTopAtBat.actual_batter === 'object'
              ? lastTopAtBat.actual_batter.player_name || '타자'
              : String(lastTopAtBat.actual_batter);
            currentPitcher = typeof lastTopAtBat.pitcher === 'object'
              ? lastTopAtBat.pitcher.player_name || '투수'
              : String(lastTopAtBat.pitcher);
            currentHalf = 'top';
          }
        }
      }

      const homeTeamName = teamNameMap[gameData.home_team] || gameData.home_team;
      const awayTeamName = teamNameMap[gameData.away_team] || gameData.away_team;
      const homeScore = gameData.home_total_score || 0;
      const awayScore = gameData.away_total_score || 0;

      // 초/말에 따라 투수/타자 위치 결정
      // 초: 원정팀 공격 (원정팀 타자 vs 홈팀 투수)
      // 말: 홈팀 공격 (홈팀 타자 vs 원정팀 투수)
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

      // 게임 멘트 생성
      let gameMessage = `⚾ ${awayTeamName} vs ${homeTeamName}\n📊 ${awayScore} : ${homeScore}`;
      
      // 최근 타석에서 멘트 생성 시도
      try {
        if (relayData.data) {
          const currentData = relayData.data[currentHalf];
          if (currentData && currentData.atbats && currentData.atbats.length > 0) {
            const lastAtBat = currentData.atbats[currentData.atbats.length - 1];
            
            // 안타, 홈런, 적시타 등 주요 이벤트만 멘트 생성
            if (lastAtBat.main_result && 
                (lastAtBat.main_result.includes('안타') || 
                 lastAtBat.main_result.includes('홈런') ||
                 lastAtBat.main_result.includes('타점') ||
                 (lastAtBat.full_result && lastAtBat.full_result.includes('홈인')))) {
              
              const attackingTeamName = currentHalf === 'top' ? awayTeamName : homeTeamName;
              const situation = extractSituationFromAtBat(lastAtBat, attackingTeamName, currentInning, currentHalf as 'top' | 'bot');
              
              if (situation) {
                const comment = generateGameComment(situation);
                gameMessage = `⚾ ${awayTeamName} vs ${homeTeamName}\n📊 ${awayScore} : ${homeScore}\n\n${comment}`;
                console.log('🔍 Generated game comment:', comment);
              }
            }
          }
        }
      } catch (commentError) {
        console.warn('🔍 Comment generation failed, using default message');
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
