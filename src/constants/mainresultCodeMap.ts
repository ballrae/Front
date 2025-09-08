// src/utils/mainresultCodeMap.ts

export function mainresultCodeMap(mainResult: string): 'B' | 'H' | 'O' | 'X' {
  if (!mainResult || typeof mainResult !== 'string') return 'X';

  if (
    mainResult.includes('볼넷') ||
    mainResult.includes('몸에 맞는 볼') ||
    mainResult.includes('고의4구')
  ) {
    return 'B';
  }

  if (
    mainResult.includes('1루타') ||
    mainResult.includes('2루타') ||
    mainResult.includes('3루타') ||
    mainResult.includes('안타') ||
    mainResult.includes('출루') ||
    mainResult.includes('홈런')
  ) {
    return 'H';
  }

  if (mainResult.includes('아웃')) {
    return 'O';
  }

  return 'X'; // 매핑되지 않으면 X
}


const mainResultColorMap: Record<'B' | 'H' | 'O' | 'X', string> = {
  B: '#7D7D7D', // 볼넷, 고의사구, 몸에맞는볼
  H: '#5B84FF', // 안타, 홈런 등
  O: '#FF5B5B', // 아웃
  X: '#888888', // 매핑 안된 기타
};

export default mainResultColorMap;