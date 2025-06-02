import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Pitch = {
  x: number;
  y: number;
  pitchNum: number;
  pitchResult: string;
};

type Props = {
  strikeZone: [number, number, number, number]; // [top, bottom, right, left]
  pitches: Pitch[];
  width?: number; // 전체 박스 크기 (기본 150x150)
  height?: number;
  style?: object;
};

// pitch result별 색 매핑 함수
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
      return '#95a5a6'; // 회색 (기타)
  }
};

const StrikeZoneBox = ({
  strikeZone,
  pitches,
  width = 120, // 기본값 
  height = 150,
  style,
}: Props) => {
  const [top, bottom, right, left] = strikeZone;

  // 📏 전체 보기 범위 (스트존보다 여유 있게)
  const PADDING = 1.0;
  const viewTop = top + PADDING;
  const viewBottom = bottom - PADDING;
  const viewRight = right + PADDING;
  const viewLeft = left - PADDING;

  const viewWidth = viewRight - viewLeft;
  const viewHeight = viewTop - viewBottom;

  //  정규화된 좌표 매핑 함수
  const mapX = (x: number) => ((x - viewLeft) / viewWidth) * width;
  const mapY = (y: number) => ((viewTop - y) / viewHeight) * height;

  // 스트존 박스 좌표 계산
  const szX = mapX(left);
  const szY = mapY(top);
  const szWidth = mapX(right) - szX;
  const szHeight = mapY(bottom) - szY;

  return (
    <View style={[{ width, height, backgroundColor: '#228B22', borderWidth: 1, borderColor: '#ccc' }, style]}>
      {/* 스트라이크존 */}
      <View
        style={{
          position: 'absolute',
          left: szX,
          top: szY,
          width: szWidth,
          height: szHeight,
          backgroundColor: '#5CB85C',
          borderWidth: 1,
          borderColor: 'white',
        }}
      >
        {/* 격자선 */}
        {[1, 2].map(i => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              top: (szHeight / 3) * i,
              left: 0,
              width: szWidth,
              height: 1,
              backgroundColor: '#ffffff88',
            }}
          />
        ))}
        {[1, 2].map(i => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              left: (szWidth / 3) * i,
              top: 0,
              width: 1,
              height: szHeight,
              backgroundColor: '#ffffff88',
            }}
          />
        ))}
      </View>

      {/* 공 */}
      {pitches.map((pitch, idx) => {
        const px = mapX(pitch.x);
        const py = mapY(pitch.y);

        return (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: px - 8 ,
              top: py - 8 ,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: getPitchColor(pitch.pitchResult), // ← 여기!
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,                  
              borderColor: 'rgba(255,255,255,0.8)',
              zIndex: pitch.pitchNum,
            }}
          >
            <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>{pitch.pitchNum}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default StrikeZoneBox;