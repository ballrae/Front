import React, { useState } from 'react';

import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../components/Header';
import axiosInstance from '../utils/axiosInstance'; 

const WritePostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { teamId, teamName } = route.params;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
  if (!title.trim() || !content.trim()) {
    Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
    return;
  }

  try {
    const response = await axiosInstance.post('/api/posts/create/', {
    team: teamId,  
    post_title: title,
    post_content: content,
    is_pinned: false,
    });

    if (response.status === 201) {
      Alert.alert('성공', '게시글이 등록되었습니다.');
      navigation.goBack();
    } else {
      Alert.alert('실패', '등록 중 문제가 발생했습니다.');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="글쓰기"
        showBackButton
        onBackPress={handleCancel}
        showCompleteButton
        onCompletePress={handleSubmit}
      />

      <View style={styles.container}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="제목을 입력해주세요."
          placeholderTextColor="#aaa"
        />
        <View style={styles.separator} />
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="내용을 입력해주세요."
          placeholderTextColor="#aaa"
          multiline
        />


      </View>
    </KeyboardAvoidingView>
  );
};

export default WritePostScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  contentInput: {
    height: 180,
    fontSize: 15,
    textAlignVertical: 'top',
    color: '#000',
  },
  separator: {
  height: 1,
  backgroundColor: '#ddd',
  marginBottom: 20,
  },
  
});