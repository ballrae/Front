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
    pitchTypes: '슬라이더\n체인지업',
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
    battedBall: '좌, 좌중',
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
          ['시즌', ...pitcher.seasonStats, pitcher.pitchTypes],
          ['통산', ...pitcher.careerStats],
        ]}
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
          ['시즌', ...batter.seasonStats, batter.battedBall],
          ['통산', ...batter.careerStats],
        ]}
      />
    </ScrollView>
  );
};

const StatsTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <View style={styles.tableWrapper}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableRow}>
          {headers.map((h, i) => (
            <View key={i} style={[styles.cellWrapper, styles.headerCell, i === headers.length - 1 && styles.lastCell]}>
              <Text style={[styles.cellText, styles.headerText]}>{h}</Text>
            </View>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.tableRow}>
            {row.map((cell, ci) => (
              <View
                key={ci}
                style={[
                  styles.cellWrapper,
                  ci === 0 && styles.leftCell,
                  ci === row.length - 1 && styles.lastCell,
                  ri === 1 && ci === row.length - 1 && styles.emptyBottomCell
                ]}>
                <Text style={styles.cellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

export default PitcherBatterInfo;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
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
    marginBottom: 35,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellWrapper: {
    minWidth: 65,
    minHeight: 35, 
    paddingHorizontal: 4,
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
  },
  headerCell: {
    backgroundColor: '#d8ebd3',
  },
  headerText: {
    fontWeight: 'bold',
  },
  leftCell: {
    borderLeftWidth: 0,
  },
  lastCell: {
    borderRightWidth: 0,
  },
  emptyBottomCell: {
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#ccc',
  },
});