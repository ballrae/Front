// src/components/common/PercentileSlider.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface PercentileSliderProps {
  label: string;
  value: number;
  style?: ViewStyle;
}

const getMarkerColor = (value: number) => {
  if (value >= 70) return '#408A21';
  if (value <= 30) return '#C7E0BC';
  return '#92C17D';
};

const PercentileSlider: React.FC<PercentileSliderProps> = ({ label, value }) => {
  const color = getMarkerColor(value);

  return (
    <View style={styles.sliderBox}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View style={styles.trackWrapper}>
        <View style={styles.track}>
          {[0, 50, 100].map((_, i) => (
            <View key={i} style={[styles.tick, { left: `${i * 50}%` }]} />
          ))}
          <View
            style={[
              styles.marker,
              { left: `${value}%`, backgroundColor: color },
            ]}
          >
            <Text style={[styles.markerText, { color: color === '#408A21' ? '#fff' : '#000' }]}>
              {value}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PercentileSlider;

const styles = StyleSheet.create({
  sliderBox: {
    width: '30%',
    //width:100,
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
    width: 22.5,
    height: 22,
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