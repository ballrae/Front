import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Pitch = {
  x: number;
  y: number;
  pitchNum: number;
  pitchResult: string;
};

type Props = {
  strikeZone: [number, number, number, number];
  pitches: Pitch[];
  width?: number;
  height?: number;
  widthRatio?: number;
  style?: object;
};

const getPitchColor = (result: string): string => {
  switch (result) {
    case '볼':
      return '#76DC4C'; // 초록
    case '파울':
    case '헛스윙':
    case '스트라이크':
      return '#FFC05B'; // 노랑
    case '타격':
      return '#3498db'; // 파랑
    default:
      return '#95a5a6'; // 회색
  }
};

const StrikeZoneBox = ({
  strikeZone,
  pitches,
  widthRatio = 0.32,
  style,
}: Props) => {
  const [top, bottom, right, left] = strikeZone;

  // 반응형 박스 크기
  const width = SCREEN_WIDTH * widthRatio;
  const height = width * 1.2;

  const ZONE_WIDTH = width * 0.6;
  const ZONE_HEIGHT = height * 0.6;
  const ZONE_LEFT = (width - ZONE_WIDTH) / 2 - 7;
  const ZONE_TOP = (height - ZONE_HEIGHT) / 2;

  const cellW = ZONE_WIDTH / 3;
  const cellH = ZONE_HEIGHT / 3;

  // 좌표 → 화면 px 위치로 변환
  const mapX = (x: number) => ((x - left) / (right - left)) * ZONE_WIDTH + ZONE_LEFT;
  const mapY = (y: number) => ((top - y) / (top - bottom)) * ZONE_HEIGHT + ZONE_TOP;

  return (
    <View style={[styles.container, { width, height }, style]}>
      {/* View 외곽선 */}
      <View style={[styles.borderLine, { height }]} />
      <View style={[styles.borderLineH, { width }]} />

      {/* 스트존 박스 */}
      <View
        style={{
          position: 'absolute',
          left: ZONE_LEFT,
          top: ZONE_TOP,
          width: ZONE_WIDTH,
          height: ZONE_HEIGHT,
          backgroundColor: '#5CB85C',
          borderColor: 'white',
          borderWidth: 1,
        }}
      >
        {/* 격자 - 가로 */}
        {[1, 2].map(i => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              top: i * cellH,
              left: -0.6,
              width: ZONE_WIDTH,
              height: 1,
              backgroundColor: 'white',
            }}
          />
        ))}
        {/* 격자 - 세로 */}
        {[1, 2].map(i => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              left: i * cellW,
              top: -1,
              width: 1,
              height: ZONE_HEIGHT,
              backgroundColor: 'white',
            }}
          />
        ))}
      </View>

      {/* 투구 공 위치 표시 */}
      {pitches.map((pitch, idx) => {
        const px = mapX(pitch.x);
        const py = mapY(pitch.y);

        // 스트존 박스 기준 내부 + 근처 공들도 렌더링 (볼을 더 잘 보이게)
        const margin = 30; // 스트라이크존 밖으로 30px까지 확장
        const isInsideZone =
          px >= ZONE_LEFT - margin &&
          px <= ZONE_LEFT + ZONE_WIDTH + margin &&
          py >= ZONE_TOP - margin &&
          py <= ZONE_TOP + ZONE_HEIGHT + margin;

        if (!isInsideZone) return null;

        return (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: px - 8,
              top: py - 8,
              width: 15,
              height: 15,
              borderRadius: 8,
              backgroundColor: getPitchColor(pitch.pitchResult),
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: 'white',
              zIndex: pitch.pitchNum,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 9 }}>
              {pitch.pitchNum}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default StrikeZoneBox;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3e8e22',
    position: 'relative',
  },
  borderLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  borderLineH: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});