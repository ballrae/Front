// src/screens/DetailPostScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView,
  Platform, Keyboard, TouchableWithoutFeedback, Image,
} from 'react-native';
import Header from '../components/Header';
import { RouteProp, useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import teamLogoMap from '../constants/teamLogos';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LikeIcon from '../assets/icons/like.svg';
import LikeActiveIcon from '../assets/icons/like_active.svg';
import ChatIcon from '../assets/icons/chat.svg';
import axios from 'axios';

type DetailPostRouteProp = RouteProp<
  { params: { teamId: string; teamName: string; postId: number } },
  'params'
>;

interface PostDetail {
  postId: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
  authorNickname: string;
  authorTeamId: string;
  isPinned: boolean;
  likesCount: number;
  isLiked: boolean;
  imageUri?: string;
}

interface CommentItem {
  id: number;
  comment_content: string;
  comment_created_at: string;
  userNickname: string;
  userTeamId: string;
}

const formatDate = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 욕설 필터링 API 함수
const filterText = async (text: string): Promise<string> => {
  try {
    console.log('🔍 욕설 필터링 요청 시작:', text);
    console.log('🔍 요청 URL:', 'http://3.15.209.24:8001/filter');
    
    const res = await axios.post('http://3.15.209.24:8001/filter', 
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10초로 늘림
      }
    );
    
    console.log('🔍 응답 상태:', res.status);
    console.log('🔍 응답 헤더:', res.headers);
    console.log('🔍 응답 데이터:', res.data);
    
    const filteredText = res.data.masked_text || text;
    console.log('🔍 최종 필터링된 텍스트:', filteredText);
    return filteredText;
  } catch (err: any) {
    console.error('🚨 욕설 필터링 실패!');
    console.error('🚨 에러 타입:', typeof err);
    console.error('🚨 에러 메시지:', err.message);
    console.error('🚨 에러 코드:', err.code);
    console.error('🚨 응답 상태:', err.response?.status);
    console.error('🚨 응답 데이터:', err.response?.data);
    console.error('🚨 전체 에러:', err);
    
    // 필터링 실패 시 원본 텍스트를 그대로 반환
    return text;
  }
};

