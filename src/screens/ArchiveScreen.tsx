import React from "react";
import { View, Text, StyleSheet, Button } from 'react-native';
import { startLiveActivity, updateLiveActivity, endLiveActivity } from '../bridge/SharedData';

const ArchiveScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>여기는 기록실 화면입니다!</Text>

      {/* 🔘 라이브 액티비티 시작 → 순차 메시지 → 자동 종료 */}
      <View style={styles.button}>
        <Button
          title="라이브 액티비티 시작"
          onPress={() => startLiveActivity("기록실 테스트 시작!")}
          color="#6A5ACD"
        />
      </View>

      {/* 🔄 수동 상태 업데이트 */}
      <View style={styles.button}>
        <Button
          title="상태 업데이트: 진행 중"
          onPress={() => updateLiveActivity("업데이트됨: 처리 중")}
        />
      </View>

      {/* 🛑 수동 종료 */}
      <View style={styles.button}>
        <Button
          title="라이브 액티비티 강제 종료"
          onPress={endLiveActivity}
          color="red"
        />
      </View>
    </View>
  );
};

export default ArchiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 30,
  },
  button: {
    marginVertical: 10,
    width: '80%',
  },
});