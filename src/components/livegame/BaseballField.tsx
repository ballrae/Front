import React from 'react';
import Svg, { Path, Rect, Circle, G, Text as SvgText } from 'react-native-svg';

type DefensePositions = {
  [position: string]: string;
};

type OnBaseRunners = {
  base1?: string;
  base2?: string;
  base3?: string;
};

type BaseballFieldProps = {
  width?: number | string;
  height?: number | string;
  defensePositions: DefensePositions;
  onBaseRunners?: OnBaseRunners;
  currentBatterName?: string;
};

const BaseballField: React.FC<BaseballFieldProps> = ({
  width = 200,
  height = 200,
  defensePositions,
  onBaseRunners = {},
  currentBatterName,
}) => {
  const positionCoords: { [key: string]: [number, number] } = {
    "투수": [50, 47],
    "포수": [50, 85],
    "1루수": [80, 43],
    "2루수": [70, 33],
    "3루수": [20, 43],
    "유격수": [29, 33],
    "좌익수": [24, 23],
    "중견수": [50, 12],
    "우익수": [77, 23],
  };

  const baseCoords: { [base: string]: [number, number] } = {
    base1: [73, 48],
    base2: [48, 23],
    base3: [23, 48],
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

        {/* 🟩 수비 위치 이름 */}
        {Object.entries(defensePositions).map(([position, name]) => {
          const coord = positionCoords[position];
          if (!coord) return null;
          const [x, y] = coord;

          return (
            <G key={position}>
              <Rect
                x={x - 6}
                y={y - 3}
                rx={3}
                ry={3}
                width={12}
                height={6}
                fill="#98C379"
                fillOpacity={0.8}
              />
              <SvgText
                x={x}
                y={y + 0.5}
                fontSize="3.2"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="600"
              >
                {name}
              </SvgText>
            </G>
          );
        })}

        {/* ⚪ 주자 위치 이름 */}
        {Object.entries(onBaseRunners).map(([base, name]) => {
          const coord = baseCoords[base];
          if (!coord || !name || name === '0') return null;
          const [x, y] = coord;

          return (
            <G key={base}>
              <Rect
                x={x - 5}
                y={y - 1}
                rx={3}
                ry={3}
                width={12}
                height={6}
                fill="white"
                fillOpacity={0.8}
              />
              <SvgText
                x={x+1}
                y={y + 2}
                fontSize="3.2"
                fill="#3e8e22"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="600"
              >
                {name}
              </SvgText>
            </G>
          );
        })}

        {/* 🟩 현재 타자 이름 (홈플레이트 쪽) */}
        {currentBatterName && (
          <G>
            <Rect
              x={56}
              y={79 - 3}
              rx={3}
              ry={3}
              width={12}
              height={6}
              fill="white"
              fillOpacity={0.8}
            />
            <SvgText
              x={62}
              y={79 + 0.5}
              fontSize="3.2"
              fill="#3e8e22"
              textAnchor="middle"
              alignmentBaseline="middle"
              fontWeight="600"
            >
              {currentBatterName}
            </SvgText>
          </G>
        )}
      </G>
    </Svg>
  );
};

export default BaseballField;