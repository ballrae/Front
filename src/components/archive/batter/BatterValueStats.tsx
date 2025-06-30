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
          <RadarChart labels={chartLabels} values={chartValues} size={220} />
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
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end', // 하단 정렬
  },
  sliderWrapper: {
    marginLeft: 34,
    minWidth: 40,
    alignSelf: 'flex-end', // 하단 정렬
    marginBottom:50
  },
});