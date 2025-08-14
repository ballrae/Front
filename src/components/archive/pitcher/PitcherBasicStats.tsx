// src/components/archive/pitcher/PitcherBasicStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PercentileSlider from '../PercentileSlider';

interface PitcherBasicStatsProps {
  G: number;
  W: number;
  L: number;
  SV: number;
  IP: number;
  SO: number;
  ERA: number;
  WHIP: number;
  WAR: number;
  AVG: number;
  W_percentile: number;
  L_percentile: number;
  SO_percentile: number;
  ERA_percentile: number;
  WHIP_percentile: number;
  WAR_percentile: number;
  AVG_percentile: number;
}

const PitcherBasicStats: React.FC<PitcherBasicStatsProps> = (props) => {
  const percentileData = [
    { label: 'W%', value: props.W_percentile },
    { label: 'L%', value: props.L_percentile },
    { label: 'SO%', value: props.SO_percentile },
    { label: 'ERA%', value: props.ERA_percentile },
    { label: 'WHIP%', value: props.WHIP_percentile },
    { label: 'WAR%', value: props.WAR_percentile },
    { label: 'AVG%', value: props.AVG_percentile },
  ];

  const statKeys = ['G', 'W', 'L', 'SV', 'IP', 'SO', 'ERA', 'WHIP', 'WAR', 'AVG'];
  const statValues = [props.G, props.W, props.L, props.SV, props.IP, props.SO, props.ERA, props.WHIP, props.WAR, props.AVG];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>기본</Text>

      <View style={styles.table}>
        <View style={styles.rowHeader}>
          {statKeys.map((h, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                styles.headerCell,
                i === statKeys.length - 1 && { borderRightWidth: 0 },
              ]}
            >
              <Text style={styles.headerText}>{h}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rowData}>
          {statValues.map((v, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                styles.dataCell,
                i === statValues.length - 1 && { borderRightWidth: 0 },
              ]}
            >
              <Text style={styles.dataText}>
                {typeof v === 'number'
                  ? v.toFixed(3).replace(/\.0+$/, '').replace(/\.([1-9]*)0+$/, '.$1')
                  : v}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.percentileContainer}>
        {percentileData.map((item, index) => (
          <PercentileSlider key={index} label={item.label} value={item.value} />
        ))}
      </View>
    </View>
  );
};

export default PitcherBasicStats;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  table: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  rowData: {
    flexDirection: 'row',
    backgroundColor: '#d0e6c4',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRightWidth: 0.5,
    borderColor: '#aaa',
  },
  headerCell: {
    borderBottomWidth: 0.5,
  },
  dataCell: {
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  percentileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
    marginTop: 15,
    margin: 10,
  },
});