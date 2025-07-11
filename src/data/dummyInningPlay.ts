export const dummyInningPlayList = [
  {
    inning: 6,
    play_by_play: [
      {
        batter: '양석환',
        batting_hand: '좌타',
        at_bat: [
          { pitch_num: 1, type: 'S', pitch: '직구 → 헛스윙', velocity: 145 },
          { pitch_num: 2, type: 'B', pitch: '체인지업', velocity: 132 },
          { pitch_num: 3, type: 'S', pitch: '직구', velocity: 146 },
        ],
        final_result: {
          code: 'H',
          description: '2루타',
        },
      },
      {
        batter: '강승호',
        batting_hand: '우타',
        at_bat: [
          { pitch_num: 1, type: 'S', pitch: '직구', velocity: 147 },
          { pitch_num: 2, type: 'B', pitch: '직구', velocity: 146 },
          { pitch_num: 3, type: 'S', pitch: '스플리터', velocity: 136 },
          { pitch_num: 4, type: 'S', pitch: '직구', velocity: 148 },
        ],
        final_result: {
          code: 'K',
          description: '루킹 스트라이크 아웃',
        },
      },
      {
        batter: '양의지',
        batting_hand: '우타',
        at_bat: [
          { pitch_num: 1, type: 'S', pitch: '직구', velocity: 145 },
          { pitch_num: 2, type: 'B', pitch: '체인지업', velocity: 131 },
        ],
        final_result: {
          code: 'G',
          description: '1루수 땅볼',
        },
      },
    ],
  },
  {
    inning: 7,
    play_by_play: [
      {
        batter: '홍길동',
        batting_hand: '좌타',
        at_bat: [
          { pitch_num: 1, type: 'S', pitch: '슬라이더', velocity: 139 },
          { pitch_num: 2, type: 'S', pitch: '직구', velocity: 146 },
        ],
        final_result: {
          code: 'F',
          description: '좌익수 플라이 아웃',
        },
      },
      {
        batter: '이정후',
        batting_hand: '좌타',
        at_bat: [
          { pitch_num: 1, type: 'B', pitch: '커브', velocity: 128 },
          { pitch_num: 2, type: 'S', pitch: '직구', velocity: 145 },
          { pitch_num: 3, type: 'S', pitch: '슬라이더', velocity: 138 },
        ],
        final_result: {
          code: 'K',
          description: '스윙 스트라이크 아웃',
        },
      },
      {
        batter: '박건우',
        batting_hand: '우타',
        at_bat: [
          { pitch_num: 1, type: 'S', pitch: '직구', velocity: 147 },
          { pitch_num: 2, type: 'B', pitch: '체인지업', velocity: 133 },
          { pitch_num: 3, type: 'B', pitch: '슬라이더', velocity: 139 },
          { pitch_num: 4, type: 'S', pitch: '직구', velocity: 148 },
          { pitch_num: 5, type: 'B', pitch: '커터', velocity: 141 },
        ],
        final_result: {
          code: 'W',
          description: '볼넷 출루',
        },
      },
    ],
  },
];