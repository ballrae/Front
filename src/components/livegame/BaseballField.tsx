import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

type BaseballFieldProps = {
  width?: number | string;
  height?: number | string;
};

const BaseballField: React.FC<BaseballFieldProps> = ({ width = 200, height = 200 }) => (
  <Svg width={width} height={height} viewBox="0 0 100 100">
    {/* 외야 반원은 그대로 */}
    <Path d="M10,50 A40,40 0 0,1 90,50 L50,90 Z" fill="#d4cda1" />

    {/* 내야 전체를 아래로 이동 */}
    <G transform="translate(0, 6)">
      {/* 내야 다이아몬드 (초록색 네모) */}
   <Path d="M25,50 L50,25 L75,50 L50,75 Z" fill="#3e8e22" />

      {/* 홈플레이트 아래 반원 */}
      <Circle cx="50" cy="80" r="7" fill="#d4cda1" />

      {/* 1루 */}
      <Rect x="73" y="48" width="4" height="4" fill="white" transform="rotate(45, 75, 50)" />
      {/* 2루 */}
      <Rect x="48" y="23" width="4" height="4" fill="white" transform="rotate(45, 50, 25)" />
      {/* 3루 */}
      <Rect x="23" y="48" width="4" height="4" fill="white" transform="rotate(45, 25, 50)" />
      {/* 홈플레이트 */}
      <Path d="M47,76 L53,76 L53,78 L50,81.5 L47,78 Z" fill="white" />
      {/* 투수 마운드 */}
      <Circle cx="50" cy="50" r="5" fill="#b9b68d" />
    </G>
  </Svg>
);

export default BaseballField;