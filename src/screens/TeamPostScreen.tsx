import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Header from '../components/Header';
import FlagIcon from '../assets/icons/flag_icon.svg';

import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

import axiosInstance from '../utils/axiosInstance';

interface Post {
  postId: number;
  title: string;
  createdAt: string;
  isPinned: boolean;
}

const TeamPostsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { teamId, teamName } = route.params;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [canWrite, setCanWrite] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axiosInstance.get(`/api/posts/${teamId}/`);
        setPosts(res.data.data);
      } catch (e) {
        console.error('게시글 불러오기 실패:', e);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchPosts();
    }
  }, [isFocused, teamId]);

  const formatDate = (dateStr: string) => {
    const dateOnly = dateStr.split('T')[0];
    return dateOnly.replace(/-/g, '.');
  };

  // 글쓰기 버튼 제한 함수
  const onWritePress = () => {
    if (!canWrite) {
      Alert.alert(
        '잠시만요!',
        '20초 이내에 다시 글을 작성할 수 없습니다.',
        [{ text: '확인' }]
      );
      return;
    }

    setCanWrite(false); // 20초 동안 비활성화
    navigation.navigate('WritePostScreen', { teamId, teamName });

    setTimeout(() => {
      setCanWrite(true);
    }, 30000); // 20초
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[
        styles.postItem,
        item.isPinned && styles.pinnedBackground,
        item.isPinned && styles.pinnedBorder,
      ]}
      onPress={() =>
        navigation.navigate('DetailPostScreen', {
          teamId,
          teamName,
          postId: item.postId,
        })
      }
    >
      <View style={styles.leftSection}>
        {item.isPinned && (
          <FlagIcon width={20} height={20} style={styles.flagIcon} />
        )}
        <Text style={[styles.title, item.isPinned && styles.pinnedTitle]}>
          {item.title}
        </Text>
      </View>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${teamName} 게시판`}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showWriteButton
        onWritePress={onWritePress} // 제한된 글쓰기 버튼
      />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.postId.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default TeamPostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  postItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    minHeight: 50,
  },
  pinnedBackground: {
    backgroundColor: '#E5E5E5',
  },
  pinnedBorder: {
    borderBottomColor: '#fff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  flagIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  title: {
    fontSize: 14,
    color: '#000',
    flexShrink: 1,
  },
  pinnedTitle: {
    fontWeight: '600',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 10,
  },
});