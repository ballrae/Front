// src/utils/gameCommentGenerator.ts

interface GameSituation {
  playerName: string;
  teamName: string;
  inning: number;
  half: 'top' | 'bot';
  mainResult: string;
  fullResult: string;
  outs: number;
  score: string;
  pitcherName: string;
  onBase: {
    base1: string;
    base2: string;
    base3: string;
  };
}

// 멘트 템플릿들
const COMMENT_TEMPLATES = {
  // 일반 적시타 (RBI 상황)
  RBI_HIT: [
    "해결사는 역시 {PLAYER_NAME}! {INNING}의 영웅으로 떠오르는 결정적인 한 방입니다!",
    "{OUTS} 상황, 모두를 숨죽이게 한 순간! {PLAYER_NAME}이(가) 주자를 홈으로 불러들입니다.",
    "{PITCHER_NAME}을(를) 무너뜨리는 {PLAYER_NAME}의 귀중한 적시타! {TEAM_NAME} 더그아웃이 열광합니다.",
    "필요한 순간에 터진 값진 안타! {PLAYER_NAME}이(가) 팀의 믿음에 완벽하게 보답합니다.",
    "주자를 모두 쓸어 담는 {RUN_TYPE}! {PLAYER_NAME}이(가) 단숨에 경기의 분위기를 가져옵니다.",
    "승리를 향한 집념! {PLAYER_NAME}의 안타 하나가 경기의 향방을 바꾸고 있습니다.",
    "오늘 경기의 히어로, {PLAYER_NAME}! 그의 방망이가 {TEAM_NAME}을(를) 승리로 이끌고 있습니다.",
    "팬들의 함성을 자아내는 {PLAYER_NAME}의 적시타! 이제 리드는 {TEAM_NAME}의 것입니다."
  ],
  
  // 일반 안타
  REGULAR_HIT: [
    "{PLAYER_NAME}의 깔끔한 안타! {TEAM_NAME}의 공격이 살아나고 있습니다.",
    "타이밍을 놓치지 않는 {PLAYER_NAME}! 완벽한 컨택으로 루상을 밟습니다.",
    "{PITCHER_NAME}의 공을 정확히 노린 {PLAYER_NAME}의 안타입니다!",
    "집중력이 돋보이는 {PLAYER_NAME}의 타격! {TEAM_NAME}에게 기회가 생겼습니다."
  ],

  // 홈런
  HOMERUN: [
    "나갔습니다! {PLAYER_NAME}의 {HR_TYPE}! 스탠드가 들썩입니다!",
    "완벽한 스윙! {PLAYER_NAME}이(가) {HR_TYPE}으로 팬들을 열광시킵니다!",
    "이것이 바로 홈런입니다! {PLAYER_NAME}의 {HR_TYPE}이 경기를 뒤흔들고 있습니다!",
    "{TEAM_NAME}의 포포! {PLAYER_NAME}이(가) {HR_TYPE}으로 스코어보드를 바꿉니다!"
  ],

  // 삼진
  STRIKEOUT: [
    "{PITCHER_NAME}의 완벽한 삼진! {STRIKEOUT_COUNT}개째 탈삼진을 기록합니다.",
    "헛스윙 삼진! {PITCHER_NAME}이(가) {PLAYER_NAME}을(를) 완벽하게 잡아냅니다.",
    "{PITCHER_NAME}의 결정구! 오늘 {STRIKEOUT_COUNT}번째 삼진입니다."
  ],

  // 기본 상황
  DEFAULT: [
    "{INNING} {TEAM_NAME}의 공격이 계속됩니다.",
    "현재 스코어 {SCORE}, 치열한 접전이 이어지고 있습니다.",
    "{PLAYER_NAME}의 타석, 어떤 결과가 나올까요?"
  ]
};

// 결과 타입 분석
function analyzeResult(mainResult: string, fullResult: string): string {
  const result = mainResult.toLowerCase();
  
  if (result.includes('홈런') || result.includes('만루홈런')) {
    return 'HOMERUN';
  }
  
  if (result.includes('삼진')) {
    return 'STRIKEOUT';
  }
  
  if (result.includes('안타') || result.includes('1루타') || result.includes('2루타') || result.includes('3루타')) {
    // 적시타인지 확인 (fullResult에서 "홈인" 포함 여부)
    if (fullResult && fullResult.includes('홈인')) {
      return 'RBI_HIT';
    }
    return 'REGULAR_HIT';
  }
  
  return 'DEFAULT';
}

