import { CommentTemplate, GameState, COMMENT_TEMPLATES } from '../constants/commentTemplates';

// 이전 경기 상태를 저장하는 인터페이스
export interface PreviousGameState {
  score: string;
  onBase: {
    base1: string;
    base2: string;
    base3: string;
  };
  mainResult?: string;
  inning?: string;
  half?: 'top' | 'bot';
}

// 템플릿 변수 치환 함수
export function replaceTemplateVariables(template: string, gameState: GameState): string {
  let result = template;
  
  // 기본 변수들 치환
  const variables: { [key: string]: string } = {
    '{INNING}': gameState.inning || '',
    '{TEAM_NAME}': gameState.teamName || '',
    '{PLAYER_NAME}': gameState.playerName || '',
    '{PITCHER_NAME}': gameState.pitcherName || '',
    '{SCORE}': gameState.score || '',
    '{RUN_TYPE}': gameState.runType || '',
    '{HR_TYPE}': gameState.hrType || '',
    '{OUTS}': gameState.outs || '',
    '{STRIKEOUT_COUNT}': gameState.strikeoutCount || '',
  };

  // 변수 치환
  Object.entries(variables).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });

  return result;
}

// 득점타 여부 확인
export function isHittingResult(mainResult: string): boolean {
  const hittingResults = ['안타', '1루타', '2루타', '3루타', '홈런', '출루'];
  return hittingResults.some(result => mainResult.includes(result));
}

// 홈런 여부 확인
export function isHomeRun(mainResult: string): boolean {
  return mainResult.includes('홈런');
}

// 삼진 여부 확인
export function isStrikeout(mainResult: string): boolean {
  return mainResult.includes('삼진');
}

// 만루 상황 확인
export function isBasesLoaded(onBase: { base1: string; base2: string; base3: string }): boolean {
  return onBase.base1 !== '0' && onBase.base2 !== '0' && onBase.base3 !== '0';
}

// 득점권 상황 확인
export function isScoringPosition(onBase: { base1: string; base2: string; base3: string }): boolean {
  return onBase.base2 !== '0' || onBase.base3 !== '0';
}

// 점수 파싱 함수
export function parseScore(score: string): { home: number; away: number } | null {
  if (!score || typeof score !== 'string') return null;
  
  const parts = score.split(':');
  if (parts.length !== 2) return null;
  
  const home = parseInt(parts[1], 10);
  const away = parseInt(parts[0], 10);
  
  if (isNaN(home) || isNaN(away)) return null;
  
  return { home, away };
}

// 점수 변화 확인
export function getScoreChange(previousScore: string, currentScore: string): {
  homeChanged: boolean;
  awayChanged: boolean;
  homeGained: number;
  awayGained: number;
} {
  const prev = parseScore(previousScore);
  const curr = parseScore(currentScore);
  
  if (!prev || !curr) {
    return { homeChanged: false, awayChanged: false, homeGained: 0, awayGained: 0 };
  }
  
  return {
    homeChanged: curr.home !== prev.home,
    awayChanged: curr.away !== prev.away,
    homeGained: curr.home - prev.home,
    awayGained: curr.away - prev.away,
  };
}

// 이닝 번호 추출
export function extractInningNumber(inning: string): number {
  const match = inning.match(/(\d+)회/);
  return match ? parseInt(match[1], 10) : 0;
}

