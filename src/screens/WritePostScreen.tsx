import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../components/Header';
import axiosInstance from '../utils/axiosInstance';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CameraIcon from '../assets/icons/camera.svg'; // svg 아이콘

const WritePostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { teamId, teamName } = route.params;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

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
        const postId = response.data.data.postId;

        // ✅ postId로 이미지 URI 저장
        if (imageUri) {
          const key = `postImage-${postId}`;
          await AsyncStorage.setItem(key, imageUri);
        }

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

  const openImagePicker = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel) return;
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    }
  };

return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: '#fff' }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <Header
          title="글쓰기"
          showBackButton
          onBackPress={handleCancel}
          showCompleteButton
          onCompletePress={handleSubmit}
        />

        <ScrollView style={styles.container}>

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요."
            placeholderTextColor="#aaa"
          />
          <View style={styles.separator} />
           {/* 이미지 미리보기 */}
          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력해주세요."
            placeholderTextColor="#aaa"
            multiline
          />
        </ScrollView>

        {/* 하단 고정 카메라 버튼 */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={openImagePicker}>
            <CameraIcon width={28} height={28} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
};

export default WritePostScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cameraIcon: {
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 16,
    borderRadius: 12,
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
  bottomBar: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderTopWidth: 1,
  borderColor: '#ddd',
  backgroundColor: '#fff',
  alignItems: 'flex-start',
},
});