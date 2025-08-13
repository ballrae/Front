import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VerticalSlider from '../VerticalSlider';

interface PitcherValueStatsProps {
  K9?: number;  // ⬅️ optional로 변경
  BB9?: number;
  K9_percentile: number;
  BB9_percentile: number;
  RAA_percentile: number;
}

const getMarkerColor = (value: number) => {
  if (value >= 70) return '#408A21';
  if (value <= 30) return '#C7E0BC';
  return '#92C17D';
};

const formatValue = (value?: number): string => {
  return typeof value === 'number' ? value.toFixed(2) : '-';
};

const PitcherValueStats: React.FC<PitcherValueStatsProps> = ({
  K9,
  BB9,
  K9_percentile,
  BB9_percentile,
  RAA_percentile,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* 왼쪽: 심화 */}
        <View style={styles.leftBox}>
          <Text style={styles.subTitle}>심화</Text>

          {/* 표 */}
          <View style={styles.statBox}>
            <View style={styles.rowHeader}>
              <View style={[styles.cell, { borderRightWidth: 0.5 }]}>
                <Text style={styles.headerText}>K/9</Text>
              </View>
              <View style={[styles.cell, { borderRightWidth: 0 }]}>
                <Text style={styles.headerText}>BB/9</Text>
              </View>
            </View>

            <View style={styles.rowData}>
              <View style={[styles.cell, { borderRightWidth: 0.5 }]}>
                <Text style={styles.dataText}>{formatValue(K9)}</Text>
              </View>
              <View style={[styles.cell, { borderRightWidth: 0 }]}>
                <Text style={styles.dataText}>{formatValue(BB9)}</Text>
              </View>
            </View>
          </View>

          {/* 슬라이더 2개 가로 정렬 */}
          <View style={styles.sliderRow}>
            {[{ label: 'K/9%', value: K9_percentile }, { label: 'BB/9%', value: BB9_percentile }].map((item, idx) => (
              <View key={idx} style={styles.slider}>
                <Text style={styles.sliderLabel}>{item.label}</Text>
                <View style={styles.trackWrapper}>
                  <View style={styles.track}>
                    {[0, 50, 100].map((_, i) => (
                      <View key={i} style={[styles.tick, { left: `${i * 50}%` }]} />
                    ))}
                    <View
                      style={[
                        styles.marker,
                        {
                          left: `${item.value}%`,
                          backgroundColor: getMarkerColor(item.value),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.markerText,
                          {
                            color: getMarkerColor(item.value) === '#408A21' ? '#fff' : '#000',
                          },
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

        {/* 오른쪽: VerticalSlider 컴포넌트 사용 */}
        <View style={styles.rightBox}>
          <Text style={styles.subTitle}>가치</Text>
          <VerticalSlider value={RAA_percentile} label="종합RAA%" />
        </View>
      </View>
    </View>
  );
};

export default PitcherValueStats;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftBox: {
    width: '60%',
  },
  rightBox: {
    width: '35%',
    alignItems: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  statBox: {
    width: 120,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 6,
    borderRightWidth: 0.5,
    borderColor: '#000',
  },
  headerText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },

  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  slider: {
    width: '48%',
    marginBottom: 8,
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
    alignSelf: 'center',
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
    fontWeight: 'bold',
  },
});