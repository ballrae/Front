import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VerticalSlider from '../VerticalSlider';
import RadarChart from './RadarChart';

interface BatterValueStatsProps {
  attackRAA: number;
  defenseRAA: number;
  baseRAA: number;
  throwRAA: number;
  runRAA: number;
  overallRAA: number;
}

const BatterValueStats: React.FC<BatterValueStatsProps> = ({
  attackRAA,
  defenseRAA,
  baseRAA,
  throwRAA,
  runRAA,
  overallRAA,
}) => {
  const chartLabels = ['공격RAA%', '수비RAA%', '주루RAA%', '타격RAA%', '필딩RAA%'];
  const chartValues = [attackRAA, defenseRAA, runRAA, throwRAA, baseRAA];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>가치</Text>
      <View style={styles.contentRow}>
        <View style={styles.chartWrapper}>
          <RadarChart labels={chartLabels} values={chartValues} size={260} />
        </View>
        <View style={styles.sliderWrapper}>
          <VerticalSlider label="종합RAA%" value={overallRAA} />
        </View>
      </View>
    </View>
  );
};

export default BatterValueStats;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // 하단 정렬
  },
  chartWrapper: {
    width: 280, // 차트 영역 확대
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end', // 하단 정렬
    paddingVertical: 10, // 상하 여백 추가
  },
  sliderWrapper: {
    marginLeft: 20, // 간격 조정
    minWidth: 50, // 최소 너비 증가
    alignSelf: 'flex-end', // 하단 정렬
    marginBottom: 30, // 하단 여백 조정
  },
});