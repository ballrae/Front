// PlayerInfoBoard.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import teamSymbolMap from '../../constants/teamSymbols';
import axiosInstance from '../../utils/axiosInstance';

interface Props {
  pitcherPcode: string | null;
  batterPcode: string | null;
  pitcherName: string | null;
  batterName: string | null;
  homeTeam: string;
  awayTeam: string;
  currentHalf?: 'top' | 'bot';
}

const PlayerInfoBoard = ({
  pitcherPcode,
  batterPcode,
  pitcherName,
  batterName,
  homeTeam,
  awayTeam,
  currentHalf = 'top',
}: Props) => {
  const [pitchData, setPitchData] = useState<any[]>([]);
  const [battedBall, setBattedBall] = useState<{ left: number; center: number; right: number }>({
    left: 0,
    center: 0,
    right: 0,
  });
  const [pitcherStats, setPitcherStats] = useState<string[][]>([
    ['시즌', '-', '-', '-', '-', '-'],
    ['3시즌', '-', '-', '-', '-', '-'],
  ]);
  const [batterStats, setBatterStats] = useState<string[][]>([
    ['시즌', '-', '-', '-', '-', '-', '-'],
    ['3시즌', '-', '-', '-', '-', '-', '-'],
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!pitcherPcode || !batterPcode) return;
      try {
        const res = await axiosInstance.get(
          `/api/players/realtime/?pitcher=${pitcherPcode}&batter=${batterPcode}`,
        );
        const data = res.data?.data ?? {};

        const batterSeason = data?.batter?.season_2025 ?? {};
        const batterCareer = data?.batter?.career ?? {};
        const pitcherSeason = data?.pitcher?.season_2025 ?? {};
        const pitcherCareer = data?.pitcher?.career ?? {};

        setPitchData(data?.pitcher?.pitcher ?? []);
        setBattedBall(
          data?.batter?.batter ?? { left: 0, center: 0, right: 0 },
        );

        // 타자 시즌
        const batterStatsSeason: string[] = [
          '시즌',
          String(batterSeason.ab ?? 0),
          String(batterSeason.hits ?? 0),
          String(batterSeason.homeruns ?? 0),
          (batterSeason.obp ?? 0).toFixed(3),
          (batterSeason.avg ?? 0).toFixed(3),
        ];

        // 타자 커리어(최근 3개년)
        const batterStatsCareer: string[] = [
          '3시즌',
          String(batterCareer.ab ?? 0),
          String(batterCareer.hits ?? 0),
          String(batterCareer.homeruns ?? 0),
          (batterCareer.obp ?? 0).toFixed(3),
          (batterCareer.avg ?? 0).toFixed(3),
        ];

        // 투수 시즌
        const pitcherStatsSeason: string[] = [
          '시즌',
          String(pitcherSeason.games ?? 0),
          String(pitcherSeason.innings ?? 0),
          String(pitcherSeason.wins ?? 0),
          String(pitcherSeason.losses ?? 0),
          (pitcherSeason.era ?? 0).toFixed(2),
        ];

        // 투수 커리어(최근 3개년)
        const pitcherStatsCareer: string[] = [
          '3시즌',
          String(pitcherCareer.games ?? 0),
          String(pitcherCareer.innings ?? 0),
          String(pitcherCareer.wins ?? 0),
          String(pitcherCareer.losses ?? 0),
          (pitcherCareer.era ?? 0).toFixed(2),
        ];

        setBatterStats([batterStatsSeason, batterStatsCareer]);
        setPitcherStats([pitcherStatsSeason, pitcherStatsCareer]);
      } catch (err) {
        console.error('실시간 투타 정보 fetch 실패:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [pitcherPcode, batterPcode]);

  const topPitches = pitchData
    .filter((p) => p?.type && typeof p?.rate === 'number')
    .sort((a, b) => (b.rate as number) - (a.rate as number))
    .slice(0, 2);

  const directionMap = { left: '좌', center: '중', right: '우' } as const;
  const topDirectionKey = (Object.entries(battedBall) as [keyof typeof directionMap, number][])
    .reduce<[keyof typeof directionMap, number]>(
      (max, cur) => (cur[1] > max[1] ? cur : max),
      ['left', -Infinity],
    )[0];
  const topDirection = directionMap[topDirectionKey] ?? '-';

  const batterTeamId = currentHalf === 'top' ? awayTeam : homeTeam;
  const pitcherTeamId = currentHalf === 'top' ? homeTeam : awayTeam;

  const batterImage =
    teamSymbolMap[batterTeamId.toLowerCase()] ??
    require('../../assets/app_logos/ballrae_logo_green.png');
  const pitcherImage =
    teamSymbolMap[pitcherTeamId.toLowerCase()] ??
    require('../../assets/app_logos/ballrae_logo_green.png');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>투타정보</Text>

      {/* 투수 */}
      <View style={styles.section}>
        <Image source={pitcherImage} style={styles.playerImage} />
        <View style={styles.infoBox}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{String(pitcherName ?? '-')}</Text>
          </View>
          <Text style={styles.pitchCount}>-</Text>
          <Text style={styles.statLine}>
            이닝 <Text style={styles.statValue}>{String(0)}</Text> | 탈삼진{' '}
            <Text style={styles.statValue}>{String(0)}</Text> | 실점{' '}
            <Text style={styles.statValue}>{String(0)}</Text>
          </Text>
          <Text style={styles.statLine}>
            피안타 <Text style={styles.statValue}>{String(0)}</Text> | 투구수{' '}
            <Text style={styles.statValue}>{String(0)}</Text>
          </Text>
        </View>
        <View style={styles.extraBox}>
          <Text style={styles.extraTitle}>예상 구종</Text>
          {topPitches.length === 0 ? (
            <Text style={styles.extraContent}>-</Text>
          ) : (
            topPitches.map((p, i) => (
              <Text key={i} style={styles.extraContent} numberOfLines={1} adjustsFontSizeToFit>
                {String(p.type)}
              </Text>
            ))
          )}
        </View>
      </View>

      <StatsTable
        headers={['성적', '경기', '이닝', '승', '패', '평균자책점']}
        rows={pitcherStats}
      />

      {/* 타자 */}
      <View style={styles.section}>
        <Image source={batterImage} style={styles.playerImage} />
        <View style={styles.infoBox}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{String(batterName ?? '-')}</Text>
          </View>
          <Text style={styles.pitchCount}>-</Text>
          <Text style={styles.statLine}>
            타석 <Text style={styles.statValue}>{String(0)}</Text> | 타수{' '}
            <Text style={styles.statValue}>{String(0)}</Text> | 안타{' '}
            <Text style={styles.statValue}>{String(0)}</Text> | 득점{' '}
            <Text style={styles.statValue}>{String(0)}</Text>
          </Text>
          <Text style={styles.statLine}>
            타점 <Text style={styles.statValue}>{String(0)}</Text> | 홈런{' '}
            <Text style={styles.statValue}>{String(0)}</Text> | 볼넷{' '}
            <Text style={styles.statValue}>{String(0)}</Text> | 삼진{' '}
            <Text style={styles.statValue}>{String(0)}</Text>
          </Text>
        </View>
        <View style={styles.extraBox}>
          <Text style={styles.extraTitle}>예상 타구</Text>
          <Text style={styles.extraContent}>{String(topDirection)}</Text>
        </View>
      </View>

      <StatsTable
        headers={['성적', '타수', '안타', '홈런', '출루율', '타율']}
        rows={batterStats}
      />
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

export default PlayerInfoBoard;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  section: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  playerImage: { width: 50, height: 50, resizeMode: 'contain', marginRight: 10 },
  infoBox: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  playerName: { fontSize: 16, fontWeight: '500', marginRight: 8, marginBottom: 8 },
  pitchCount: { fontSize: 13, color: '#575757', marginBottom: 10 },
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