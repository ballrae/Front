import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import StrikeZoneBox from './StrikeZoneBox';
import BaseballField from './BaseballField';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size: number) => (screenWidth / BASE_WIDTH) * size;

type Pitch = {
  x: number;
  y: number;
  pitchNum: number;
  pitchResult: string;
};

const FieldStatusBoard: React.FC = () => {
  const inning = 6;
  const pitchCount = 87;

  const [strikeZone, setStrikeZone] = useState<[number, number, number, number]>([3.305, 1.603, 0.75, -0.75]);
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    const fetchStrikeZoneData = async () => {
      try {
        const res = await axios.get('http://3.237.44.38:8000/api/games/20250703SSDS02025/relay/1/');
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          // 첫 투구 기준으로 스트존 추출 (모든 투구가 동일하다고 가정)
          const zone = JSON.parse(data[0].strike_zone);
          setStrikeZone(zone);

          // pitch 객체 리스트로 변환
          const parsed = data
            .filter((item: any) => Array.isArray(item.pitch_coordinate) && item.pitch_coordinate.length > 0)
            .map((item: any, idx: number) => ({
              x: item.pitch_coordinate[0][0],
              y: item.pitch_coordinate[0][1],
              pitchNum: item.pitch_number ?? idx + 1,
              pitchResult: item.pitch_result ?? '기타',
            }));

          setPitches(parsed);
        }
      } catch (err) {
        console.error('스트라이크존 데이터 로드 실패:', err);
      }
    };

    fetchStrikeZoneData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.diamondView}>
        <View style={{ width: '120%', height: '100%' }}>
          <BaseballField width="100%" height="100%" />
        </View>
      </View>

      <View style={styles.rightPanel}>
        <View style={styles.inningAndRunner}>
          <View style={styles.inningBox}>
            <View style={styles.triangleUp} />
            <Text style={styles.inningText}>{inning}</Text>
            <View style={styles.triangleDown} />
          </View>

          <View style={styles.runnerBox}>
            <View style={[styles.baseIcon, styles.runnerTop]} />
            <View style={[styles.baseIcon, styles.runnerLeft]} />
            <View style={[styles.baseIcon, styles.runnerRight]} />
          </View>
        </View>

        <View style={styles.countBox}>
          {[
            { label: 'B', count: 3, color: '#6c3', max: 4 },
            { label: 'S', count: 2, color: '#fc3', max: 3 },
            { label: 'O', count: 1, color: '#f44', max: 3 },
          ].map(({ label, count, color, max }) => (
            <View style={styles.countRow} key={label}>
              <Text style={styles.countLabel}>{label}</Text>
              {Array(max).fill(0).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.countDot,
                    { backgroundColor: i < count ? color : '#8bb980' },
                  ]}
                />
              ))}
            </View>
          ))}
          <View style={styles.countRow}>
            <Text style={styles.countLabel}>P</Text>
            <Text style={styles.pitchText}>{pitchCount}</Text>
          </View>
        </View>

        <View style={styles.strikeZoneContainer}>
          <StrikeZoneBox
            strikeZone={strikeZone}
            pitches={pitches}
            width={scale(110)}
            height={scale(130)}
          />
        </View>
      </View>
    </View>
  );
};

export default FieldStatusBoard;


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: scale(300),
    backgroundColor: '#3e8e22',
   flexDirection: 'row',
   justifyContent: 'space-between',
  },
  diamondView: {
    width: '70%',
    height: '100%',  
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',         // 혹시 넘칠 경우 잘라냄
    },
rightPanel: {
  width: '30%',
  height: '100%',
  justifyContent: 'space-between', // 각 요소를 위/중간/아래로 나눠 배치
  alignItems: 'flex-start',
},
  inningAndRunner: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: scale(20), // ← 적당히 띄우기
  },
  inningBox: {
    alignItems: 'center',
    marginLeft:scale(20), 
  },
  inningText: {
    color: 'white',
    fontSize: scale(28),
    fontWeight: 'bold',
    marginVertical: scale(2),
  },
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(5),
    borderRightWidth: scale(5),
    borderBottomWidth: scale(7),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  triangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(5),
    borderRightWidth: scale(5),
    borderTopWidth: scale(7),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#a5cd8d',
  },
  runnerBox: {
    position: 'relative',
    width: scale(50),
    height: scale(50),
    marginTop: scale(12),
  },
  baseIcon: {
    width: scale(12),
    height: scale(12),
    backgroundColor: '#a5cd8d',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },
  runnerTop: {
    top: 0,
    left: '50%',
    marginLeft: -scale(6),
  },
  runnerLeft: {
    top: '50%',
    left: scale(8),
    marginTop: -scale(13),
  },
  runnerRight: {
    top: '50%',
    right: scale(8),
    marginTop: -scale(13),
  },
  countBox: {
    alignItems: 'flex-start',
    marginLeft:scale(20), 
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(2),
  },
  countLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: scale(13),
    width: scale(14),
    marginRight: scale(4),
  },
  countDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(4),
  },
  pitchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: scale(13),
  },
strikeZoneContainer: {
  flex: 1,
  width: '100%',
  justifyContent: 'flex-end', // 아래로 딱 붙이는 설정
  alignItems: 'flex-end',      // 오른쪽 정렬 
},
});