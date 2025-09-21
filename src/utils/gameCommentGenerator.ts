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
  // 역전타
  COMEBACK_HIT: [
    "경기를 뒤집습니다! {PLAYER_NAME}의 {RUN_TYPE}로 스코어 {SCORE}, {TEAM_NAME}{TEAM_JOSA_IGA} 리드를 잡습니다!",
    "스코어 {SCORE}, 경기를 뒤집는 {PLAYER_NAME}의 역전타! {TEAM_NAME}의 더그아웃이 들썩입니다!",
    "이보다 더 좋을 순 없다! {PLAYER_NAME}, 가장 중요한 순간에 팀의 리드를 되찾아옵니다."
  ],

  // 결승타
  WINNING_HIT: [
    "팽팽했던 0의 균형을 깨는 {PLAYER_NAME}의 선취 적시타! {TEAM_NAME}{TEAM_JOSA_IGA} 먼저 앞서나갑니다.",
    "끈질긴 승부 끝에 만들어낸 {PLAYER_NAME}의 결승타! {TEAM_NAME}에게 승리가 가까워집니다."
  ],

  // 동점타
  TIE_HIT: [
    "이제 경기는 원점! {PLAYER_NAME}의 동점타가 터지며 승부는 다시 미궁 속으로 빠집니다.",
    "패배 직전에서 팀을 구해내는 {PLAYER_NAME}의 극적인 동점타! 경기는 끝나지 않았습니다."
  ],

  // 일반 적시타 (RBI 상황)
  RBI_HIT: [
    "해결사는 역시 {PLAYER_NAME}! {INNING}의 영웅으로 떠오르는 결정적인 한 방입니다!",
    "{OUTS} 상황, 모두를 숨죽이게 한 순간! {PLAYER_NAME}{PLAYER_JOSA_IGA} 주자를 홈으로 불러들입니다.",
    "{PITCHER_NAME}{PITCHER_JOSA_EULREUL} 무너뜨리는 {PLAYER_NAME}의 귀중한 적시타! {TEAM_NAME} 더그아웃이 열광합니다!",
    "필요한 순간에 터진 값진 안타! {PLAYER_NAME}{PLAYER_JOSA_IGA} 팀의 믿음에 완벽하게 보답합니다.",
    "주자를 모두 쓸어 담는 {RUN_TYPE}! {PLAYER_NAME}{PLAYER_JOSA_IGA} 단숨에 경기의 분위기를 가져옵니다.",
    "승리를 향한 집념! {PLAYER_NAME}의 안타 하나가 경기의 향방을 바꾸고 있습니다.",
    "오늘 경기의 히어로, {PLAYER_NAME}! 그의 방망이가 {TEAM_NAME}{TEAM_JOSA_EULREUL} 승리로 이끌고 있습니다.",
    "팬들의 함성을 자아내는 {PLAYER_NAME}의 적시타! 이제 리드는 {TEAM_NAME}의 것입니다."
  ],
  
  // 1루타
  SINGLE_HIT: [
    "{PLAYER_NAME}의 깔끔한 1루타!\n{TEAM_NAME}의 공격이 살아나고 있습니다.",
    "타이밍을 놓치지 않는 {PLAYER_NAME}!\n완벽한 컨택으로 1루를 밟습니다.",
    "{PITCHER_NAME}의 공을 정확히 노린\n{PLAYER_NAME}의 1루타입니다!",
    "집중력이 돋보이는 {PLAYER_NAME}의 타격!\n{TEAM_NAME}{TEAM_JOSA_EULREUL} 기회가 생겼습니다.",
    "안전한 1루타! {PLAYER_NAME}{PLAYER_JOSA_IGA} 팀의 공격을 이어갑니다.",
    "깔끔한 컨택! {PLAYER_NAME}의 1루타로 {TEAM_NAME}의 공격이 시작됩니다."
  ],

  // 2루타
  DOUBLE_HIT: [
    "2루타! {PLAYER_NAME}{PLAYER_JOSA_IGA} 득점권에 주자를 보냅니다!",
    "깊은 2루타! {PLAYER_NAME}의 타구가 펜스 근처까지 날아갑니다!",
    "완벽한 2루타! {PLAYER_NAME}{PLAYER_JOSA_IGA} 득점권에 안착합니다!",
    "2루까지! {PLAYER_NAME}의 타구가 {TEAM_NAME}의 공격을 살립니다!",
    "깔끔한 2루타! {PLAYER_NAME}{PLAYER_JOSA_IGA} 득점권에 주자를 배치합니다!",
    "2루타로 득점권! {PLAYER_NAME}의 한 방이 {TEAM_NAME}에게 기회를 만들어줍니다!"
  ],

  // 3루타
  TRIPLE_HIT: [
    "3루타! {PLAYER_NAME}{PLAYER_JOSA_IGA} 3루까지 달려갑니다!",
    "드라마틱한 3루타! {PLAYER_NAME}의 타구가 펜스에 맞고 튕깁니다!",
    "3루까지! {PLAYER_NAME}{PLAYER_JOSA_IGA} 득점권에 주자를 배치합니다!",
    "완벽한 3루타! {PLAYER_NAME}의 타구가 {TEAM_NAME}의 공격을 살립니다!",
    "3루타로 득점권! {PLAYER_NAME}의 한 방이 {TEAM_NAME}에게 기회를 만들어줍니다!",
    "3루까지! {PLAYER_NAME}{PLAYER_JOSA_IGA} 득점권에 주자를 배치합니다!"
  ],

  // 일반 안타 (기존)
  REGULAR_HIT: [
    "{PLAYER_NAME}의 깔끔한 안타!\n{TEAM_NAME}의 공격이 살아나고 있습니다.",
    "타이밍을 놓치지 않는 {PLAYER_NAME}!\n완벽한 컨택으로 루상을 밟습니다.",
    "{PITCHER_NAME}의 공을 정확히 노린\n{PLAYER_NAME}의 안타입니다!",
    "집중력이 돋보이는 {PLAYER_NAME}의 타격!\n{TEAM_NAME}{TEAM_JOSA_EULREUL} 기회가 생겼습니다."
  ],

  // 만루홈런
  GRAND_SLAM: [
    "그랜드슬램! {PLAYER_NAME}{PLAYER_JOSA_IGA} {OUTS} 만루 상황에서 경기를 지배하는 역전 만루 홈런을 터뜨립니다!",
    "만루홈런! {PLAYER_NAME}의 한 방이 경기를 완전히 뒤바꿉니다!",
    "역전 만루홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 팬들을 열광시키는 그랜드슬램을 작렬시킵니다!"
  ],

  // 역전홈런
  COMEBACK_HOMERUN: [
    "{PITCHER_NAME}의 결정구를 그대로 받아쳐 역전을 만드는 {PLAYER_NAME}의 홈런!",
    "역전홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 경기의 흐름을 완전히 바꿔놓습니다!",
    "한 방의 역전! {PLAYER_NAME}의 홈런이 팀을 승리로 이끕니다!"
  ],

  // 동점홈런
  TIE_HOMERUN: [
    "{INNING}에 터진 귀중한 동점 홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 패배의 위기에서 팀을 구해냅니다.",
    "동점홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 경기를 다시 원점으로 돌려놓습니다!",
    "극적인 동점홈런! {PLAYER_NAME}의 한 방이 팀을 구해냅니다!"
  ],

  // 끝내기홈런
  WALK_OFF_HOMERUN: [
    "경기를 끝내는 한 방! {PLAYER_NAME}의 끝내기 홈런으로 {TEAM_NAME}{TEAM_JOSA_IGA} 극적인 승리를 거둡니다!",
    "끝내기홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 경기를 완전히 마무리합니다!",
    "드라마틱한 끝내기! {PLAYER_NAME}의 홈런이 경기를 끝냅니다!"
  ],

  // 백투백홈런
  BACK_TO_BACK_HOMERUN: [
    "백투백 홈런! {PLAYER_NAME}까지 홈런포에 가세하며 {TEAM_NAME}{TEAM_JOSA_IGA} 완전히 분위기를 가져옵니다!",
    "연속 홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 홈런포를 이어가며 팀의 기세를 끌어올립니다!",
    "백투백! {PLAYER_NAME}의 홈런으로 연속 홈런이 완성됩니다!"
  ],

  // 대타홈런
  PINCH_HIT_HOMERUN: [
    "대타로 나와 홈런을 기록하는 {PLAYER_NAME}! 감독의 믿음에 완벽하게 부응합니다!",
    "대타홈런! {PLAYER_NAME}{PLAYER_JOSA_IGA} 감독의 선택이 완벽한 성공을 거둡니다!",
    "대타의 홈런! {PLAYER_NAME}이(가) 팀의 기대에 완벽하게 부응합니다!"
  ],

  // 일반 홈런
  HOMERUN: [
    "넘어갔습니다! {PLAYER_NAME}의 {HR_TYPE}! 경기장을 가득 메운 팬들에게 최고의 선물을 안깁니다!",
    "승리를 향한 축포! {PLAYER_NAME}{PLAYER_JOSA_IGA} 쏘아 올린 타구가 담장 밖으로 사라집니다!",
    "이 한 방으로 경기에 쐐기를 박습니다! {PLAYER_NAME}의 {HR_TYPE}이 터지며 스코어는 {SCORE}.",
    "침묵하던 {TEAM_NAME}의 타선, {PLAYER_NAME}의 솔로포로 다시 불타오르기 시작합니다!",
    "믿을 수 없는 비거리! {PLAYER_NAME}{PLAYER_JOSA_IGA} 왜 팀의 4번 타자인지를 증명하는 거대한 홈런입니다.",
    "타구는 빨랫줄처럼 뻗어가 담장을 넘어갑니다! {PLAYER_NAME}의 완벽한 스윙!",
    "오늘 경기 멀티 홈런! {PLAYER_NAME}의 방망이가 그야말로 불을 뿜고 있습니다!",
    "맞는 순간 직감했습니다! {PLAYER_NAME}의 타구가 아름다운 포물선을 그리며 관중석에 꽂힙니다.",
    "이 홈런으로 {TEAM_NAME}은(는) 승리에 한 발짝 더 다가섭니다. 스코어 {SCORE}."
  ],

  // 만루 위기 삼진
  BASES_LOADED_STRIKEOUT: [
    "{OUTS} 만루 위기, {PITCHER_NAME}{PITCHER_JOSA_IGA} {PLAYER_NAME}{PLAYER_JOSA_EULREUL} 삼진으로 막고 포효합니다!",
    "만루 위기에서의 삼진! {PITCHER_NAME}{PITCHER_JOSA_IGA} 위기를 완벽하게 극복합니다!",
    "위기 상황에서의 결정적 삼진! {PITCHER_NAME}이(가) 팀을 구해냅니다!"
  ],

  // 득점권 위기 삼진
  SCORING_POSITION_STRIKEOUT: [
    "1점의 리드를 지켜내는 혼신의 역투! {PITCHER_NAME}{PITCHER_JOSA_IGA} 주자를 묶어두고 삼진을 잡아냅니다.",
    "역전 주자가 있는 상황, {PITCHER_NAME}{PITCHER_JOSA_IGA} 흔들리지 않고 삼진으로 아웃카운트를 늘립니다.",
    "위기 뒤에 찾아온 삼진! {PITCHER_NAME}{PITCHER_JOSA_IGA} 스스로 만든 위기를 스스로 해결합니다."
  ],

  // 이닝 종료 삼진
  INNING_ENDING_STRIKEOUT: [
    "더 이상의 실점은 없다! {PITCHER_NAME}{PITCHER_JOSA_IGA} 오늘 {STRIKEOUT_COUNT}개째 KKK로 이닝을 종료시킵니다.",
    "이닝 종료 삼진! {PITCHER_NAME}{PITCHER_JOSA_IGA} 완벽하게 이닝을 마무리합니다!",
    "세이브 상황의 삼진! {PITCHER_NAME}{PITCHER_JOSA_IGA} 팀의 뒷문을 완벽하게 걸어 잠급니다!"
  ],

  // 일반 삼진
  STRIKEOUT: [
    "에이스의 품격! {PITCHER_NAME}, 가장 중요한 순간에 상대 클린업 트리오를 삼진으로 돌려세웁니다.",
    "풀카운트 승부, {PITCHER_NAME}의 선택은 바깥쪽 꽉 찬 직구! 타자가 꼼짝 못 합니다.",
    "연속 타자 탈삼진! {PITCHER_NAME}{PITCHER_JOSA_IGA} 마운드를 완벽하게 지배하고 있습니다.",
    "불같은 강속구! {PITCHER_NAME}의 구위에 상대 타선이 꽁꽁 묶여있습니다.",
    "팀을 구하는 결정적인 탈삼진! {PITCHER_NAME}{PITCHER_JOSA_IGA} 수비팀 더그아웃의 분위기를 다시 끌어올립니다.",
    "{INNING}, {OUTS} 상황. {PITCHER_NAME}{PITCHER_JOSA_IGA} 영리한 볼 배합으로 타자의 헛스윙을 유도합니다.",
    "이보다 더 좋을 수 없는 위기관리 능력! {PITCHER_NAME}{PITCHER_JOSA_IGA} 팀의 리드를 지켜냅니다.",
    "오늘 경기 최고의 하이라이트! {PITCHER_NAME}{PITCHER_JOSA_IGA} {PLAYER_NAME}과의 맞대결에서 삼진으로 승리합니다.",
    "삼진으로 이닝 선두타자를 잡아내며 기분 좋게 출발하는 {PITCHER_NAME}."
  ],

  // 볼넷
  WALK: [
    "{PITCHER_NAME}의 제구가 흔들렸습니다!\n{PLAYER_NAME}{PLAYER_JOSA_IGA} 볼넷으로 출루합니다.",
    "4볼! {PLAYER_NAME}{PLAYER_JOSA_IGA} 인내심으로\n1루를 얻어냅니다.",
    "{PITCHER_NAME}의 공이 높아졌습니다!\n{PLAYER_NAME}{PLAYER_JOSA_IGA} 볼넷으로 출루합니다.",
    "선택의 시간! {PLAYER_NAME}{PLAYER_JOSA_IGA} 볼넷으로\n{TEAM_NAME}{TEAM_JOSA_EULREUL} 기회를 만들어냅니다."
  ],

  // 삼중살
  TRIPLE_PLAY: [
    "1루, 2루, 그리고 3루까지! KBO 리그에서 좀처럼 보기 힘든 삼중살이 나옵니다! 믿을 수 없는 수비!",
    "한 번의 플레이로 이닝 종료! {TEAM_NAME}의 수비 집중력이 만들어낸 완벽한 트리플 플레이!",
    "삼중살! 야구의 꽃 같은 순간이 펼쳐집니다!",
    "한 번의 타구로 3개의 아웃! {TEAM_NAME}의 수비가 완벽한 트리플 플레이를 완성합니다!"
  ],

  // 병살타
  DOUBLE_PLAY: [
    "야구의 꽃, 병살타! {TEAM_NAME}의 내야진이 환상적인 호흡으로 위기를 넘깁니다!",
    "순식간에 아웃카운트 두 개! {PITCHER_NAME}{PITCHER_JOSA_IGA} {PLAYER_NAME}{PLAYER_JOSA_EULREUL} 병살타로 유도하며 이닝을 정리합니다.",
    "최악의 무사 만루 위기를 최상의 결과, 병살타로 막아내는 {TEAM_NAME}!",
    "공격의 흐름을 완벽하게 끊어내는 더블 플레이! {PITCHER_NAME}의 위기관리 능력이 돋보입니다.",
    "땅볼 하나로 아웃카운트 두 개를 잡아내며 투수의 어깨를 가볍게 해주는 완벽한 내야 수비!",
    "득점권 찬스가 무위로 돌아갑니다. {PLAYER_NAME}의 아쉬운 병살타.",
    "{INNING}의 결정적인 병살 수비! {TEAM_NAME}{TEAM_JOSA_IGA} 리드를 지켜내는 데 성공합니다.",
    "{PITCHER_NAME}의 유도에 {PLAYER_NAME}의 방망이가 그대로 따라가며 더블 플레이가 완성됩니다.",
    "키스톤 콤비의 완벽한 호흡! 4-6-3으로 이어지는 교과서적인 병살 플레이!",
    "무사 1,2루의 대량 득점 기회가 병살타 하나로 순식간에 2사 3루로 바뀝니다.",
    "{PITCHER_NAME}{PITCHER_JOSA_IGA} 원하는 가장 이상적인 결과! 병살타로 실점 없이 위기를 탈출합니다.",
    "{PLAYER_NAME}의 타구가 야수 정면으로 향하며 아쉬운 더블 플레이로 연결됩니다.",
    "{TEAM_NAME}의 수비력이 빛나는 순간! 중요한 상황에서 나온 병살타로 분위기를 가져옵니다."
  ],

  // 아웃 (일반)
  OUT: [
    "{PLAYER_NAME}의 타구가 잡혔습니다!\n{OUT_TYPE} 아웃으로 이닝이 끝납니다.",
    "수비진의 완벽한 플레이!\n{PLAYER_NAME}{PLAYER_JOSA_IGA} {OUT_TYPE} 아웃이 됩니다.",
    "아쉬운 타격! {PLAYER_NAME}{PLAYER_JOSA_IGA}\n{OUT_TYPE} 아웃으로 물러납니다.",
    "수비의 승리! {PLAYER_NAME}의 타구를\n{OUT_TYPE} 아웃으로 처리합니다."
  ],

  // 폭투/패스트볼
  WILDPITCH: [
    "{PITCHER_NAME}의 공이 뒤로 빠졌습니다!\n폭투로 주자가 진루합니다.",
    "제구 실수! {PITCHER_NAME}의 공이\n폭투로 주자를 보냅니다.",
    "아슬아슬한 상황에서 폭투!\n{PLAYER_NAME}{PLAYER_JOSA_IGA} 진루의 기회를 얻습니다."
  ],

  // 도루
  STEAL: [
    "{PLAYER_NAME}{PLAYER_JOSA_IGA} 도루를 시도합니다!\n성공적으로 다음 루로 달려갑니다!",
    "빠른 발! {PLAYER_NAME}{PLAYER_JOSA_IGA} 도루로\n{TEAM_NAME}{TEAM_JOSA_EULREUL} 기회를 만들어냅니다.",
    "도루 성공! {PLAYER_NAME}의 빠른 발이\n득점권에 한 걸음 더 가까워집니다."
  ],

  // 대타
  PINCH_HITTER: [
    "{INNING} 승부처, {TEAM_NAME}{TEAM_JOSA_IGA} 승부수를 던집니다. 타석에는 대타 {PLAYER_NAME}.",
    "좌완 {PITCHER_NAME} 공략을 위한 맞춤 카드! {PLAYER_NAME}{PLAYER_JOSA_IGA} 대타로 경기에 나섭니다.",
    "득점권 찬스, {TEAM_NAME}{TEAM_JOSA_IGA} 가장 믿을 수 있는 대타 {PLAYER_NAME}{PLAYER_JOSA_EULREUL} 기용합니다.",
    "{SCORE}의 접전 상황, 한 점을 짜내기 위한 {TEAM_NAME}의 선택은 대타 {PLAYER_NAME}입니다."
  ],

  // 대주자
  PINCH_RUNNER: [
    "1점 싸움, 빠른 발이 필요합니다. {PLAYER_NAME}{PLAYER_JOSA_IGA} 대주자로 투입되어 득점을 노립니다.",
    "{PLAYER_NAME} 대주자 투입. 다음 플레이는 번트 혹은 도루가 예상되는 상황입니다.",
    "{PLAYER_NAME}{PLAYER_JOSA_IGA} 1루 주자를 대신해 들어옵니다. 이제부터는 발야구 싸움입니다."
  ],

  // 마무리 투수
  CLOSER: [
    "이제 경기를 끝내기 위해 {TEAM_NAME}의 마무리 투수 {PITCHER_NAME}{PITCHER_JOSA_IGA} 등판합니다.",
    "마무리 투수 {PITCHER_NAME}의 등판! 경기의 마지막을 장식할 투수가 마운드에 오릅니다.",
    "세이브 상황! {TEAM_NAME}의 마무리 {PITCHER_NAME}이(가) 경기를 마무리할 차례입니다."
  ],

  // 필승조 투수
  RELIEF_PITCHER: [
    "마운드에 오르는 {TEAM_NAME}의 필승조, {PITCHER_NAME}. 이제 경기는 새로운 국면으로 접어듭니다.",
    "흔들리는 선발 투수를 내리고 {PITCHER_NAME}{PITCHER_JOSA_IGA} 급한 불을 끄기 위해 마운드에 오릅니다.",
    "{TEAM_NAME}의 불펜이 총가동되기 시작합니다. 마운드를 이어받는 투수는 {PITCHER_NAME}.",
    "위기가 찾아오자 {TEAM_NAME} 벤치가 분주해집니다. {PITCHER_NAME}{PITCHER_JOSA_IGA} 몸을 풀고 마운드로 향합니다."
  ],

  // 일반 교체
  SUBSTITUTION: [
    "감독의 선택은 {PLAYER_NAME}. 과연 팀의 기대에 부응하는 활약을 보여줄 수 있을까요?",
    "경기의 향방을 가를 수 있는 중요한 교체. 모든 시선이 {PLAYER_NAME}에게로 향합니다.",
    "이 교체가 신의 한 수가 될까요? 감독의 전략이 시험대에 올랐습니다."
  ],

  // 기본 상황
  DEFAULT: [
    "{INNING} {TEAM_NAME}의 공격이 계속됩니다.",
    "현재 스코어 {SCORE}, 치열한 접전이 이어지고 있습니다.",
    "{PLAYER_NAME}의 타석, 어떤 결과가 나올까요?"
  ]
};

