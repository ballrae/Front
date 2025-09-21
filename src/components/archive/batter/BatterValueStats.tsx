import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VerticalSlider from '../VerticalSlider';
import RadarChart from './RadarChart';

interface BatterValueStatsProps {
  offensiveRAA: number;
  defensiveRAA: number;
  battingRAA: number;
  baserunningRAA: number;
  fieldingRAA: number;
  totalRAA: number;
  offensiveRAAPercentile?: number;
  defensiveRAAPercentile?: number;
  battingRAAPercentile?: number;
  baserunningRAAPercentile?: number;
  fieldingRAAPercentile?: number;
  totalRAAPercentile?: number;
}

const BatterValueStats: React.FC<BatterValueStatsProps> = ({
  offensiveRAA,
  defensiveRAA,
  battingRAA,
  baserunningRAA,
  fieldingRAA,
  totalRAA,
  offensiveRAAPercentile,
  defensiveRAAPercentile,
  battingRAAPercentile,
  baserunningRAAPercentile,
  fieldingRAAPercentile,
  totalRAAPercentile,
}) => {
  const chartLabels = ['공격RAA', '수비RAA', '타격RAA', '주루RAA', '필딩RAA'];
  
  // 랜덤 퍼센타일 생성 함수 (30-80 범위)
  const getRandomPercentile = () => Math.floor(Math.random() * 51) + 30; // 30-80
  
  // 동그라미에 표시할 값은 퍼센테이지
  const chartValues = [
    offensiveRAAPercentile || getRandomPercentile(),
    defensiveRAAPercentile || getRandomPercentile(), 
    battingRAAPercentile || getRandomPercentile(),
    baserunningRAAPercentile || getRandomPercentile(),
    fieldingRAAPercentile || getRandomPercentile()
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>가치</Text>
      <View style={styles.contentRow}>
        <View style={styles.chartWrapper}>
          <RadarChart 
            labels={chartLabels} 
            values={chartValues} 
            size={220} 
          />
        </View>
        <View style={styles.sliderWrapper}>
          <VerticalSlider 
            label="종합RAA" 
            value={totalRAAPercentile || getRandomPercentile()} 
          />
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