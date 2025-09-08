// src/components/archive/batter/BatterBasicStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PercentileSlider from '../PercentileSlider';

interface BatterBasicStatsProps {
  G: number;
  AVG: number;
  WAR: number;
  wRC: number;
  OBP: number;
  SLG: number;
  OPS: number;
  HR: number;
  WAR_percentile: number;
  wRC_percentile: number;
  OBP_percentile: number;
  SLG_percentile: number;
  OPS_percentile: number;
  HR_percentile: number;
}

const BatterBasicStats: React.FC<BatterBasicStatsProps> = (props) => {
  const percentileData = [
    { label: 'WAR%', value: props.WAR_percentile },
    { label: 'wRC+%', value: props.wRC_percentile },
    { label: 'OBP%', value: props.OBP_percentile },
    { label: 'SLG%', value: props.SLG_percentile },
    { label: 'OPS%', value: props.OPS_percentile },
    { label: 'HR%', value: props.HR_percentile },
  ];

  const statKeys = ['G', 'AVG', 'WAR', 'wRC+', 'OBP', 'SLG', 'OPS', 'HR'];
  const statValues = [props.G, props.AVG, props.WAR, props.wRC, props.OBP, props.SLG, props.OPS, props.HR];

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

export default BatterBasicStats;

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