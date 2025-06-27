export const dummyInningPlayList = [
  {
    inning: 6,
    play_by_play: [
      {
        batter: '양석환',
        batting_hand: '좌타',
        at_bat: [
          { pitch_num: 1, type: 'S', pitch: '직구 → 헛스윙' },
          { pitch_num: 2, type: 'B', pitch: '체인지업' },
          { pitch_num: 3, type: 'S', pitch: '직구' },
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
          { pitch_num: 1, type: 'S', pitch: '직구' },
          { pitch_num: 2, type: 'B', pitch: '직구' },
          { pitch_num: 3, type: 'S', pitch: '스플리터' },
          { pitch_num: 4, type: 'S', pitch: '직구' },
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
          { pitch_num: 1, type: 'S', pitch: '직구' },
          { pitch_num: 2, type: 'B', pitch: '체인지업' },
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
          { pitch_num: 1, type: 'S', pitch: '슬라이더' },
          { pitch_num: 2, type: 'S', pitch: '직구' },
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
          { pitch_num: 1, type: 'B', pitch: '커브' },
          { pitch_num: 2, type: 'S', pitch: '직구' },
          { pitch_num: 3, type: 'S', pitch: '슬라이더' },
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
          { pitch_num: 1, type: 'S', pitch: '직구' },
          { pitch_num: 2, type: 'B', pitch: '체인지업' },
          { pitch_num: 3, type: 'B', pitch: '슬라이더' },
          { pitch_num: 4, type: 'S', pitch: '직구' },
          { pitch_num: 5, type: 'B', pitch: '커터' },
        ],
        final_result: {
          code: 'W',
          description: '볼넷 출루',
        },
      },
    ],
  },
];