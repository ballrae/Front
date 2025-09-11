// PlayerInfoBoard.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, AppState, AppStateStatus, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import teamSymbolMap from '../../constants/teamSymbols';
import axiosInstance from '../../utils/axiosInstance';
import { RootStackParamList } from '../../navigation/RootStackParamList';

interface Props {
  pitcherPcode: string | null;
  batterPcode: string | null;
  pitcherName: string | null;
  batterName: string | null;
  homeTeam: string;
  awayTeam: string;
  currentHalf?: 'top' | 'bot';
  onPitchCountUpdate?: (count: number) => void;
}

const PlayerInfoBoard = ({
  pitcherPcode,
  batterPcode,
  pitcherName,
  batterName,
  homeTeam,
  awayTeam,
  currentHalf = 'top',
  onPitchCountUpdate,
}: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // pcode를 id로 변환하는 함수
  const getPlayerIdFromPcode = useCallback(async (pcode: string, isPitcher: boolean) => {
    try {
      const endpoint = isPitcher ? '/api/players/pitcher/' : '/api/players/batter/';
      const res = await axiosInstance.get(endpoint, {
        params: { pcode: pcode }
      });
      return res.data.data?.player?.id;
    } catch (error) {
      console.error('선수 ID 조회 실패:', error);
      return null;
    }
  }, []);

  const [pitchData, setPitchData] = useState<any[]>([]);
  const [battedBall, setBattedBall] = useState({ left: 0, center: 0, right: 0 });
  const [pitcherStats, setPitcherStats] = useState<string[][]>([
    ['시즌', '-', '-', '-', '-', '-'],
    ['3시즌', '-', '-', '-', '-', '-'],
  ]);
  const [batterStats, setBatterStats] = useState<string[][]>([
    ['시즌', '-', '-', '-', '-', '-'],
    ['3시즌', '-', '-', '-', '-', '-'],
  ]);

  const [pitcherToday, setPitcherToday] = useState({
    pitches: 0,
    runs: 0,
    innings: 0,
    hits: 0,
    strikeouts: 0,
  });
  const [batterToday, setBatterToday] = useState({
    pa: 0,
    ab: 0,
    hits: 0,
    homeruns: 0,
    bb: 0,
    strikeouts: 0,
  });

  const fetchData = useCallback(async () => {
    if (!pitcherPcode || !batterPcode) return;
    try {
      const res = await axiosInstance.get(
        `/api/players/realtime/?pitcher=${pitcherPcode}&batter=${batterPcode}`,
      );
      const data = res.data?.data ?? {};

      setPitchData(data?.pitcher?.pitcher ?? []);
      setBattedBall(data?.batter?.batter ?? { left: 0, center: 0, right: 0 });
      const nextPitcherToday = data?.pitcher?.today ?? pitcherToday;
      setPitcherToday(nextPitcherToday);
      if (typeof nextPitcherToday?.pitches === 'number' && onPitchCountUpdate) {
        onPitchCountUpdate(Number(nextPitcherToday.pitches));
      }
      setBatterToday(data?.batter?.today ?? batterToday);

      const batterSeason = data?.batter?.season_2025 ?? {};
      const batterCareer = data?.batter?.career ?? {};
      const pitcherSeason = data?.pitcher?.season_2025 ?? {};
      const pitcherCareer = data?.pitcher?.career ?? {};

      const batterSeasonRow = [
        '시즌',
        String(batterSeason.ab ?? 0),
        String(batterSeason.hits ?? 0),
        String(batterSeason.homeruns ?? 0),
        (batterSeason.obp ?? 0).toFixed(3),
        (batterSeason.avg ?? 0).toFixed(3),
      ];
      const batterCareerRow = [
        '3시즌',
        String(batterCareer.ab ?? 0),
        String(batterCareer.hits ?? 0),
        String(batterCareer.homeruns ?? 0),
        (batterCareer.obp ?? 0).toFixed(3),
        (batterCareer.avg ?? 0).toFixed(3),
      ];
      const pitcherSeasonRow = [
        '시즌',
        String(pitcherSeason.games ?? 0),
        String(pitcherSeason.innings ?? 0),
        '-',
        '-',
        (pitcherSeason.era ?? 0).toFixed(2),
      ];
      const pitcherCareerRow = [
        '3시즌',
        String(pitcherCareer.games ?? 0),
        String(pitcherCareer.innings ?? 0),
        '-',
        '-',
        (pitcherCareer.era ?? 0).toFixed(2),
      ];

      setBatterStats([batterSeasonRow, batterCareerRow]);
      setPitcherStats([pitcherSeasonRow, pitcherCareerRow]);
    } catch (err) {
      console.error('실시간 투타 정보 fetch 실패:', err);
    }
  }, [pitcherPcode, batterPcode]);

  useEffect(() => {
    if (!pitcherPcode || !batterPcode) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let currentState: AppStateStatus = AppState.currentState;

    const start = () => {
      fetchData();
      intervalId = setInterval(fetchData, 20000);
    };

    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const onChange = (next: AppStateStatus) => {
      if (currentState.match(/inactive|background/) && next === 'active') {
        start();
      } else if (next.match(/inactive|background/)) {
        stop();
      }
      currentState = next;
    };

    const sub = AppState.addEventListener('change', onChange);
    start();

    return () => {
      sub.remove();
      stop();
    };
  }, [pitcherPcode, batterPcode, fetchData]);

  const topPitches = pitchData
    .filter((p) => p?.type && typeof p?.rate === 'number')
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 2);

  const directionMap = { left: '좌', center: '중', right: '우' } as const;
  const topDirectionKey = (Object.entries(battedBall) as [keyof typeof directionMap, number][])
    .reduce((max, cur) => (cur[1] > max[1] ? cur : max), ['left', -Infinity])[0];
  const topDirection = directionMap[topDirectionKey] ?? '-';

  const batterTeamId = currentHalf === 'top' ? awayTeam : homeTeam;
  const pitcherTeamId = currentHalf === 'top' ? homeTeam : awayTeam;

  const batterImage = teamSymbolMap[batterTeamId.toLowerCase()];
  const pitcherImage = teamSymbolMap[pitcherTeamId.toLowerCase()];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>투타정보</Text>

      {/* 투수 */}
      <TouchableOpacity 
        style={styles.section}
        onPress={async () => {
          if (pitcherPcode) {
            const playerId = await getPlayerIdFromPcode(pitcherPcode, true);
            if (playerId) {
              navigation.navigate('PitcherDetailScreen', { playerId: playerId });
            } else {
              console.error('투수 ID를 찾을 수 없습니다:', pitcherPcode);
            }
          }
        }}
        disabled={!pitcherPcode}
      >
        <Image source={pitcherImage} style={styles.playerImage} />
        <View style={styles.infoBox}>
          <Text style={styles.playerName}>{pitcherName ?? '-'}</Text>
          <Text style={styles.pitchCount}>{Number(pitcherToday.pitches) || 0}구</Text>
          <Text style={styles.statLine}>
            이닝 <Text style={styles.statValue}>{pitcherToday.innings}</Text> | 탈삼진{' '}
            <Text style={styles.statValue}>{pitcherToday.strikeouts}</Text> | 실점{' '}
            <Text style={styles.statValue}>{pitcherToday.runs}</Text>
          </Text>
          <Text style={styles.statLine}>
            피안타 <Text style={styles.statValue}>{pitcherToday.hits}</Text> | 투구수{' '}
            <Text style={styles.statValue}>{pitcherToday.pitches}</Text>
          </Text>
        </View>
        <View style={styles.extraBox}>
          <Text style={styles.extraTitle}>예상 구종</Text>
          {topPitches.length > 0 ? (
            topPitches.map((p, idx) => (
              <Text key={idx} style={styles.extraContent}>
                {p.type}
              </Text>
            ))
          ) : (
            <Text style={styles.extraContent}>-</Text>
          )}
        </View>
      </TouchableOpacity>

      <StatsTable headers={['성적', '경기', '이닝', '승', '패', '평균자책점']} rows={pitcherStats} />

      {/* 타자 */}
      <TouchableOpacity 
        style={styles.section}
        onPress={async () => {
          if (batterPcode) {
            const playerId = await getPlayerIdFromPcode(batterPcode, false);
            if (playerId) {
              navigation.navigate('BatterDetailScreen', { playerId: playerId });
            } else {
              console.error('타자 ID를 찾을 수 없습니다:', batterPcode);
            }
          }
        }}
        disabled={!batterPcode}
      >
        <Image source={batterImage} style={styles.playerImage} />
        <View style={styles.infoBox}>
          <Text style={styles.playerName}>{batterName ?? '-'}</Text>
          <Text style={styles.pitchCount}>{Number(batterToday.ab) || 0}타수 {Number(batterToday.hits) || 0}안타 </Text>
          <Text style={styles.statLine}>
            타석 <Text style={styles.statValue}>{batterToday.pa}</Text> | 타수{' '}
            <Text style={styles.statValue}>{batterToday.ab}</Text> | 안타{' '}
            <Text style={styles.statValue}>{batterToday.hits}</Text>
          </Text>
          <Text style={styles.statLine}>
            홈런 <Text style={styles.statValue}>{batterToday.homeruns}</Text> | 볼넷{' '}
            <Text style={styles.statValue}>{batterToday.bb}</Text> | 피삼진{' '}
            <Text style={styles.statValue}>{batterToday.strikeouts}</Text>
          </Text>
        </View>
        <View style={styles.extraBox}>
          <Text style={styles.extraTitle}>예상 타구</Text>
          <Text style={styles.extraContent}>{topDirection}</Text>
        </View>
      </TouchableOpacity>

      <StatsTable headers={['성적', '타수', '안타', '홈런', '출루율', '타율']} rows={batterStats} />
    </ScrollView>
  );
};

const StatsTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <View style={[styles.tableWrapper, { minHeight: 90 }]}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableRow}>
          {headers.map((h, i) => (
            <View key={i} style={[styles.cellWrapper, styles.headerCell]}>
              <Text style={[styles.cellText, styles.headerText]} numberOfLines={2} adjustsFontSizeToFit>
                {String(h)}
              </Text>
            </View>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.tableRow}>
            {row.map((cell, ci) => (
              <View key={ci} style={styles.cellWrapper}>
                <Text style={styles.cellText} numberOfLines={1} adjustsFontSizeToFit>
                  {String(cell)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  section: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  playerImage: { width: 50, height: 50, resizeMode: 'contain', marginRight: 10 },
  infoBox: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  pitchCount: { fontSize: 13, color: '#575757', marginBottom: 10, fontWeight: 500 },
  statLine: { fontSize: 12, color: '#A5A5A5', marginBottom: 2 },
  statValue: { fontWeight: '600', color: '#A5A5A5' },
  extraBox: {
    backgroundColor: '#e6f4e5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 80,
  },
  extraTitle: { fontWeight: 'bold', fontSize: 13, color: '#2E7D32', textAlign: 'center' },
  extraContent: { fontSize: 13, color: '#2E7D32', marginTop: 4, textAlign: 'center', lineHeight: 18 },
  tableWrapper: {
    marginBottom: 35,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  cellWrapper: {
    minWidth: 65,
    minHeight: 35,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 16,
    includeFontPadding: false,
  },
  headerCell: { backgroundColor: '#d8ebd3' },
  headerText: { fontWeight: 'bold' },
});

export default PlayerInfoBoard;