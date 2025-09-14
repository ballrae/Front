import { GameState, PreviousGameState } from '../constants/commentTemplates';
import { generateComment } from './commentTemplateEngine';

// 경기 상태 변화를 감지하고 멘트를 생성하는 매니저 클래스
export class GameStateManager {
  private previousState: PreviousGameState | null = null;
  private currentState: GameState | null = null;
  private commentHistory: string[] = [];
  private maxHistorySize = 10;

  // 새로운 경기 상태 업데이트
  updateGameState(newState: GameState): string | null {
    // 이전 상태를 현재 상태로 이동
    if (this.currentState) {
      this.previousState = {
        score: this.currentState.score,
        onBase: { ...this.currentState.onBase },
        mainResult: this.currentState.mainResult,
        inning: this.currentState.inning,
        half: this.currentState.half
      };
    }

    // 새로운 상태로 업데이트
    this.currentState = { ...newState };

    // 상태 변화가 있는지 확인
    if (!this.hasSignificantChange()) {
      return null;
    }

    // 멘트 생성
    const comment = generateComment(this.currentState, this.previousState || undefined);
    
    if (comment) {
      this.addToHistory(comment);
      return comment;
    }

    return null;
  }

  // 의미있는 변화가 있는지 확인
  private hasSignificantChange(): boolean {
    if (!this.previousState || !this.currentState) {
      return true; // 첫 번째 상태 업데이트
    }

    // 점수 변화 확인
    if (this.previousState.score !== this.currentState.score) {
      return true;
    }

    // 주자 상황 변화 확인
    const prevOnBase = this.previousState.onBase;
    const currOnBase = this.currentState.onBase;
    if (
      prevOnBase.base1 !== currOnBase.base1 ||
      prevOnBase.base2 !== currOnBase.base2 ||
      prevOnBase.base3 !== currOnBase.base3
    ) {
      return true;
    }

    // 이닝 변화 확인
    if (this.previousState.inning !== this.currentState.inning) {
      return true;
    }

    // half 변화 확인
    if (this.previousState.half !== this.currentState.half) {
      return true;
    }

    // main_result 변화 확인 (새로운 플레이)
    if (this.previousState.mainResult !== this.currentState.mainResult) {
      return true;
    }

    return false;
  }

  // 멘트 히스토리에 추가
  private addToHistory(comment: string): void {
    this.commentHistory.unshift(comment);
    
    // 히스토리 크기 제한
    if (this.commentHistory.length > this.maxHistorySize) {
      this.commentHistory = this.commentHistory.slice(0, this.maxHistorySize);
    }
  }

  // 현재 상태 반환
  getCurrentState(): GameState | null {
    return this.currentState;
  }

  // 이전 상태 반환
  getPreviousState(): PreviousGameState | null {
    return this.previousState;
  }

  // 멘트 히스토리 반환
  getCommentHistory(): string[] {
    return [...this.commentHistory];
  }

  // 최근 N개의 멘트 반환
  getRecentComments(count: number = 5): string[] {
    return this.commentHistory.slice(0, count);
  }

  // 상태 초기화
  reset(): void {
    this.previousState = null;
    this.currentState = null;
    this.commentHistory = [];
  }

  // 특정 상황에 대한 멘트 강제 생성 (테스트용)
  forceGenerateComment(scenario: string): string | null {
    if (!this.currentState) {
      return null;
    }

    // 시나리오에 따른 상태 수정
    const modifiedState = this.modifyStateForScenario(this.currentState, scenario);
    
    return generateComment(modifiedState, this.previousState || undefined);
  }

  // 시나리오에 따른 상태 수정 (테스트용)
  private modifyStateForScenario(state: GameState, scenario: string): GameState {
    const modifiedState = { ...state };

    switch (scenario) {
      case 'home_run':
        modifiedState.mainResult = '홈런';
        modifiedState.hrType = '솔로 홈런';
        break;
      case 'grand_slam':
        modifiedState.mainResult = '홈런';
        modifiedState.hrType = '역전 만루포';
        modifiedState.onBase = { base1: '1', base2: '2', base3: '3' };
        break;
      case 'strikeout':
        modifiedState.mainResult = '삼진';
        break;
      case 'hitting':
        modifiedState.mainResult = '안타';
        modifiedState.runType = '적시타';
        break;
      case 'comeback':
        modifiedState.mainResult = '안타';
        modifiedState.runType = '역전 2타점 적시타';
        break;
      default:
        break;
    }

    return modifiedState;
  }
}

// 싱글톤 인스턴스
export const gameStateManager = new GameStateManager();

// API 데이터를 GameState로 변환하는 헬퍼 함수들
export function convertApiDataToGameState(
  apiData: any,
  teamName: string,
  isHomeTeam: boolean = false
): GameState {
  // API 데이터에서 필요한 정보 추출
  const currentAtbat = apiData.current_atbat || {};
  const gameInfo = apiData.game_info || {};
  
  // 이닝 정보 처리
  const inning = gameInfo.inning ? `${gameInfo.inning}회${gameInfo.half === 'top' ? '초' : '말'}` : '';
  
  // 점수 정보 처리
  const score = gameInfo.score || '0:0';
  
  // 아웃 카운트 처리
  const outs = gameInfo.outs ? `${gameInfo.outs}사` : '';
  
  // 주자 상황 처리
  const onBase = currentAtbat.on_base || { base1: '0', base2: '0', base3: '0' };
  
  // 선수 정보 처리
  const playerName = currentAtbat.actual_batter?.player_name || '';
  const pitcherName = currentAtbat.pitcher?.player_name || '';
  
  // 결과 정보 처리
  const mainResult = currentAtbat.main_result || '';
  
  // 득점 타입 및 홈런 타입 처리
  let runType = '';
  let hrType = '';
  
  if (mainResult.includes('홈런')) {
    if (onBase.base1 !== '0' && onBase.base2 !== '0' && onBase.base3 !== '0') {
      hrType = '역전 만루포';
    } else if (onBase.base1 !== '0' || onBase.base2 !== '0' || onBase.base3 !== '0') {
      hrType = '투런 홈런';
    } else {
      hrType = '솔로 홈런';
    }
  } else if (mainResult.includes('안타') || mainResult.includes('타')) {
    runType = '적시타';
  }
  
  return {
    inning,
    teamName,
    playerName,
    pitcherName,
    score,
    runType,
    hrType,
    outs,
    strikeoutCount: currentAtbat.strikeout_count || '0',
    mainResult,
    onBase,
    half: gameInfo.half === 'top' ? 'top' : 'bot',
    originalBatter: currentAtbat.original_batter,
    previousMainResult: currentAtbat.previous_main_result
  };
}

// 실시간 데이터 변화 감지 및 멘트 생성
export function processRealtimeData(
  apiData: any,
  teamName: string,
  isHomeTeam: boolean = false
): string | null {
  const gameState = convertApiDataToGameState(apiData, teamName, isHomeTeam);
  return gameStateManager.updateGameState(gameState);
}

// 디버깅을 위한 상태 정보 출력
export function debugGameState(): void {
  console.log('=== Game State Manager Debug ===');
  console.log('Current State:', gameStateManager.getCurrentState());
  console.log('Previous State:', gameStateManager.getPreviousState());
  console.log('Comment History:', gameStateManager.getCommentHistory());
  console.log('================================');
}


