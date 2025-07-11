import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PercentileSlider from '../PercentileSlider';

interface BatterAdvancedStatsProps {
  BABIP: number;
  IsoP: number;
  BBK: number;
  BABIP_percentile: number;
  IsoP_percentile: number;
  BBK_percentile: number;
  HR_percentile: number;
}

const BatterAdvancedStats: React.FC<BatterAdvancedStatsProps> = (props) => {
  const statLabels = ['BABIP', 'IsoP', 'BB/K'];
  const statValues = [props.BABIP, props.IsoP, props.BBK];

  const percentileData = [
    { label: 'BABIP%', value: props.BABIP_percentile },
    { label: 'IsoP%', value: props.IsoP_percentile },
    { label: 'HR%', value: props.HR_percentile },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>심화</Text>

      <View style={styles.table}>
        <View style={styles.rowHeader}>
          {statLabels.map((label, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                styles.headerCell,
                index === statLabels.length - 1 && { borderRightWidth: 0 },
              ]}
            >
              <Text style={styles.headerText}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rowData}>
          {statValues.map((value, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                styles.dataCell,
                index === statValues.length - 1 && { borderRightWidth: 0 },
              ]}
            >
              <Text style={styles.dataText}>
                {typeof value === 'number'
                  ? value.toFixed(3).replace(/\.0+$/, '').replace(/\.([1-9]*)0+$/, '.$1')
                  : value}
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

export default BatterAdvancedStats;

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
    width: 120,
   flexDirection: 'column',
   marginBottom: 20,
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
    width: 40,  // 명확히 지정
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