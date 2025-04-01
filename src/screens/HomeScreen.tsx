import React from "react";
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () =>{
    return (
        <View style={styles.container}>
        <Text style={styles.text}>여기는 홈 화면입니다!</Text>
      </View>
    );
};

export default HomeScreen;


//일단 스타일시트
const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});