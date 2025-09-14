// 야구 경기 실시간 멘트 템플릿 상수
// 각 템플릿은 상황별로 분류되어 있으며, 변수 치환을 위한 플레이스홀더를 포함합니다.

export interface CommentTemplate {
  id: number;
  category: string;
  type: string;
  template: string;
  condition: string;
}

export interface GameState {
  inning: string;
  teamName: string;
  playerName: string;
  pitcherName: string;
  score: string;
  runType: string;
  hrType: string;
  outs: string;
  strikeoutCount: string;
  mainResult: string;
  onBase: {
    base1: string;
    base2: string;
    base3: string;
  };
  half: 'top' | 'bot';
  originalBatter?: string;
  previousMainResult?: string;
}

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  // 득점/찬스 - 역전
  {
    id: 1,
    category: '득점/찬스',
    type: '역전',
    template: '경기를 뒤집습니다! {PLAYER_NAME}의 {RUN_TYPE}로 스코어 {SCORE}, {TEAM_NAME}이(가) 리드를 잡습니다!',
    condition: "main_result에 '안타', '2루타' 등 득점타 포함 AND score가 지는 상황에서 이기는 상황으로 변경 시"
  },
  {
    id: 2,
    category: '득점/찬스',
    type: '역전',
    template: '스코어 {SCORE}, 경기를 뒤집는 {PLAYER_NAME}의 역전타! {TEAM_NAME}의 더그아웃이 들썩입니다!',
    condition: "main_result에 '안타', '2루타' 등 득점타 포함 AND score가 지는 상황에서 이기는 상황으로 변경 시"
  },
  {
    id: 3,
    category: '득점/찬스',
    type: '역전',
    template: '이보다 더 좋을 순 없다! {PLAYER_NAME}, 가장 중요한 순간에 팀의 리드를 되찾아옵니다.',
    condition: "main_result에 '안타', '2루타' 등 득점타 포함 AND score가 동점 또는 지는 상황에서 이기는 상황으로 변경 시"
  },
  
  // 득점/찬스 - 결승
  {
    id: 4,
    category: '득점/찬스',
    type: '결승',
    template: '팽팽했던 0의 균형을 깨는 {PLAYER_NAME}의 선취 적시타! {TEAM_NAME}이(가) 먼저 앞서나갑니다.',
    condition: "score가 0:0에서 득점하는 상황으로 변경 시"
  },
  {
    id: 5,
    category: '득점/찬스',
    type: '결승',
    template: '끈질긴 승부 끝에 만들어낸 {PLAYER_NAME}의 결승타! {TEAM_NAME}에게 승리가 가까워집니다.',
    condition: "inning >= 7 AND score가 동점에서 이기는 상황으로 변경 시"
  },
  
  // 득점/찬스 - 동점
  {
    id: 6,
    category: '득점/찬스',
    type: '동점',
    template: '이제 경기는 원점! {PLAYER_NAME}의 동점타가 터지며 승부는 다시 미궁 속으로 빠집니다.',
    condition: "main_result에 '안타', '2루타' 등 득점타 포함 AND score가 지는 상황에서 동점으로 변경 시"
  },
  {
    id: 7,
    category: '득점/찬스',
    type: '동점',
    template: '패배 직전에서 팀을 구해내는 {PLAYER_NAME}의 극적인 동점타! 경기는 끝나지 않았습니다.',
    condition: "inning >= 9 AND score가 지는 상황에서 동점으로 변경 시"
  },
  
  // 득점/찬스 - 일반 적시타
  {
    id: 8,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '해결사는 역시 {PLAYER_NAME}! {INNING}의 영웅으로 떠오르는 결정적인 한 방입니다!',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 9,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '{OUTS} 상황, 모두를 숨죽이게 한 순간! {PLAYER_NAME}이(가) 주자를 홈으로 불러들입니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 10,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '{PITCHER_NAME}을(를) 무너뜨리는 {PLAYER_NAME}의 귀중한 적시타! {TEAM_NAME} 더그아웃이 열광합니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 11,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '필요한 순간에 터진 값진 안타! {PLAYER_NAME}이(가) 팀의 믿음에 완벽하게 보답합니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 12,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '주자를 모두 쓸어 담는 {RUN_TYPE}! {PLAYER_NAME}이(가) 단숨에 경기의 분위기를 가져옵니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 13,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '승리를 향한執念! {PLAYER_NAME}의 안타 하나가 경기의 향방을 바꾸고 있습니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 14,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '오늘 경기의 히어로, {PLAYER_NAME}! 그의 방망이가 {TEAM_NAME}을(를) 승리로 이끌고 있습니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  {
    id: 15,
    category: '득점/찬스',
    type: '일반 적시타',
    template: '팬들의 함성을 자아내는 {PLAYER_NAME}의 적시타! 이제 리드는 {TEAM_NAME}의 것입니다.',
    condition: "score가 변경되는 모든 득점타 상황"
  },
  
  // 홈런 - 만루 홈런
  {
    id: 16,
    category: '홈런',
    type: '만루 홈런',
    template: '그랜드슬램! {PLAYER_NAME}이(가) {OUTS} 만루 상황에서 경기를 지배하는 역전 만루 홈런을 터뜨립니다!',
    condition: "main_result에 '홈런' 포함 AND 플레이 전 on_base가 {'base1':'n', 'base2':'n', 'base3':'n'} 일 때 (n은 0 아님)"
  },
  
  // 홈런 - 역전 홈런
  {
    id: 17,
    category: '홈런',
    type: '역전 홈런',
    template: '{PITCHER_NAME}의 결정구를 그대로 받아쳐 역전을 만드는 {PLAYER_NAME}의 홈런!',
    condition: "main_result에 '홈런' 포함 AND score가 지는 상황에서 이기는 상황으로 변경 시"
  },
  
  // 홈런 - 동점 홈런
  {
    id: 18,
    category: '홈런',
    type: '동점 홈런',
    template: '{INNING}에 터진 귀중한 동점 홈런! {PLAYER_NAME}이(가) 패배의 위기에서 팀을 구해냅니다.',
    condition: "main_result에 '홈런' 포함 AND score가 지는 상황에서 동점으로 변경 시"
  },
  
  // 홈런 - 끝내기 홈런
  {
    id: 19,
    category: '홈런',
    type: '끝내기 홈런',
    template: '경기를 끝내는 한 방! {PLAYER_NAME}의 끝내기 홈런으로 {TEAM_NAME}이(가) 극적인 승리를 거둡니다!',
    condition: "main_result에 '홈런' 포함 AND inning >= 9 AND half == 'bottom' AND score가 이기는 상황으로 변경 시"
  },
  
  // 홈런 - 백투백 홈런
  {
    id: 20,
    category: '홈런',
    type: '백투백 홈런',
    template: '백투백 홈런! {PLAYER_NAME}까지 홈런포에 가세하며 {TEAM_NAME}이(가) 완전히 분위기를 가져옵니다!',
    condition: "main_result에 '홈런' 포함 AND 직전 타석의 main_result에도 '홈런'이 포함될 때"
  },
  
  // 홈런 - 대타 홈런
  {
    id: 21,
    category: '홈런',
    type: '대타 홈런',
    template: '대타로 나와 홈런을 기록하는 {PLAYER_NAME}! 감독의 믿음에 완벽하게 부응합니다!',
    condition: "main_result에 '홈런' 포함 AND original_batter != null 일 때"
  },
  
  // 홈런 - 일반 홈런
  {
    id: 22,
    category: '홈런',
    type: '일반 홈런',
    template: '넘어갔습니다! {PLAYER_NAME}의 {HR_TYPE}! 경기장을 가득 메운 팬들에게 최고의 선물을 안깁니다!',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 23,
    category: '홈런',
    type: '일반 홈런',
    template: '승리를 향한 축포! {PLAYER_NAME}이(가) 쏘아 올린 타구가 담장 밖으로 사라집니다!',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 24,
    category: '홈런',
    type: '일반 홈런',
    template: '이 한 방으로 경기에 쐐기를 박습니다! {PLAYER_NAME}의 {HR_TYPE}이 터지며 스코어는 {SCORE}.',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 25,
    category: '홈런',
    type: '일반 홈런',
    template: '침묵하던 {TEAM_NAME}의 타선, {PLAYER_NAME}의 솔로포로 다시 불타오르기 시작합니다!',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 26,
    category: '홈런',
    type: '일반 홈런',
    template: '믿을 수 없는 비거리! {PLAYER_NAME}이(가) 왜 팀의 4번 타자인지를 증명하는 거대한 홈런입니다.',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 27,
    category: '홈런',
    type: '일반 홈런',
    template: '타구는 빨랫줄처럼 뻗어가 담장을 넘어갑니다! {PLAYER_NAME}의 완벽한 스윙!',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 28,
    category: '홈런',
    type: '일반 홈런',
    template: '오늘 경기 멀티 홈런! {PLAYER_NAME}의 방망이가 그야말로 불을 뿜고 있습니다!',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 29,
    category: '홈런',
    type: '일반 홈런',
    template: '맞는 순간 직감했습니다! {PLAYER_NAME}의 타구가 아름다운 포물선을 그리며 관중석에 꽂힙니다.',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  {
    id: 30,
    category: '홈런',
    type: '일반 홈런',
    template: '이 홈런으로 {TEAM_NAME}은(는) 승리에 한 발짝 더 다가섭니다. 스코어 {SCORE}.',
    condition: "main_result에 '홈런' 포함되는 모든 상황"
  },
  
  // 탈삼진 - 만루 위기
  {
    id: 31,
    category: '탈삼진',
    type: '만루 위기',
    template: '{OUTS} 만루 위기, {PITCHER_NAME}이(가) {PLAYER_NAME}을(를) 삼진으로 막고 포효합니다!',
    condition: "main_result에 '삼진' 포함 AND 플레이 전 on_base가 {'base1':'n', 'base2':'n', 'base3':'n'} 일 때"
  },
  
  // 탈삼진 - 득점권 위기
  {
    id: 32,
    category: '탈삼진',
    type: '득점권 위기',
    template: '1점의 리드를 지켜내는 혼신의 역투! {PITCHER_NAME}이(가) 주자를 묶어두고 삼진을 잡아냅니다.',
    condition: "main_result에 '삼진' 포함 AND 플레이 전 on_base의 base2 또는 base3가 '0'이 아닐 때"
  },
  {
    id: 33,
    category: '탈삼진',
    type: '득점권 위기',
    template: '역전 주자가 있는 상황, {PITCHER_NAME}이(가) 흔들리지 않고 삼진으로 아웃카운트를 늘립니다.',
    condition: "main_result에 '삼진' 포함 AND score가 지고 있거나 동점인 상황의 득점권 위기"
  },
  {
    id: 34,
    category: '탈삼진',
    type: '득점권 위기',
    template: '위기 뒤에 찾아온 삼진! {PITCHER_NAME}이(가) 스스로 만든 위기를 스스로 해결합니다.',
    condition: "main_result에 '삼진' 포함 AND 플레이 전 out == '2' 일 때"
  },
  
  // 탈삼진 - 이닝 종료
  {
    id: 35,
    category: '탈삼진',
    type: '이닝 종료',
    template: '더 이상의 실점은 없다! {PITCHER_NAME}이(가) 오늘 {STRIKEOUT_COUNT}개째 KKK로 이닝을 종료시킵니다.',
    condition: "main_result에 '삼진' 포함 AND inning >= 9 AND half == 'bottom' AND out == '2' AND 공격팀이 지는 상황"
  },
  
  // 탈삼진 - 세이브 상황
  {
    id: 36,
    category: '탈삼진',
    type: '세이브 상황',
    template: '{TEAM_NAME}의 뒷문을 완벽하게 걸어 잠그는 {PITCHER_NAME}의 세이브! 마지막 타자는 삼진!',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  
  // 탈삼진 - 일반
  {
    id: 37,
    category: '탈삼진',
    type: '일반',
    template: '에이스의 품격! {PITCHER_NAME}, 가장 중요한 순간에 상대 클린업 트리오를 삼진으로 돌려세웁니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 38,
    category: '탈삼진',
    type: '일반',
    template: '풀카운트 승부, {PITCHER_NAME}의 선택은 바깥쪽 꽉 찬 직구! 타자가 꼼짝 못 합니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 39,
    category: '탈삼진',
    type: '일반',
    template: '연속 타자 탈삼진! {PITCHER_NAME}이(가) 마운드를 완벽하게 지배하고 있습니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 40,
    category: '탈삼진',
    type: '일반',
    template: '불같은 강속구! {PITCHER_NAME}의 구위에 상대 타선이 꽁꽁 묶여있습니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 41,
    category: '탈삼진',
    type: '일반',
    template: '팀을 구하는 결정적인 탈삼진! {PITCHER_NAME}이(가) 더그아웃의 분위기를 다시 끌어올립니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 42,
    category: '탈삼진',
    type: '일반',
    template: '{INNING}, {OUTS} 상황. {PITCHER_NAME}이(가) 영리한 볼 배합으로 타자의 헛스윙을 유도합니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 43,
    category: '탈삼진',
    type: '일반',
    template: '이보다 더 좋을 수 없는 위기관리 능력! {PITCHER_NAME}이(가) 팀의 리드를 지켜냅니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 44,
    category: '탈삼진',
    type: '일반',
    template: '오늘 경기 최고의 하이라이트! {PITCHER_NAME}이(가) {PLAYER_NAME}과의 맞대결에서 삼진으로 승리합니다.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  {
    id: 45,
    category: '탈삼진',
    type: '일반',
    template: '삼진으로 이닝 선두타자를 잡아내며 기분 좋게 출발하는 {PITCHER_NAME}.',
    condition: "main_result에 '삼진' 포함되는 모든 상황"
  },
  
  // 선수교체 - 대타
  {
    id: 46,
    category: '선수교체',
    type: '대타',
    template: '{INNING} 승부처, {TEAM_NAME}이(가) 승부수를 던집니다. 타석에는 대타 {PLAYER_NAME}.',
    condition: ""
  },
  {
    id: 47,
    category: '선수교체',
    type: '대타',
    template: '좌완 {PITCHER_NAME} 공략을 위한 맞춤 카드! {PLAYER_NAME}이(가) 대타로 경기에 나섭니다.',
    condition: ""
  },
  {
    id: 48,
    category: '선수교체',
    type: '대타',
    template: '득점권 찬스, {TEAM_NAME}이(가) 가장 믿을 수 있는 대타 {PLAYER_NAME}을(를) 기용합니다.',
    condition: ""
  },
  {
    id: 49,
    category: '선수교체',
    type: '대타',
    template: '{SCORE}의 접전 상황, 한 점을 짜내기 위한 {TEAM_NAME}의 선택은 대타 {PLAYER_NAME}입니다.',
    condition: ""
  },
  
  // 선수교체 - 대주자
  {
    id: 50,
    category: '선수교체',
    type: '대주자',
    template: '1점 싸움, 빠른 발이 필요합니다. {PLAYER_NAME}이(가) 대주자로 투입되어 득점을 노립니다.',
    condition: ""
  },
  {
    id: 51,
    category: '선수교체',
    type: '대주자',
    template: '{PLAYER_NAME} 대주자 투입. 다음 플레이는 번트 혹은 도루가 예상되는 상황입니다.',
    condition: ""
  },
  {
    id: 52,
    category: '선수교체',
    type: '대주자',
    template: '{PLAYER_NAME}이(가) 1루 주자를 대신해 들어옵니다. 이제부터는 발야구 싸움입니다.',
    condition: ""
  },
  
  // 선수교체 - 마무리 투수
  {
    id: 53,
    category: '선수교체',
    type: '마무리 투수',
    template: '이제 경기를 끝내기 위해 {TEAM_NAME}의 마무리 투수 {PITCHER_NAME}이(가) 등판합니다.',
    condition: ""
  },
  
  // 선수교체 - 필승조 투수
  {
    id: 54,
    category: '선수교체',
    type: '필승조 투수',
    template: '마운드에 오르는 {TEAM_NAME}의 필승조, {PITCHER_NAME}. 이제 경기는 새로운 국면으로 접어듭니다.',
    condition: ""
  },
  {
    id: 55,
    category: '선수교체',
    type: '필승조 투수',
    template: '흔들리는 선발 투수를 내리고 {PITCHER_NAME}이(가) 급한 불을 끄기 위해 마운드에 오릅니다.',
    condition: ""
  },
  {
    id: 56,
    category: '선수교체',
    type: '필승조 투수',
    template: '{TEAM_NAME}의 불펜이 총가동되기 시작합니다. 마운드를 이어받는 투수는 {PITCHER_NAME}.',
    condition: ""
  },
  {
    id: 57,
    category: '선수교체',
    type: '필승조 투수',
    template: '위기가 찾아오자 {TEAM_NAME} 벤치가 분주해집니다. {PITCHER_NAME}이(가) 몸을 풀고 마운드로 향합니다.',
    condition: ""
  },
  
  // 선수교체 - 일반
  {
    id: 58,
    category: '선수교체',
    type: '일반',
    template: '감독의 선택은 {PLAYER_NAME}. 과연 팀의 기대에 부응하는 활약을 보여줄 수 있을까요?',
    condition: ""
  },
  {
    id: 59,
    category: '선수교체',
    type: '일반',
    template: '경기의 향방을 가를 수 있는 중요한 교체. 모든 시선이 {PLAYER_NAME}에게로 향합니다.',
    condition: ""
  },
  {
    id: 60,
    category: '선수교체',
    type: '일반',
    template: '이 교체가 신의 한 수가 될까요? 감독의 전략이 시험대에 올랐습니다.',
    condition: ""
  },
  
  // 아웃카운트 - 삼중살
  {
    id: 61,
    category: '아웃카운트',
    type: '삼중살',
    template: '1루, 2루, 그리고 3루까지! KBO 리그에서 좀처럼 보기 힘든 삼중살이 나옵니다! 믿을 수 없는 수비!',
    condition: ""
  },
  {
    id: 62,
    category: '아웃카운트',
    type: '삼중살',
    template: '한 번의 플레이로 이닝 종료! {TEAM_NAME}의 수비 집중력이 만들어낸 완벽한 트리플 플레이!',
    condition: ""
  },
  
  // 아웃카운트 - 병살타
  {
    id: 63,
    category: '아웃카운트',
    type: '병살타',
    template: '야구의 꽃, 병살타! {TEAM_NAME}의 내야진이 환상적인 호흡으로 위기를 넘깁니다!',
    condition: ""
  },
  {
    id: 64,
    category: '아웃카운트',
    type: '병살타',
    template: '순식간에 아웃카운트 두 개! {PITCHER_NAME}이(가) {PLAYER_NAME}을(를) 병살타로 유도하며 이닝을 정리합니다.',
    condition: ""
  },
  {
    id: 65,
    category: '아웃카운트',
    type: '병살타',
    template: '최악의 무사 만루 위기를 최상의 결과, 병살타로 막아내는 {TEAM_NAME}!',
    condition: ""
  },
  {
    id: 66,
    category: '아웃카운트',
    type: '병살타',
    template: '공격의 흐름을 완벽하게 끊어내는 더블 플레이! {PITCHER_NAME}의 위기관리 능력이 돋보입니다.',
    condition: ""
  },
  {
    id: 67,
    category: '아웃카운트',
    type: '병살타',
    template: '땅볼 하나로 아웃카운트 두 개를 잡아내며 투수의 어깨를 가볍게 해주는 완벽한 내야 수비!',
    condition: ""
  },
  {
    id: 68,
    category: '아웃카운트',
    type: '병살타',
    template: '득점권 찬스가 무위로 돌아갑니다. {PLAYER_NAME}의 아쉬운 병살타.',
    condition: ""
  },
  {
    id: 69,
    category: '아웃카운트',
    type: '병살타',
    template: '{INNING}의 결정적인 병살 수비! {TEAM_NAME}이(가) 리드를 지켜내는 데 성공합니다.',
    condition: ""
  },
  {
    id: 70,
    category: '아웃카운트',
    type: '병살타',
    template: '{PITCHER_NAME}의 유도에 {PLAYER_NAME}의 방망이가 그대로 따라가며 더블 플레이가 완성됩니다.',
    condition: ""
  },
  {
    id: 71,
    category: '아웃카운트',
    type: '병살타',
    template: '키스톤 콤비의 완벽한 호흡! 4-6-3으로 이어지는 교과서적인 병살 플레이!',
    condition: ""
  },
  {
    id: 72,
    category: '아웃카운트',
    type: '병살타',
    template: '무사 1,2루의 대량 득점 기회가 병살타 하나로 순식간에 2사 3루로 바뀝니다.',
    condition: ""
  },
  {
    id: 73,
    category: '아웃카운트',
    type: '병살타',
    template: '{PITCHER_NAME}이(가) 원하는 가장 이상적인 결과! 병살타로 실점 없이 위기를 탈출합니다.',
    condition: ""
  },
  {
    id: 74,
    category: '아웃카운트',
    type: '병살타',
    template: '{PLAYER_NAME}의 타구가 야수 정면으로 향하며 아쉬운 더블 플레이로 연결됩니다.',
    condition: ""
  },
  {
    id: 75,
    category: '아웃카운트',
    type: '병살타',
    template: '{TEAM_NAME}의 수비력이 빛나는 순간! 중요한 상황에서 나온 병살타로 분위기를 가져옵니다.',
    condition: ""
  }
];

// 카테고리별로 템플릿을 그룹화하는 헬퍼 함수
export function getTemplatesByCategory(category: string): CommentTemplate[] {
  return COMMENT_TEMPLATES.filter(template => template.category === category);
}

// 타입별로 템플릿을 그룹화하는 헬퍼 함수
export function getTemplatesByType(type: string): CommentTemplate[] {
  return COMMENT_TEMPLATES.filter(template => template.type === type);
}

// ID로 템플릿을 찾는 헬퍼 함수
export function getTemplateById(id: number): CommentTemplate | undefined {
  return COMMENT_TEMPLATES.find(template => template.id === id);
}


