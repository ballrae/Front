// src/declarations.d.ts 또는 프로젝트 루트에 위치
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}