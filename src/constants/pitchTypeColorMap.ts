// src/constants/pitchTypeColors.ts
export const pitchTypeColorMap = {
  S: '#FFC05B',
  B: '#7FB770',
  H: '#5B84FF',
  K: '#FF5B5B',
} as const;

export type PitchTypeKey = keyof typeof pitchTypeColorMap;