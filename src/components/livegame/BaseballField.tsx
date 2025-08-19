import React from 'react';
import Svg, { Path, Rect, Circle, G, Text as SvgText } from 'react-native-svg';

type DefensePositions = {
  [position: string]: string;
};

type BaseballFieldProps = {
  width?: number | string;
  height?: number | string;
  defensePositions: DefensePositions;
};

const BaseballField: React.FC<BaseballFieldProps> = ({
  width = 200,
  height = 200,
  defensePositions,
}) => {

const positionCoords: { [key: string]: [number, number] } = {
  "투수": [50, 47],     // 마운드 조금 아래
  "포수": [50, 85],     // 홈 근처
  "1루수": [80, 43],    // 1루 안쪽
  "2루수": [70, 33],    // 2루 우측
  "3루수": [20, 44],    // 3루 안쪽
  "유격수": [29, 33],   // 2루 왼쪽
  "좌익수": [24, 23],   // 외야 왼쪽
  "중견수": [50, 12],   // 정중앙
  "우익수": [77, 23],   // 외야 오른쪽
};
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100">
      {/* 외야 */}
      <Path d="M10,50 A40,40 0 0,1 90,50 L50,90 Z" fill="#d4cda1" />

      <G transform="translate(0, 6)">
        {/* 내야 */}
        <Path d="M25,50 L50,25 L75,50 L50,75 Z" fill="#3e8e22" />
        <Circle cx="50" cy="80" r="7" fill="#d4cda1" />
        <Rect x="73" y="48" width="4" height="4" fill="white" transform="rotate(45, 75, 50)" />
        <Rect x="48" y="23" width="4" height="4" fill="white" transform="rotate(45, 50, 25)" />
        <Rect x="23" y="48" width="4" height="4" fill="white" transform="rotate(45, 25, 50)" />
        <Path d="M47,76 L53,76 L53,78 L50,81.5 L47,78 Z" fill="white" />
        <Circle cx="50" cy="50" r="5" fill="#b9b68d" />

        {/* 수비 위치 이름 (배경 + 텍스트) */}
        {Object.entries(defensePositions).map(([position, name]) => {
          const coord = positionCoords[position];
          if (!coord) return null;
          const [x, y] = coord;
          const radiusX = 6;
          const radiusY = 2.5;

          return (
            <G key={position}>
              {/* 둥근 배경 */}
              <Rect
                x={x - radiusX}
                y={y - radiusY}
                rx={radiusY}
                ry={radiusY}
                width={radiusX * 2}
                height={radiusY * 2}
                fill="#98C379" // 연한 초록색
                fillOpacity={0.8} 
              />
              {/* 흰색 글자 */}
              <SvgText
                x={x}
                y={y+0.3} // 약간 아래로 내려서 중앙정렬 느낌
                fontSize="3.2"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="600"
                 fillOpacity={1} 
              >
                {name}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

export default BaseballField;