// 결과 타입 분석 - 모든 필드에서 키워드 검색
function analyzeResult(mainResult: string, fullResult: string, event?: string, situation?: GameSituation): string {
  const result = mainResult.toLowerCase();
  const fullResultLower = fullResult.toLowerCase();
  const eventLower = event ? event.toLowerCase() : '';
  
  // 모든 텍스트를 하나로 합쳐서 검색
  const allText = `${result} ${fullResultLower} ${eventLower}`.toLowerCase();
  
  // 홈런 관련 분석
  if (allText.includes('홈런') || allText.includes('만루홈런')) {
    // 만루홈런 체크
    if (allText.includes('만루홈런') || (situation && isBasesLoaded(situation.onBase))) {
      return 'GRAND_SLAM';
    }
    
    // 끝내기홈런 체크 (9회 말, 홈팀 공격)
    if (situation && situation.inning >= 9 && situation.half === 'bot') {
      return 'WALK_OFF_HOMERUN';
    }
    
    // 역전홈런 체크 (스코어 변화 확인 필요)
    if (situation && isComeback(situation)) {
      return 'COMEBACK_HOMERUN';
    }
    
    // 동점홈런 체크
    if (situation && isTie(situation)) {
      return 'TIE_HOMERUN';
    }
    
    // 백투백홈런 체크 (이전 타석도 홈런인 경우)
    if (allText.includes('백투백') || allText.includes('연속홈런')) {
      return 'BACK_TO_BACK_HOMERUN';
    }
    
    // 대타홈런 체크 (original_batter 정보 필요)
    if (allText.includes('대타') || allText.includes('pinch')) {
      return 'PINCH_HIT_HOMERUN';
    }
    
    return 'HOMERUN';
  }
  
  // 삼진 관련 분석
  if (allText.includes('삼진')) {
    if (situation && isBasesLoaded(situation.onBase)) {
      return 'BASES_LOADED_STRIKEOUT';
    }
    
    if (situation && isScoringPosition(situation.onBase)) {
      return 'SCORING_POSITION_STRIKEOUT';
    }
    
    if (situation && situation.outs === 2) {
      return 'INNING_ENDING_STRIKEOUT';
    }
    
    return 'STRIKEOUT';
  }
  
  // 병살타/삼중살 체크
  if (allText.includes('삼중살') || allText.includes('트리플플레이')) {
    return 'TRIPLE_PLAY';
  }
  
  if (allText.includes('병살') || allText.includes('더블플레이')) {
    return 'DOUBLE_PLAY';
  }
  
  if (allText.includes('볼넷') || allText.includes('4볼')) {
    return 'WALK';
  }
  
  if (allText.includes('폭투') || allText.includes('패스트볼')) {
    return 'WILDPITCH';
  }
  
  if (allText.includes('도루')) {
    return 'STEAL';
  }
  
  // 선수교체 관련
  if (allText.includes('대타') || allText.includes('pinch hit')) {
    return 'PINCH_HITTER';
  }
  
  if (allText.includes('대주자') || allText.includes('pinch run')) {
    return 'PINCH_RUNNER';
  }
  
  if (allText.includes('마무리') || allText.includes('closer')) {
    return 'CLOSER';
  }
  
  if (allText.includes('구원') || allText.includes('relief')) {
    return 'RELIEF_PITCHER';
  }
  
  if (allText.includes('교체') || allText.includes('substitution')) {
    return 'SUBSTITUTION';
  }
  
  if (allText.includes('아웃') || allText.includes('플라이') || allText.includes('땅볼') || 
      allText.includes('라인드라이브') || allText.includes('인필드플라이')) {
    return 'OUT';
  }
  
  // 안타 관련 분석
  if (allText.includes('안타') || allText.includes('1루타') || allText.includes('2루타') || allText.includes('3루타')) {
    // 적시타인지 확인
    if (allText.includes('홈인')) {
      // 역전타 체크
      if (situation && isComeback(situation)) {
        return 'COMEBACK_HIT';
      }
      
      // 결승타 체크 (0:0에서 득점 또는 7회 이후 동점에서 득점)
      if (situation && isWinningHit(situation)) {
        return 'WINNING_HIT';
      }
      
      // 동점타 체크
      if (situation && isTie(situation)) {
        return 'TIE_HIT';
      }
      
      return 'RBI_HIT';
    }
    
    // 안타 종류별 구분
    if (allText.includes('3루타')) {
      return 'TRIPLE_HIT';
    }
    
    if (allText.includes('2루타')) {
      return 'DOUBLE_HIT';
    }
    
    if (allText.includes('1루타')) {
      return 'SINGLE_HIT';
    }
    
    return 'REGULAR_HIT';
  }
  
  return 'DEFAULT';
}

