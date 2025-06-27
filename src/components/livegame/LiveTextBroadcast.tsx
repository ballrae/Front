// src/components/livegame/LiveTextBroadcast.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { dummyInningPlayList } from '../../data/dummyInningPlay';
import { pitchTypeColorMap } from '../../constants/pitchTypeColorMap';

const LiveTextBroadcast = () => {
  const [selectedInning, setSelectedInning] = useState<number>(6);
  const allInnings = Array.from({ length: 9 }, (_, i) => i + 1);

  const inningData = dummyInningPlayList.find((data) => data.inning === selectedInning);

  return (
    <ScrollView style={styles.container}>
      {/* 문자중계 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>문자중계</Text>
      </View>

      {/* 회차 선택 탭 */}
      <View style={styles.inningTabs}>
        {allInnings.map((inning) => (
          <TouchableOpacity key={inning} onPress={() => setSelectedInning(inning)}>
            <Text style={[styles.inningTabText, selectedInning === inning && styles.selectedInning]}>
              {inning}회
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 회차 제목 */}
      <Text style={styles.title}>{selectedInning}회</Text>

      {/* 데이터 없을 경우 */}
      {!inningData ? (
        <Text style={styles.noticeText}>경기 중입니다.</Text>
      ) : (
        inningData.play_by_play.map((play, index) => (
          <View key={index} style={styles.playContainer}>
            <Image source={require('../../assets/dummy.png')} style={styles.avatar} />
            <View style={styles.infoBox}>
              <Text style={styles.batterName}>
                {play.batter} <Text style={styles.battingHand}>{play.batting_hand}</Text>
              </Text>

              <View style={styles.pitches}>
                {play.at_bat.map((pitch, i) => {
                  const isLast = i === play.at_bat.length - 1;
                  return (
                    <View key={i} style={styles.pitchRow}>
                      {/* 왼쪽: 투구 정보 */}
                      <View style={styles.leftColumn}>
                        <View style={[styles.pitchCircle, { backgroundColor: pitchTypeColorMap[pitch.type as keyof typeof pitchTypeColorMap] }]}>
                          <Text style={styles.pitchCircleText}>{pitch.type}</Text>
                        </View>
                        <Text style={styles.pitchText}>{`${pitch.pitch_num}구: ${pitch.pitch}`}</Text>
                      </View>

                      {/* 오른쪽: 결과 */}
                      {isLast && (
                        <View style={styles.rightColumn}>
                          <View style={[styles.pitchCircle, { backgroundColor: pitchTypeColorMap[play.final_result.code as keyof typeof pitchTypeColorMap] || '#ccc' }]}>
                            <Text style={styles.pitchCircleText}>{play.final_result.code}</Text>
                          </View>
                          <Text style={styles.resultText}>{play.final_result.description}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default LiveTextBroadcast;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  inningTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingLeft: 5, 
  },
  inningTabText: {
    fontSize: 13,
    color: '#000',
  },
  selectedInning: {
    fontWeight: 'bold',
    color: 'green',
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
     paddingLeft: 5, 
  },
  noticeText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  playContainer: {
    flexDirection: 'row',
    marginBottom: 24,
     paddingLeft: 5, 
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  infoBox: {
    flex: 1,
  },
  batterName: {
    fontSize: 15,
  },
  battingHand: {
    fontSize: 12,
    color: '#888',
  },
  pitches: {
    marginTop: 8,
  },
  pitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  leftColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexShrink: 0,        // ← 내용이 적다고 줄어들지 않도록
    minWidth: 0,        // ← 오른쪽 영역 최소 너비 설정
  },
  pitchCircle: {
    width: 18,
    height: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  pitchCircleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pitchText: {
    fontSize: 11,
  },
  resultText: {
    fontSize: 11,
     lineHeight: 20,
    fontWeight: '500',
    textAlign: 'left',
  },
});