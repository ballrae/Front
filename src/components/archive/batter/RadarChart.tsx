// src/components/archive/batter/RadarChart.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Text as SvgText } from 'react-native-svg';

interface RadarChartProps {
  labels: string[];
  values: number[]; // 0~100 범위 값
  size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ labels, values, size = 240 }) => {
  const paddedSize = size + 100; // 좌우 라벨 잘림 방지용
  const center = paddedSize / 2;
  const numOfPoints = labels.length;
  const angleStep = (2 * Math.PI) / numOfPoints;
  const radius = size * 0.38;

  const getPoint = (i: number, value: number, r: number = radius) => {
    const angle = angleStep * i - Math.PI / 2;
    const x = center + r * Math.cos(angle) * (value / 100);
    const y = center + r * Math.sin(angle) * (value / 100);
    return { x, y };
  };

  const outlinePoints = Array.from({ length: numOfPoints }, (_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });

  const getLevelPoints = (percent: number) =>
    outlinePoints.map((p) => {
      const dx = p.x - center;
      const dy = p.y - center;
      return `${center + dx * (percent / 100)},${center + dy * (percent / 100)}`;
    }).join(' ');

  const valuePoints = values.map((v, i) => {
    const pt = getPoint(i, v);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <Svg
        width={paddedSize}
        height={paddedSize}
        viewBox={`-20 -20 ${paddedSize} ${paddedSize}`} // 여백 확보
      >
        {/* 점선 영역 (50%, 75%) */}
        {[50, 75].map((level, idx) => (
          <Polygon
            key={`level-${idx}`}
            points={getLevelPoints(level)}
            stroke="#999"
            strokeWidth={0.5}
            strokeDasharray="4,2"
            fill="none"
          />
        ))}

        {/* 바깥 외곽선 */}
        <Polygon
          points={outlinePoints.map(p => `${p.x},${p.y}`).join(' ')}
          stroke="#222"
          strokeWidth={0.8}
          fill="none"
        />

        {/* 데이터 영역 */}
        <Polygon
          points={valuePoints}
          fill="rgba(64,138,33,0.25)"
        />

        {/* 데이터 점 + 수치 */}
        {values.map((v, i) => {
          const { x, y } = getPoint(i, v);
          return (
            <React.Fragment key={i}>
              <Circle cx={x} cy={y} r={8} fill="#408A21" />
              <SvgText
                x={x}
                y={y + 0.5}
                fontSize="7"
                fontWeight="600"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {v}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* 라벨 - 약간 조정 */}
        {outlinePoints.map((p, i) => {
          const offsetX = (p.x - center) * 0.25;
          const offsetY = (p.y - center) * 0.25;

          let extraOffsetX = 0;
          if (labels[i] === '필딩RAA%') extraOffsetX = -8;
          if (labels[i] === '수비RAA%') extraOffsetX = 8;

          return (
            <React.Fragment key={`label-${i}`}>
              <SvgText
                x={p.x + offsetX + extraOffsetX}
                y={p.y + offsetY}
                fontSize="12"
                fill="#000"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {labels[i]}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default RadarChart;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible', // 중요! 라벨 잘림 방지
    marginTop: -60,
    marginLeft:-10
  },
});