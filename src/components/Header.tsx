import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
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
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showCompleteButton = false,
  onCompletePress,
}) => {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingHorizontal: width * 0.04 }]}>
        {/* Back 버튼 */}
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconWrapper}>
            <BackIcon width={20} height={20} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        {/* 제목 */}
        <Text style={styles.title}>{title}</Text>

        {/* 완료 버튼 */}
        {showCompleteButton ? (
          <TouchableOpacity onPress={onCompletePress}>
            <Text style={styles.complete}>완료</Text>
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
    backgroundColor: '#fff',
  },
  container: {
    height:  20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    padding: 6,
  },
  iconPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  complete: {
    fontSize: 16,
    color: '#408A21',
    fontWeight: '600',
  },
});