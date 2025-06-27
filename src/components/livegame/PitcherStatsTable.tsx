import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const dummyData = {
  pitcher: {
    name: '송승기',
    hand: '좌투좌타',
    number: 13,
    pitchCount: 87,
    inning: '6.1',
    strikeouts: 4,
    runs: 4,
    hits: 6,
    pitchDetail: '87 (S 49 + B 38)',
    seasonStats: ['10', '5', '3', '0', '57.1', '55', '20', '2.83'],
    careerStats: ['18', '5', '4', '0', '66.2', '65', '27', '3.11'],
    expectedPitch: '슬라이더\n체인지업',
  },
  batter: {
    name: '양의지',
    order: '5번타자',
    hand: '우타',
    number: 25,
    result: '3타수 2안타',
    detail: {
      plate: 3,
      at_bat: 3,
      hits: 2,
      score: 1,
      rbi: 2,
      hr: 1,
      bb: 0,
      so: 0,
    },
    seasonStats: ['205', '57', '6', '33', '0.413', '0.326'],
    careerStats: ['6,984', '1,872', '268', '1,139', '0.390', '0.308'],
    expectedDirection: '좌, 좌중',
  },
};

const PitcherBatterInfo = () => {
  const { pitcher, batter } = dummyData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>투타정보</Text>

      {/* 투수 */}
      <View style={styles.section}>
        <Image source={require('../../assets/dummy.png')} style={styles.playerImage} />
        <View style={styles.infoBox}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{pitcher.name}</Text>
            <Text style={styles.playerSubInfo}>{pitcher.hand}  No. {pitcher.number}</Text>
          </View>
          <Text style={styles.pitchCount}>{pitcher.pitchCount}구</Text>
          <Text style={styles.statLine}>이닝 <Text style={styles.statValue}>{pitcher.inning}</Text>  |  탈삼진 <Text style={styles.statValue}>{pitcher.strikeouts}</Text>  |  실점 <Text style={styles.statValue}>{pitcher.runs}</Text></Text>
          <Text style={styles.statLine}>피안타 <Text style={styles.statValue}>{pitcher.hits}</Text>  |  투구수 <Text style={styles.statValue}>{pitcher.pitchDetail}</Text></Text>
        </View>
      </View>

      <StatsTable
        headers={['성적', '경기', '승', '패', '세이브', '이닝', '삼진', '볼넷', '평균자책점', '예상구종']}
        rows={[
          ['시즌', ...pitcher.seasonStats],
          ['통산', ...pitcher.careerStats],
        ]}
        extraCell={pitcher.expectedPitch}
      />

      {/* 타자 */}
      <View style={styles.section}>
        <Image source={require('../../assets/dummy.png')} style={styles.playerImage} />
        <View style={styles.infoBox}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{batter.name}</Text>
            <Text style={styles.playerSubInfo}>{batter.order} ({batter.hand})  No. {batter.number}</Text>
          </View>
          <Text style={styles.pitchCount}>{batter.result}</Text>
          <Text style={styles.statLine}>타석 {batter.detail.plate} | 타수 {batter.detail.at_bat} | 안타 {batter.detail.hits} | 득점 {batter.detail.score}</Text>
          <Text style={styles.statLine}>타점 {batter.detail.rbi} | 홈런 {batter.detail.hr} | 볼넷 {batter.detail.bb} | 삼진 {batter.detail.so}</Text>
        </View>
      </View>

      <StatsTable
        headers={['성적', '타수', '안타', '홈런', '타점', '출루율', '타율', '예상 타구방향']}
        rows={[
          ['시즌', ...batter.seasonStats],
          ['통산', ...batter.careerStats],
        ]}
        extraCell={batter.expectedDirection}
      />
    </ScrollView>
  );
};

const StatsTable = ({ headers, rows, extraCell }: { headers: string[]; rows: string[][]; extraCell: string }) => (
  <View style={styles.tableWrapper}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableRow}>
          {headers.map((h, i) => (
            <Text key={i} style={[styles.cell, styles.headerCell, i === headers.length - 1 && styles.lastHeader]}>{h}</Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.tableRow}>
            {row.map((cell, ci) => (
              <Text key={ci} style={[styles.cell, ci === headers.length - 2 && ri === 0 && styles.withExtraPadding]}>{cell}</Text>
            ))}
            {ri === 0 && (
              <Text
                style={[styles.cell, { lineHeight: 16 }, styles.lastHeader]}
              >
                {extraCell}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

export default PitcherBatterInfo;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 12,
  },
  infoBox: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
  },
  playerSubInfo: {
    fontSize: 14,
    color: '#555',
  },
  pitchCount: {
    fontSize: 15,
    color: '#575757',
    marginBottom: 4,
  },
  statLine: {
    fontSize: 13,
    color: '#A5A5A5',
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '600',
    color: '#A5A5A5',
  },
  tableWrapper: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  cell: {
    minWidth: 50,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 12,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    color: '#2E7D32',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#d8ebd3',
  },
  lastHeader: {
    borderRightWidth: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  withExtraPadding: {
    paddingRight: 12,
  },
});