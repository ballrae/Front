import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { saveMessageToWidget } from '../bridge/SharedData';

const messages = [
  '🔥 불꽃처럼 뜨겁게!',
  '📌 오늘 할 일 완료!',
  '💪 지희 최고!',
  '📝 기록 완료!',
  '🌟 위젯 테스트 성공!',
  '🎉 오늘도 수고했어!'
];

const getRandomMessage = () => {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
};

const BoardScreen = () => {
  const handleSave = () => {
    const message = getRandomMessage();
    saveMessageToWidget(message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>여기는 게시판입니다 🗣️</Text>
      <Button title="랜덤 메시지 위젯에 보내기" onPress={handleSave} />
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 16 },
});