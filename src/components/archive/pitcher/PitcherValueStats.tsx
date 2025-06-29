import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PitcherValueStatsProps {
  K9: number;
  BB9: number;
  K9_percentile: number;
  BB9_percentile: number;
  RAA_percentile: number;
}

const getMarkerColor = (value: number) => {
  if (value >= 70) return '#408A21';
  if (value <= 30) return '#C7E0BC';
  return '#92C17D';
}

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
                <Text style={styles.dataText}>{K9.toFixed(2)}</Text>
              </View>
              <View style={[styles.cell, { borderRightWidth: 0 }]}>
                <Text style={styles.dataText}>{BB9.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* 슬라이더 2개 */}
          <View style={styles.sliderBox}>
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
                            color:
                              getMarkerColor(item.value) === '#408A21' ? '#fff' : '#000',
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

        {/* 오른쪽: 가치 */}
        <View style={styles.rightBox}>
          <Text style={styles.subTitle}>가치</Text>
          <View style={styles.verticalGraph}>
            {/* 선 */}
            <View style={styles.fullLine} />
            {/* 점 */}
            <View style={[styles.dot, { top: 0 }]} />
            <View style={[styles.dot, { top: '50%' }]} />
            <View style={[styles.dot, { bottom: 0 }]} />
            {/* 마커 */}
            <View
              style={[
                styles.markerVertical,
                {
                  top: `${100 - RAA_percentile}%`,
                },
              ]}
            >
              <Text style={styles.markerTextWhite}>{RAA_percentile}</Text>
            </View>
          </View>
            {/* 라벨 */}
            <Text style={styles.sliderLabel}>종합RAA%</Text>
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
  sliderBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  // 🎯 가치 세로 그래프
  verticalGraph: {
    height: 140,
    width: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginTop: 8,
  },
  fullLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.3,
    backgroundColor: '#000',
    left: '50%',
    transform: [{ translateX: -1 }],
    zIndex: 1,
    
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -3 }],
    zIndex: 2,
  },
  markerVertical: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#408A21',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  markerTextWhite: {
    color: '#fff',
   // fontWeight: 'bold',
    fontSize: 11,
  },
});