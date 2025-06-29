// src/constants/resultCodeMap.ts
// 문자 중계에서 이니셜과 맵핑
export const resultCodeMap = {
  K: '스트라이크 아웃',
  H: '안타',
  F: '플라이 아웃',
  G: '땅볼 아웃',
  BB: '볼넷',
  HBP: '몸에 맞는 공',
  SO: '헛스윙 삼진',
  SF: '희생 플라이',
} as const;

export type ResultCodeKey = keyof typeof resultCodeMap;