const DetailPostScreen = () => {
  const route = useRoute<DetailPostRouteProp>();
  const { teamId, teamName, postId } = route.params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredContent, setFilteredContent] = useState<string>('');
  const [filteredComments, setFilteredComments] = useState<CommentItem[]>([]);

  const fetchPostAndComments = async () => {
    console.time('🟡 fetchPostAndComments 전체');
    try {
      setLoading(true);
      console.time('🟢 게시글, 댓글 동시 요청');
      const [postRes, commentsRes] = await Promise.all([
        axiosInstance.get(`/api/posts/${teamId}/${postId}`),
        axiosInstance.get(`/api/posts/${teamId}/${postId}/comments/`),
      ]);
      console.timeEnd('🟢 게시글, 댓글 동시 요청');

      const postData = postRes.data.data;
      const liked = await AsyncStorage.getItem('likedPosts');
      const likedIds: number[] = liked ? JSON.parse(liked) : [];
      const storedImageUri = await AsyncStorage.getItem(`postImage-${postData.postId}`);
      postData.imageUri = storedImageUri;

      if (likedIds.includes(postData.postId)) {
        postData.isLiked = true;
      }

      setPost(postData);
      setComments(commentsRes.data.data);
      
      // 게시글 내용 필터링
      const filteredPostContent = await filterText(postData.content);
      setFilteredContent(filteredPostContent);
      
      // 댓글 내용들 필터링
      const filteredCommentsData = await Promise.all(
        commentsRes.data.data.map(async (comment: CommentItem) => ({
          ...comment,
          comment_content: await filterText(comment.comment_content)
        }))
      );
      setFilteredComments(filteredCommentsData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        Alert.alert('알림', '로그인 후 이용해주세요!', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('불러오기 실패', '게시글 또는 댓글 데이터를 가져오지 못했습니다.');
      }
    } finally {
      setLoading(false);
      console.timeEnd('🟡 fetchPostAndComments 전체');
    }
  };

  const toggleLike = async () => {
    try {
      const res = await axiosInstance.post(`/api/posts/${teamId}/${postId}/like/`);
      const { isLiked, likesCount } = res.data.data;

      let liked = await AsyncStorage.getItem('likedPosts');
      let likedIds: number[] = liked ? JSON.parse(liked) : [];

      if (isLiked) {
        if (!likedIds.includes(postId)) likedIds.push(postId);
      } else {
        likedIds = likedIds.filter(id => id !== postId);
      }

      await AsyncStorage.setItem('likedPosts', JSON.stringify(likedIds));
      setPost(prev => prev ? { ...prev, isLiked, likesCount } : prev);
    } catch {
      Alert.alert('좋아요 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  // 필터링 적용한 댓글 작성 함수
  const handleCommentSubmit = async () => {
    console.log('📝 [handleCommentSubmit] 시작 - commentText:', commentText);
    
    if (!commentText.trim()) {
      console.log('📝 [handleCommentSubmit] 댓글 텍스트가 비어있음');
      return;
    }
    
    try {
      console.log('📝 [handleCommentSubmit] 댓글 작성 시작:', commentText);
      console.log('📝 [handleCommentSubmit] teamId:', teamId, 'postId:', postId);
      
      const filteredComment = await filterText(commentText); // 욕설 필터링 API 호출
      console.log('📝 [handleCommentSubmit] 필터링된 댓글:', filteredComment);
      
      console.log('📝 [handleCommentSubmit] API 요청 시작');
      const postResponse = await axiosInstance.post(`/api/posts/${teamId}/${postId}/comments/`, {
        comment_content: filteredComment,
      });
      console.log('📝 [handleCommentSubmit] API 요청 성공:', postResponse.data);
      
      setCommentText('');
      console.log('📝 [handleCommentSubmit] 댓글 텍스트 초기화 완료');
      
      console.log('📝 [handleCommentSubmit] 댓글 목록 새로고침 시작');
      const res = await axiosInstance.get(`/api/posts/${teamId}/${postId}/comments/`);
      console.log('📝 [handleCommentSubmit] 댓글 목록 응답:', res.data);
      
      setComments(res.data.data);
      console.log('📝 [handleCommentSubmit] 댓글 상태 업데이트 완료');
      
      // 새로 추가된 댓글들도 필터링
      console.log('📝 [handleCommentSubmit] 댓글 필터링 시작');
      const filteredCommentsData = await Promise.all(
        res.data.data.map(async (comment: CommentItem) => ({
          ...comment,
          comment_content: await filterText(comment.comment_content)
        }))
      );
      setFilteredComments(filteredCommentsData);
      console.log('📝 [handleCommentSubmit] 최종 필터링된 댓글 목록:', filteredCommentsData);
      console.log('📝 [handleCommentSubmit] 댓글 작성 완료!');
    } catch (err: any) {
      console.error('📝 [handleCommentSubmit] 댓글 작성 에러!');
      console.error('📝 [handleCommentSubmit] 에러 타입:', typeof err);
      console.error('📝 [handleCommentSubmit] 에러 메시지:', err.message);
      console.error('📝 [handleCommentSubmit] 에러 코드:', err.code);
      console.error('📝 [handleCommentSubmit] 응답 상태:', err.response?.status);
      console.error('📝 [handleCommentSubmit] 응답 데이터:', err.response?.data);
      console.error('📝 [handleCommentSubmit] 전체 에러:', err);
      
      Alert.alert('댓글 등록 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    if (isFocused) {
      console.time('🟢 DetailPostScreen 진입 → fetchPostAndComments');
      fetchPostAndComments();
    }
  }, [isFocused]);

  if (loading || !post) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <KeyboardAvoidingView key={postId} style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Header title={`${teamName} 게시판`} showBackButton onBackPress={() => navigation.goBack()} />

          <ScrollView contentContainerStyle={styles.contentWrapper} keyboardShouldPersistTaps="handled">
            <View style={styles.profileRow}>
              <Image source={teamLogoMap[post.authorTeamId]} style={styles.profileImage} />
              <View style={styles.textColumn}>
                <Text style={styles.nickname}>{post.authorNickname}</Text>
                <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>

            <Text style={styles.title}>{post.title}</Text>
            {post.imageUri && (
              <Image source={{ uri: post.imageUri }} style={styles.postImage} />
            )}
            <Text style={styles.content}>{filteredContent || post.content}</Text>

            <View style={styles.reactionBar}>
              <TouchableOpacity style={styles.reactionItem} onPress={toggleLike}>
                {post.isLiked ? <LikeActiveIcon width={20} height={20} /> : <LikeIcon width={20} height={20} />}
                <Text style={styles.reactionText}>좋아요({post.likesCount})</Text>
              </TouchableOpacity>

              <View style={styles.reactionItem}>
                <ChatIcon width={20} height={20} />
                <Text style={styles.reactionText}>댓글({comments.length})</Text>
              </View>
            </View>

            <View style={styles.commentSection}>
              {(filteredComments.length > 0 ? filteredComments : comments).map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  <Image source={teamLogoMap[comment.userTeamId]} style={styles.commentProfileImage} />
                  <View style={styles.commentTextColumn}>
                    <View style={styles.commentHeaderRow}>
                      <Text style={styles.commentNickname}>{comment.userNickname}</Text>
                      <Text style={styles.commentDate}>{formatDate(comment.comment_created_at)}</Text>
                    </View>
                    <Text style={styles.commentContent}>{comment.comment_content}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.commentInputBar}>
            <TextInput
              style={styles.input}
              placeholder="댓글을 입력하세요."
              value={commentText}
              onChangeText={setCommentText}
              placeholderTextColor="#aaa"
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={() => {
                console.log('📝 [버튼 클릭] 댓글 작성 버튼 클릭됨');
                handleCommentSubmit();
              }}
            >
              <Text style={styles.sendButtonText}>입력</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  contentWrapper: { padding: 20, paddingBottom: 100 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileImage: { width: 40, height: 40, resizeMode: 'contain', marginRight: 10 },
  textColumn: { flexDirection: 'column' },
  nickname: { fontSize: 16, fontWeight: '500', color: '#000' },
  date: { fontSize: 12, color: '#666', marginTop: 2 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  postImage: {
    width: '100%', height: 200, borderRadius: 12,
    resizeMode: 'cover', marginBottom: 16,
  },
  content: { fontSize: 14, lineHeight: 24, marginBottom: 20 },
  reactionBar: {
    flexDirection: 'row', borderTopWidth: 1,
    borderBottomWidth: 1, borderColor: '#eee',
    paddingVertical: 10, justifyContent: 'space-around',
  },
  reactionItem: { flexDirection: 'row', alignItems: 'center' },
  reactionText: { fontSize: 14, color: '#666', marginLeft: 6 },
  commentSection: { marginTop: 16 },
  commentRow: { flexDirection: 'row', marginBottom: 16 },
  commentProfileImage: { width: 36, height: 36, resizeMode: 'contain', marginRight: 10 },
  commentTextColumn: { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  commentNickname: { fontSize: 14, fontWeight: '600', color: '#000' },
  commentDate: { fontSize: 12, color: '#999' },
  commentContent: { fontSize: 14, color: '#333', lineHeight: 20 },
  commentInputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
  },
  input: {
    flex: 1, backgroundColor: '#F4F4F4', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, marginRight: 10, color: '#000',
  },
  sendButton: {
    backgroundColor: '#408A21',
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default DetailPostScreen;