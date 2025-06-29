// src/components/archive/pitcher/PitcherBasicStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PitcherBasicStatsProps {
  G: number;
  W: number;
  L: number;
  S: number;
  IP: number;
  SO: number;
  ERA: number;
  FIP: number;
  WHIP: number;
  WAR: number;
  AVG: number;
  W_percentile: number;
  L_percentile: number;
  SO_percentile: number;
  ERA_percentile: number;
  FIP_percentile: number;
  WHIP_percentile: number;
  WAR_percentile: number;
  AVG_percentile: number;
}

const getMarkerColor = (value: number) => {
  if (value >= 70) return '#408A21';
  if (value <= 30) return '#C7E0BC';
  return '#92C17D';
};

const PitcherBasicStats: React.FC<PitcherBasicStatsProps> = (props) => {
  const percentileData = [
    { label: 'W%', value: props.W_percentile },
    { label: 'L%', value: props.L_percentile },
    { label: 'SO%', value: props.SO_percentile },
    { label: 'ERA%', value: props.ERA_percentile },
    { label: 'FIP%', value: props.FIP_percentile },
    { label: 'WHIP%', value: props.WHIP_percentile },
    { label: 'WAR%', value: props.WAR_percentile },
    { label: 'AVG%', value: props.AVG_percentile },
  ];

  const statKeys = ['G', 'W', 'L', 'S', 'IP', 'SO', 'ERA', 'FIP', 'WHIP', 'WAR', 'AVG'];
  const statValues = [props.G, props.W, props.L, props.S, props.IP, props.SO, props.ERA, props.FIP, props.WHIP, props.WAR, props.AVG];

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
          <View key={index} style={styles.percentileBox}>
            <Text style={styles.sliderLabel}>{item.label}</Text>
            <View style={styles.trackWrapper}>
              <View style={styles.track}>
                {[0, 50, 100].map((_, i) => (
                  <View
                    key={i}
                    style={[styles.tick, { left: `${i * 50}%` }]}
                  />
                ))}
                <View
                  style={[
                    styles.marker,
                    {
                      left: `${item.value}%`,
                      backgroundColor: getMarkerColor(item.value),
                      transform: [{ translateX: -12 }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.markerText,
                      { color: item.value >= 70 ? '#fff' : '#000' },
                    ]}
                  >
                    {item.value}
                  </Text>
                </View>
              </View>
            </View>
          </View>
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
  percentileBox: {
    width: '30%',
    marginBottom: 32,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 20,
    textAlign: 'center',
  },
  trackWrapper: {
    width: '80%',
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#ccc',
    position: 'relative',
  },
  tick: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888',
    position: 'absolute',
    top: -2,
  },
  marker: {
    position: 'absolute',
    top: -8,
    width: 18,
    height: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transform: [{ translateX: -12 }],
  },
  markerText: {
    fontSize: 8,
  },
});