// 만루 상황 체크
function isBasesLoaded(onBase: any): boolean {
  return onBase && onBase.base1 !== '0' && onBase.base2 !== '0' && onBase.base3 !== '0';
}

// 득점권 상황 체크
function isScoringPosition(onBase: any): boolean {
  return onBase && (onBase.base2 !== '0' || onBase.base3 !== '0');
}

// 역전 상황 체크 (스코어 변화 분석 필요)
function isComeback(situation: GameSituation): boolean {
  // 실제로는 이전 스코어와 비교해야 하지만, 여기서는 간단히 처리
  return false; // 실제 구현에서는 스코어 변화 로직 필요
}

// 동점 상황 체크
function isTie(situation: GameSituation): boolean {
  // 실제로는 이전 스코어와 비교해야 하지만, 여기서는 간단히 처리
  return false; // 실제 구현에서는 스코어 변화 로직 필요
}

// 결승타 상황 체크
function isWinningHit(situation: GameSituation): boolean {
  // 0:0에서 득점하거나 7회 이후 동점에서 득점
  return situation.score === '0:0' || (situation.inning >= 7);
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

// 아웃 타입 결정
function getOutType(mainResult: string, fullResult: string): string {
  const result = mainResult.toLowerCase();
  const fullResultLower = fullResult.toLowerCase();
  
  if (result.includes('플라이') || fullResultLower.includes('플라이')) {
    if (result.includes('인필드') || fullResultLower.includes('인필드')) {
      return '인필드 플라이';
    }
    return '플라이';
  }
  
  if (result.includes('땅볼') || fullResultLower.includes('땅볼')) {
    return '땅볼';
  }
  
  if (result.includes('라인드라이브') || fullResultLower.includes('라인드라이브')) {
    return '라인드라이브';
  }
  
  if (result.includes('인필드플라이') || fullResultLower.includes('인필드플라이')) {
    return '인필드 플라이';
  }
  
  return '아웃';
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

// 한국어 조사 처리 함수들
function hasJongseong(char: string): boolean {
  const code = char.charCodeAt(0) - 0xAC00;
  return (code % 28) !== 0;
}

function getJosa(name: string, josa: string): string {
  if (!name || name.length === 0) return josa;
  
  const lastChar = name[name.length - 1];
  const hasJong = hasJongseong(lastChar);
  
  switch (josa) {
    case '이/가':
      return hasJong ? '이' : '가';
    case '을/를':
      return hasJong ? '을' : '를';
    case '은/는':
      return hasJong ? '은' : '는';
    case '과/와':
      return hasJong ? '과' : '와';
    case '으로/로':
      return hasJong ? '으로' : '로';
    case '의':
      return '의';
    default:
      return josa;
  }
}

// 메인 멘트 생성 함수
export function generateGameComment(situation: GameSituation, event?: string): string {
  console.log('🎤 [generateGameComment] 시작 - situation:', situation, 'event:', event);
  
  const resultType = analyzeResult(situation.mainResult, situation.fullResult, event, situation);
  console.log('🎤 [generateGameComment] 분석된 resultType:', resultType);
  
  const templates = COMMENT_TEMPLATES[resultType as keyof typeof COMMENT_TEMPLATES] || COMMENT_TEMPLATES.DEFAULT;
  console.log('🎤 [generateGameComment] 사용할 템플릿 개수:', templates.length);
  
  // 랜덤하게 템플릿 선택
  const template = templates[Math.floor(Math.random() * templates.length)];
  console.log('🎤 [generateGameComment] 선택된 템플릿:', template);
  
  // 변수 치환
  let comment = template
    .replace(/{PLAYER_NAME}/g, situation.playerName)
    .replace(/{TEAM_NAME}/g, situation.teamName)
    .replace(/{INNING}/g, getInningText(situation.inning, situation.half))
    .replace(/{OUTS}/g, getOutsText(situation.outs))
    .replace(/{SCORE}/g, situation.score)
    .replace(/{PITCHER_NAME}/g, situation.pitcherName)
    // 조사 치환
    .replace(/{PLAYER_JOSA_IGA}/g, getJosa(situation.playerName, '이/가'))
    .replace(/{PLAYER_JOSA_EULREUL}/g, getJosa(situation.playerName, '을/를'))
    .replace(/{PITCHER_JOSA_IGA}/g, getJosa(situation.pitcherName, '이/가'))
    .replace(/{PITCHER_JOSA_EULREUL}/g, getJosa(situation.pitcherName, '을/를'))
    .replace(/{TEAM_JOSA_EULREUL}/g, getJosa(situation.teamName, '을/를'));
  
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
  
  // 아웃 타입
  if (resultType === 'OUT') {
    const outType = getOutType(situation.mainResult, situation.fullResult);
    comment = comment.replace(/{OUT_TYPE}/g, outType);
  }
  
  // 삼진 카운트 (임시로 랜덤 값 - 실제로는 누적 데이터 필요)
  if (resultType === 'STRIKEOUT') {
    const strikeoutCount = Math.floor(Math.random() * 10) + 1;
    comment = comment.replace(/{STRIKEOUT_COUNT}/g, strikeoutCount.toString());
  }
  
  console.log('🎤 [generateGameComment] 최종 생성된 comment:', comment);
  
  return comment;
}

// 최근 타석 결과에서 상황 정보 추출
export function extractSituationFromAtBat(atBat: any, teamName: string, inning: number, half: 'top' | 'bot'): GameSituation | null {
  console.log('🎤 [extractSituationFromAtBat] 시작 - atBat:', atBat);
  
  if (!atBat) {
    console.log('🎤 [extractSituationFromAtBat] atBat이 null/undefined');
    return null;
  }
  
  // main_result가 없어도 full_result나 event에 정보가 있으면 처리
  const hasAnyResult = atBat.main_result || atBat.full_result || atBat.event;
  console.log('🎤 [extractSituationFromAtBat] hasAnyResult:', hasAnyResult);
  console.log('🎤 [extractSituationFromAtBat] main_result:', atBat.main_result);
  console.log('🎤 [extractSituationFromAtBat] full_result:', atBat.full_result);
  console.log('🎤 [extractSituationFromAtBat] event:', atBat.event);
  
  if (!hasAnyResult) {
    console.log('🎤 [extractSituationFromAtBat] 결과 정보가 없음');
    return null;
  }
  
  const playerName = typeof atBat.actual_batter === 'object' 
    ? atBat.actual_batter?.player_name || '선수'
    : String(atBat.actual_batter || '선수');
    
  const pitcherName = typeof atBat.pitcher === 'object'
    ? atBat.pitcher?.player_name || '투수'
    : String(atBat.pitcher || '투수');
  
  const situation = {
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
  
  console.log('🎤 [extractSituationFromAtBat] 생성된 situation:', situation);
  
  return situation;
}
