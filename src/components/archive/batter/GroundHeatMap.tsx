// src/components/archive/batter/GroundHeatMap.tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const GroundHeatMap = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/ground.png')} // 이미지 경로 확인
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

export default GroundHeatMap;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 300,
  },
});