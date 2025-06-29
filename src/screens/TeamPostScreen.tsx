import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import FlagIcon from '../assets/icons/flag_icon.svg';

import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

import { useIsFocused } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';


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

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/posts/${teamId}/`);
        const json = await res.json();
        setPosts(json.data);
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


  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[
        styles.postItem,
        item.isPinned && styles.pinnedBackground,
        item.isPinned && styles.pinnedBorder,
      ]}
      onPress={() => navigation.navigate('DetailPostScreen', {
        teamId,
        teamName,
        postId: item.postId,
      })}
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
        onWritePress={() =>
          navigation.navigate('WritePostScreen', { teamId, teamName })
        }
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