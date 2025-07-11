import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import Header from '../components/Header';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';

type SettingScreenRouteProp = RouteProp<RootStackParamList, 'SettingsScreen'>;

const BROADCAST_SETTINGS = [
  { id: 'hit', label: '안타 이펙트' },
  { id: 'homeRun', label: '홈런 이펙트' },
  { id: 'strikeOut', label: '삼진 이펙트' },
  { id: 'cheer', label: '응원가 기본 재생' },
];

const NOTIFICATION_SETTINGS = [
  { id: 'all', label: '전체 알림 수신' },
  { section: '마이팀 알림' },
  { id: 'team_start', label: '마이팀 경기 시작 알림' },
  { id: 'team_score', label: '마이팀 득점 알림' },
  { id: 'team_hr', label: '마이팀 홈런 알림' },
  { id: 'team_hit', label: '마이팀 안타 알림' },
  { id: 'team_end', label: '마이팀 경기 종료 알림' },
  { section: '게시판 알림' },
  { id: 'like', label: '내 글에 좋아요 알림' },
  { id: 'comment', label: '내 글에 댓글 알림' },
  { id: 'reply', label: '내 댓글에 답글 알림' },
  { id: 'notice', label: '마이팀 공지 게시글 알림' },
];

const SettingsScreen = () => {
  const route = useRoute<SettingScreenRouteProp>();
  const navigation = useNavigation();
  const { type } = route.params;

  const settings = type === 'broadcast' ? BROADCAST_SETTINGS : NOTIFICATION_SETTINGS;
  const title = type === 'broadcast' ? '중계실 설정' : '알림 설정';

  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(
      settings.filter((s): s is { id: string; label: string } => 'id' in s).map((s) => [s.id, true])
    )
  );

  const toggleSwitch = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.container}>
      <Header title={title} showBackButton onBackPress={() => navigation.goBack()} />
      {settings.map((item, index) => {
        if ('section' in item) {
          return (
            <Text key={item.section} style={[styles.sectionTitle, index !== 1 && styles.sectionMargin]}>
              {item.section}
            </Text>
          );
        }

        const isFirst = item.id === 'all';

        // ✅ 조건에 맞게 위쪽 테두리 추가
        const needsTopBorder =
          (type === 'broadcast' && index === 0) ||
          (type === 'alarm' && ['team_start', 'like'].includes(item.id));

        return (
          <View
            key={item.id}
            style={[
              styles.row,
              isFirst && styles.noBorder,
              needsTopBorder && styles.topBorder,
            ]}
          >
            <Text style={[styles.label, isFirst && styles.bold]}>{item.label}</Text>
            <Switch
              value={toggles[item.id]}
              onValueChange={() => toggleSwitch(item.id)}
              trackColor={{ false: '#ccc', true: '#4cd964' }}
              thumbColor="#fff"
            />
          </View>
        );
      })}
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  topBorder: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  sectionMargin: {
    marginTop: 12,
  },
});