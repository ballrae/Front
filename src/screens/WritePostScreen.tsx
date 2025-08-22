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
import CameraIcon from '../assets/icons/camera.svg';
import axios from 'axios'; // 욕설 필터링용

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

  const filterText = async (text: string): Promise<string> => {
    try {
      const res = await axios.post('http://3.16.129.16:8001/filter', {
        text,
      });
      return res.data.masked_text || text;
    } catch (err) {
     // console.error('욕설 필터링 실패:', err);
      return text;
    }
  };

  const handleSubmit = async () => {
   // console.time('🟡 handleSubmit 전체');

    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const [filteredTitle, filteredContent] = await Promise.all([
        filterText(title),
        filterText(content),
      ]);
     
      const response = await axiosInstance.post('/api/posts/create/', {
        team: teamId,
        post_title: filteredTitle,
        post_content: filteredContent,
        is_pinned: false,
      });
     

      if (response.status === 201) {
        const postId = response.data.data.postId;

        if (imageUri) {
          await AsyncStorage.setItem(`postImage-${postId}`, imageUri);
        }

        Alert.alert('성공', '게시글이 등록되었습니다.');
        navigation.goBack();
      } else {
        Alert.alert('등록 실패', response.data.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error: any) {

      if (error.response?.status === 401) {
        Alert.alert('알림', '글쓰기는 로그인 후 이용해주세요!');
      } else if (error.response?.data?.message) {
        Alert.alert('등록 실패', error.response.data.message);
      } else {
        Alert.alert('오류', '네트워크 오류가 발생했습니다.');
      }
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

  // 댓글 함수
  const writeComment = async (commentText: string, postId: number) => {
    try {
      const filteredComment = await filterText(commentText);

      const res = await axiosInstance.post(`/api/posts/${postId}/comments/`, {
        comment: filteredComment,
      });

      if (res.status === 201) {
        Alert.alert('댓글 등록 완료!');
      } else {
        Alert.alert('댓글 등록 실패');
      }
    } catch (err) {
      Alert.alert('오류', '댓글 등록 중 오류가 발생했습니다. \n 다시 시도해주세요.');
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