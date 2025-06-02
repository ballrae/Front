import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import StrikeZoneBox from '../components/StrikeZoneBox';

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


      {/*  스트라이크존 시각화 컴포넌트 */}
      {/*  일단 더미 데이터 넣어둔 상태 */}
      <StrikeZoneBox
        strikeZone={[3.305, 1.603, 0.75, -0.75]}
        pitches={[
            { x: 0.7097, y: 1.8937, pitchNum: 8, pitchResult: '타격' },
            { x: 0.5597, y: 1.9396, pitchNum: 7, pitchResult: '파울' },
            { x: -0.9004, y: 3.1996, pitchNum: 6, pitchResult: '볼' },
            { x: -0.0719, y: 3.8389, pitchNum: 5, pitchResult: '볼' },
            { x: -0.7577, y: 2.3856, pitchNum: 4, pitchResult: '파울' },
            { x: -0.5311, y: 0.6612, pitchNum: 3, pitchResult: '헛스윙' },
            { x: -1.3682, y: 2.3547, pitchNum: 2, pitchResult: '볼' },
            { x: 0.4839, y: 1.4516, pitchNum: 1, pitchResult: '파울' },
          ]}
        width={120}
        height={150}
        style={{ marginTop: 20 }}
      />
      
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