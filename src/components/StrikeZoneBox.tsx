import React from 'react';
import { View, Text } from 'react-native';

type Pitch = {
  x: number;
  y: number;
  pitchNum: number;
  pitchResult: string;
};

type Props = {
  strikeZone: [number, number, number, number]; // [top, bottom, right, left]
  pitches: Pitch[];
  width?: number;
  height?: number;
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
  width = 120,
  height = 160,
  style,
}: Props) => {
  const [top, bottom, right, left] = strikeZone;

  // 스트존 좌표 기준 보기 영역 설정 (좌표계 기준)
  const padding = 1.0;
  const viewTop = top + padding;
  const viewBottom = bottom - padding;
  const viewRight = right + padding;
  const viewLeft = left - padding;

  const viewWidth = viewRight - viewLeft;
  const viewHeight = viewTop - viewBottom;

  // 좌표 → 픽셀 변환
  const mapX = (x: number) => ((x - viewLeft) / viewWidth) * width;
  const mapY = (y: number) => ((viewTop - y) / viewHeight) * height;

  // 고정된 픽셀 기반 스트존 박스
  const ZONE_WIDTH = width * 0.75;
  const ZONE_HEIGHT = height * 0.75;
  const ZONE_LEFT = (width - ZONE_WIDTH) / 2;
  const ZONE_TOP = (height - ZONE_HEIGHT) / 2;

  const cellW = ZONE_WIDTH / 3;
  const cellH = ZONE_HEIGHT / 3;

  return (
    <View style={[{ width, height, backgroundColor: '#228B22' }, style]}>
      {/* 스트존 그리드 박스 */}
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
        {/* 격자선: 픽셀 기준 3x3 정확 분할 */}
        {[1, 2].map(i => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              top: i * cellH,
              left: 0,
              width: ZONE_WIDTH,
              height: 1,
              backgroundColor: 'white',
            }}
          />
        ))}
        {[1, 2].map(i => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              left: i * cellW,
              top: 0,
              width: 1,
              height: ZONE_HEIGHT,
              backgroundColor: 'white',
            }}
          />
        ))}
      </View>

      {/* 투구 공 */}
      {pitches.map((pitch, idx) => {
        const px = mapX(pitch.x);
        const py = mapY(pitch.y);

        return (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: px - 8,
              top: py - 8,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: getPitchColor(pitch.pitchResult),
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: 'white',
             zIndex: pitch.pitchNum,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 9,
              }}
            >
              {pitch.pitchNum}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default StrikeZoneBox;