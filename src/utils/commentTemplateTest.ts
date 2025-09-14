// 멘트 템플릿 시스템 테스트 파일
import { generateComment, convertToGameState } from './commentTemplateEngine';
import { GameState } from '../constants/commentTemplates';

// 테스트용 게임 상태 데이터
const testScenarios = [
  {
    name: '홈런 시나리오',
    data: {
      inning: '7회초',
      half: 'top' as const,
      score: '3:2',
      current_atbat: {
        actual_batter: { player_name: '양의지' },
        pitcher: { player_name: '알칸타라' },
        main_result: '홈런',
        on_base: { base1: '0', base2: '0', base3: '0' },
        outs: '1사',
        strikeout_count: '8'
      },
      game_info: {
        inning: 7,
        half: 'top' as const,
        score: '3:2',
        outs: '1'
      }
    },
    teamName: '두산',
    isHomeTeam: false
  },
  {
    name: '역전 적시타 시나리오',
    data: {
      inning: '8회말',
      half: 'bot' as const,
      score: '4:5',
      current_atbat: {
        actual_batter: { player_name: '김하성' },
        pitcher: { player_name: '김광현' },
        main_result: '안타',
        on_base: { base1: '1', base2: '2', base3: '0' },
        outs: '2사',
        strikeout_count: '6'
      },
      game_info: {
        inning: 8,
        half: 'bot' as const,
        score: '4:5',
        outs: '2'
      }
    },
    teamName: '키움',
    isHomeTeam: true
  },
  {
    name: '만루 홈런 시나리오',
    data: {
      inning: '9회초',
      half: 'top' as const,
      score: '2:3',
      current_atbat: {
        actual_batter: { player_name: '이정후' },
        pitcher: { player_name: '오승환' },
        main_result: '홈런',
        on_base: { base1: '1', base2: '2', base3: '3' },
        outs: '0사',
        strikeout_count: '5'
      },
      game_info: {
        inning: 9,
        half: 'top' as const,
        score: '2:3',
        outs: '0'
      }
    },
    teamName: '키움',
    isHomeTeam: false
  },
  {
    name: '삼진 시나리오',
    data: {
      inning: '6회말',
      half: 'bot' as const,
      score: '1:1',
      current_atbat: {
        actual_batter: { player_name: '최정' },
        pitcher: { player_name: '류현진' },
        main_result: '삼진',
        on_base: { base1: '0', base2: '0', base3: '0' },
        outs: '2사',
        strikeout_count: '9'
      },
      game_info: {
        inning: 6,
        half: 'bot' as const,
        score: '1:1',
        outs: '2'
      }
    },
    teamName: 'SSG',
    isHomeTeam: true
  }
];

// 테스트 실행 함수
export function runCommentTemplateTests(): void {
  console.log('🧪 멘트 템플릿 시스템 테스트 시작');
  console.log('=====================================');
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n📝 테스트 ${index + 1}: ${scenario.name}`);
    console.log('-----------------------------------');
    
    try {
      // API 데이터를 GameState로 변환
      const gameState = convertToGameState(scenario.data, scenario.teamName, scenario.isHomeTeam);
      
      // 멘트 생성
      const comment = generateComment(gameState);
      
      if (comment) {
        console.log('✅ 멘트 생성 성공:');
        console.log(`   "${comment}"`);
      } else {
        console.log('❌ 멘트 생성 실패: 조건에 맞는 템플릿이 없음');
      }
      
      // 게임 상태 정보 출력
      console.log('📊 게임 상태:');
      console.log(`   이닝: ${gameState.inning}`);
      console.log(`   팀: ${gameState.teamName}`);
      console.log(`   선수: ${gameState.playerName}`);
      console.log(`   투수: ${gameState.pitcherName}`);
      console.log(`   점수: ${gameState.score}`);
      console.log(`   결과: ${gameState.mainResult}`);
      console.log(`   주자: ${gameState.onBase.base1}, ${gameState.onBase.base2}, ${gameState.onBase.base3}`);
      
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
    }
  });
  
  console.log('\n=====================================');
  console.log('🧪 멘트 템플릿 시스템 테스트 완료');
}

// 개별 시나리오 테스트 함수
export function testSingleScenario(scenarioName: string): void {
  const scenario = testScenarios.find(s => s.name === scenarioName);
  
  if (!scenario) {
    console.log(`❌ 시나리오를 찾을 수 없습니다: ${scenarioName}`);
    return;
  }
  
  console.log(`🧪 단일 시나리오 테스트: ${scenarioName}`);
  console.log('=====================================');
  
  try {
    const gameState = convertToGameState(scenario.data, scenario.teamName, scenario.isHomeTeam);
    const comment = generateComment(gameState);
    
    if (comment) {
      console.log('✅ 멘트 생성 성공:');
      console.log(`   "${comment}"`);
    } else {
      console.log('❌ 멘트 생성 실패: 조건에 맞는 템플릿이 없음');
    }
    
    console.log('📊 게임 상태:', JSON.stringify(gameState, null, 2));
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

// 사용 가능한 시나리오 목록 출력
export function listAvailableScenarios(): void {
  console.log('📋 사용 가능한 테스트 시나리오:');
  testScenarios.forEach((scenario, index) => {
    console.log(`   ${index + 1}. ${scenario.name}`);
  });
}


