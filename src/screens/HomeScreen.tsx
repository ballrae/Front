import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';

const HomeScreen = () => {
  const fireworkRef = useRef<LottieView>(null);

  const handlePress = () => {
    // 재시작
    // 화면 여러번 누르면 애니메이션이 안 나오는 이슈 해결
    fireworkRef.current?.reset();
    fireworkRef.current?.play();
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Text style={styles.text}>홈 화면입니다!</Text>
      <LottieView
        ref={fireworkRef}
        source={require('../assets/firework.json')}
        autoPlay={false}
        loop={false}
        style={StyleSheet.absoluteFillObject} // 👈 화면 전체 꽉 채움!
        resizeMode="cover" // 👈 화면 비율에 맞춰 확대
      />
    </Pressable>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});