// 조건 평가 함수
export function evaluateCondition(
  condition: string,
  currentState: GameState,
  previousState?: PreviousGameState
): boolean {
  if (!condition) return true; // 조건이 없으면 항상 true

  try {
    // main_result 조건 확인
    if (condition.includes("main_result에 '안타', '2루타' 등 득점타 포함")) {
      if (!isHittingResult(currentState.mainResult)) return false;
    }
    
    if (condition.includes("main_result에 '홈런' 포함")) {
      if (!isHomeRun(currentState.mainResult)) return false;
    }
    
    if (condition.includes("main_result에 '삼진' 포함")) {
      if (!isStrikeout(currentState.mainResult)) return false;
    }

    // 점수 조건 확인
    if (condition.includes("score가 지는 상황에서 이기는 상황으로 변경")) {
      if (!previousState) return false;
      const prevScore = parseScore(previousState.score);
      const currScore = parseScore(currentState.score);
      if (!prevScore || !currScore) return false;
      
      // 현재 팀이 이전에 지고 있었는지 확인 (간단한 구현)
      // 실제로는 어느 팀이 공격 중인지에 따라 판단해야 함
      return prevScore.home !== currScore.home || prevScore.away !== currScore.away;
    }
    
    if (condition.includes("score가 동점에서 이기는 상황으로 변경")) {
      if (!previousState) return false;
      const prevScore = parseScore(previousState.score);
      const currScore = parseScore(currentState.score);
      if (!prevScore || !currScore) return false;
      
      const wasTied = prevScore.home === prevScore.away;
      const isNowWinning = currScore.home !== currScore.away;
      return wasTied && isNowWinning;
    }
    
    if (condition.includes("score가 지는 상황에서 동점으로 변경")) {
      if (!previousState) return false;
      const prevScore = parseScore(previousState.score);
      const currScore = parseScore(currentState.score);
      if (!prevScore || !currScore) return false;
      
      const wasLosing = prevScore.home !== prevScore.away;
      const isNowTied = currScore.home === currScore.away;
      return wasLosing && isNowTied;
    }
    
    if (condition.includes("score가 0:0에서 득점하는 상황으로 변경")) {
      if (!previousState) return false;
      const prevScore = parseScore(previousState.score);
      const currScore = parseScore(currentState.score);
      if (!prevScore || !currScore) return false;
      
      const wasZeroZero = prevScore.home === 0 && prevScore.away === 0;
      const hasScored = currScore.home > 0 || currScore.away > 0;
      return wasZeroZero && hasScored;
    }

    // 이닝 조건 확인
    if (condition.includes("inning >= 7")) {
      const inningNum = extractInningNumber(currentState.inning);
      if (inningNum < 7) return false;
    }
    
    if (condition.includes("inning >= 9")) {
      const inningNum = extractInningNumber(currentState.inning);
      if (inningNum < 9) return false;
    }

    // half 조건 확인
    if (condition.includes("half == 'bottom'")) {
      if (currentState.half !== 'bot') return false;
    }

    // 주자 상황 조건 확인
    if (condition.includes("플레이 전 on_base가 {'base1':'n', 'base2':'n', 'base3':'n'} 일 때")) {
      if (!previousState) return false;
      if (!isBasesLoaded(previousState.onBase)) return false;
    }
    
    if (condition.includes("플레이 전 on_base의 base2 또는 base3가 '0'이 아닐 때")) {
      if (!previousState) return false;
      if (!isScoringPosition(previousState.onBase)) return false;
    }

    // 아웃 카운트 조건 확인
    if (condition.includes("out == '2'")) {
      if (currentState.outs !== '2사') return false;
    }

    // 백투백 홈런 조건 확인
    if (condition.includes("직전 타석의 main_result에도 '홈런'이 포함될 때")) {
      if (!previousState?.mainResult) return false;
      if (!isHomeRun(previousState.mainResult)) return false;
    }

    // 대타 조건 확인
    if (condition.includes("original_batter != null")) {
      if (!currentState.originalBatter) return false;
    }

    return true;
  } catch (error) {
    console.error('조건 평가 중 오류:', error);
    return false;
  }
}

// 적절한 템플릿 선택 함수
export function selectAppropriateTemplate(
  currentState: GameState,
  previousState?: PreviousGameState
): CommentTemplate | null {
  // 현재 상황에 맞는 템플릿들을 필터링
  const candidateTemplates = COMMENT_TEMPLATES.filter(template => {
    return evaluateCondition(template.condition, currentState, previousState);
  });

  if (candidateTemplates.length === 0) {
    return null;
  }

  // 우선순위에 따라 템플릿 선택
  // 1. 홈런 관련 템플릿 우선
  if (isHomeRun(currentState.mainResult)) {
    const homeRunTemplates = candidateTemplates.filter(t => t.category === '홈런');
    if (homeRunTemplates.length > 0) {
      return homeRunTemplates[Math.floor(Math.random() * homeRunTemplates.length)];
    }
  }

  // 2. 득점 관련 템플릿
  if (isHittingResult(currentState.mainResult)) {
    const hittingTemplates = candidateTemplates.filter(t => t.category === '득점/찬스');
    if (hittingTemplates.length > 0) {
      return hittingTemplates[Math.floor(Math.random() * hittingTemplates.length)];
    }
  }

  // 3. 탈삼진 관련 템플릿
  if (isStrikeout(currentState.mainResult)) {
    const strikeoutTemplates = candidateTemplates.filter(t => t.category === '탈삼진');
    if (strikeoutTemplates.length > 0) {
      return strikeoutTemplates[Math.floor(Math.random() * strikeoutTemplates.length)];
    }
  }

  // 4. 기본적으로 첫 번째 후보 반환
  return candidateTemplates[0];
}

// 멘트 생성 메인 함수
export function generateComment(
  currentState: GameState,
  previousState?: PreviousGameState
): string | null {
  const template = selectAppropriateTemplate(currentState, previousState);
  
  if (!template) {
    return null;
  }

  return replaceTemplateVariables(template.template, currentState);
}

// 게임 상태를 GameState 형태로 변환하는 헬퍼 함수
export function convertToGameState(
  apiData: any,
  teamName: string
): GameState {
  return {
    inning: apiData.inning || '',
    teamName: teamName,
    playerName: apiData.actual_batter?.player_name || '',
    pitcherName: apiData.pitcher?.player_name || '',
    score: apiData.score || '',
    runType: apiData.run_type || '',
    hrType: apiData.hr_type || '',
    outs: apiData.outs || '',
    strikeoutCount: apiData.strikeout_count || '',
    mainResult: apiData.main_result || '',
    onBase: apiData.on_base || { base1: '0', base2: '0', base3: '0' },
    half: apiData.half || 'top',
    originalBatter: apiData.original_batter,
    previousMainResult: apiData.previous_main_result
  };
}


