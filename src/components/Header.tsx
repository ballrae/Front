import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import BackIcon from '../assets/icons/back.svg'; // SVG 아이콘

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showCompleteButton?: boolean;
  onCompletePress?: () => void;
  showWriteButton?: boolean;
  onWritePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showCompleteButton = false,
  onCompletePress,
  showWriteButton = false,
  onWritePress,
}) => {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ← Back 버튼 */}
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconWrapper}>
            <BackIcon width={20} height={20} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        {/* 제목 */}
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
        </Text>

        {/* 오른쪽 버튼 (완료 또는 글쓰기) */}
        {showCompleteButton ? (
          <TouchableOpacity onPress={onCompletePress}>
            <Text style={styles.complete}>완료</Text>
          </TouchableOpacity>
        ) : showWriteButton ? (
          <TouchableOpacity onPress={onWritePress}>
            <Text style={styles.write}>글쓰기</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {
    marginHorizontal: 0,
  },
  container: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 6,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 32,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  complete: {
    fontSize: 16,
    color: '#408A21',
    fontWeight: '600',
    marginRight:15,
  },
  write: {
    fontSize: 16,
    color: '#408A21',
    fontWeight: '600',
    marginRight:15,
  },
});