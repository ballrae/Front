import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Header from '../components/Header';
import axiosInstance from '../utils/axiosInstance';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import teamLogoMap from '../constants/teamLogos';

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
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}  ${hh}:${min}`;
};

const DetailPostScreen = () => {
  const route = useRoute<DetailPostRouteProp>();
  const { teamId, teamName, postId } = route.params;
  const navigation = useNavigation();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts/${teamId}/${postId}`);
        setPost(res.data.data);
      } catch (err) {
        console.error('게시글 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [teamId, postId]);

  if (loading || !post) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${teamName} 게시판`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.contentWrapper}>
        {post.isPinned ? (
          // ✅ 공지글일 경우 작성자 대신 구단 이름 표시
          <Text style={styles.noticeAuthor}>{teamName}</Text>
        ) : (
          // ✅ 일반글일 경우 작성자 정보 출력
          <View style={styles.profileRow}>
            <Image
              source={teamLogoMap[post.authorTeamId]}
              style={styles.profileImage}
            />
            <View style={styles.textColumn}>
              <Text style={styles.nickname}>{post.authorNickname}</Text>
              <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.content}>{post.content}</Text>
      </ScrollView>
    </View>
  );
};

export default DetailPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentWrapper: {
    paddingTop: 10,
    paddingHorizontal: 25,
   
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  textColumn: {
    flexDirection: 'column',
  },
  nickname: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noticeAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
    marginLeft: 2,
  },
  title: {
    paddingTop:10,
    paddingHorizontal: 5,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  content: {
    paddingHorizontal: 5,
    fontSize: 14,
    lineHeight: 24,
  },
});