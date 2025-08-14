import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VerticalSliderProps {
  value: number; // 0 ~ 100
  label: string;
}

const VerticalSlider: React.FC<VerticalSliderProps> = ({ value, label }) => {
  const graphHeight = 140;
  const markerTop = Math.min(Math.max((100 - value) / 100 * graphHeight, 10), 125);
  return (
    <View style={styles.container}>
      <View style={styles.graph}>
        <View style={styles.fullLine} />
        <View style={[styles.dot, { top: 0 }]} />
        <View style={[styles.dot, { top: graphHeight / 2 }]} />
        <View style={[styles.dot, { top: graphHeight }]} />
        <View style={[styles.marker, { top: markerTop }]}>
          <Text style={styles.markerText}>{value}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default VerticalSlider;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
  },
  graph: {
    height: 140,
    width: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  fullLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.2,
    backgroundColor: '#000',
    left: '50%',
    transform: [{ translateX: -1 }],
    zIndex: 1,
  },
  dot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#000',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -3 }],
    zIndex: 2,
  },
  marker: {
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
  markerText: {
    color: '#fff',
    fontSize: 11,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 12,
    textAlign: 'center',
  },
});