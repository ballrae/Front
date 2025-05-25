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
        <Text style={styles.title}>{title}</Text>

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
    marginRight:15,
    marginLeft:2,
  },
  container: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    padding: 6,
  },
  iconPlaceholder: {
    width: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600', // 세미볼드
    textAlign: 'center',
  },
  complete: {
    fontSize: 16,
    color: '#408A21',
    fontWeight: '600',
  },
  write: {
    fontSize: 16,
    color: '#408A21',
    fontWeight: '600',
  },
});