// 홈런 타입 결정
function getHomerunType(mainResult: string, fullResult: string, onBase: any): string {
  if (mainResult.includes('만루홈런')) return '만루 홈런';
  
  const baseRunners = Object.values(onBase).filter(base => base !== '0').length;
  
  if (baseRunners === 0) return '솔로 홈런';
  if (baseRunners === 1) return '투런 홈런';
  if (baseRunners === 2) return '쓰리런 홈런';
  if (baseRunners === 3) return '만루 홈런';
  
  return '홈런';
}

// 득점 타입 결정 
function getRunType(fullResult: string, currentScore: string): string {
  if (!fullResult) return '적시타';
  
  const runs = (fullResult.match(/홈인/g) || []).length;
  
  if (runs >= 2) return `${runs}타점 적시타`;
  
  // 스코어로 동점/역전 여부 판단
  const [awayScore, homeScore] = currentScore.split(':').map(Number);
  if (awayScore === homeScore) return '동점타';
  
  return '적시타';
}

// 아웃 카운트를 텍스트로 변환
function getOutsText(outs: number): string {
  if (outs === 0) return '무사';
  if (outs === 1) return '1사';
  if (outs === 2) return '2사';
  return `${outs}사`;
}

// 이닝 텍스트 생성
function getInningText(inning: number, half: 'top' | 'bot'): string {
  const halfText = half === 'top' ? '초' : '말';
  return `${inning}회${halfText}`;
}

// 메인 멘트 생성 함수
export function generateGameComment(situation: GameSituation): string {
  const resultType = analyzeResult(situation.mainResult, situation.fullResult);
  const templates = COMMENT_TEMPLATES[resultType as keyof typeof COMMENT_TEMPLATES] || COMMENT_TEMPLATES.DEFAULT;
  
  // 랜덤하게 템플릿 선택
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // 변수 치환
  let comment = template
    .replace(/{PLAYER_NAME}/g, situation.playerName)
    .replace(/{TEAM_NAME}/g, situation.teamName)
    .replace(/{INNING}/g, getInningText(situation.inning, situation.half))
    .replace(/{OUTS}/g, getOutsText(situation.outs))
    .replace(/{SCORE}/g, situation.score)
    .replace(/{PITCHER_NAME}/g, situation.pitcherName);
  
  // 홈런 타입
  if (resultType === 'HOMERUN') {
    const hrType = getHomerunType(situation.mainResult, situation.fullResult, situation.onBase);
    comment = comment.replace(/{HR_TYPE}/g, hrType);
  }
  
  // 적시타 타입
  if (resultType === 'RBI_HIT') {
    const runType = getRunType(situation.fullResult, situation.score);
    comment = comment.replace(/{RUN_TYPE}/g, runType);
  }
  
  // 삼진 카운트 (임시로 랜덤 값 - 실제로는 누적 데이터 필요)
  if (resultType === 'STRIKEOUT') {
    const strikeoutCount = Math.floor(Math.random() * 10) + 1;
    comment = comment.replace(/{STRIKEOUT_COUNT}/g, strikeoutCount.toString());
  }
  
  return comment;
}

// 최근 타석 결과에서 상황 정보 추출
export function extractSituationFromAtBat(atBat: any, teamName: string, inning: number, half: 'top' | 'bot'): GameSituation | null {
  if (!atBat || !atBat.main_result) return null;
  
  const playerName = typeof atBat.actual_batter === 'object' 
    ? atBat.actual_batter?.player_name || '선수'
    : String(atBat.actual_batter || '선수');
    
  const pitcherName = typeof atBat.pitcher === 'object'
    ? atBat.pitcher?.player_name || '투수'
    : String(atBat.pitcher || '투수');
  
  return {
    playerName,
    teamName,
    inning,
    half,
    mainResult: atBat.main_result || '',
    fullResult: atBat.full_result || '',
    outs: parseInt(atBat.out || '0'),
    score: atBat.score || '0:0',
    pitcherName,
    onBase: atBat.on_base || { base1: '0', base2: '0', base3: '0' }
  };
}
