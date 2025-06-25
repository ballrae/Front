// LiveGameScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import Header from '../components/Header';
import teamLogoMap from '../constants/teamLogos';
import FieldStatusBoard from '../components/FieldStatusBoard';


const innings = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const dummyInningPlay = {
  inning: 6,
  play_by_play: [
    {
      batter: '양석환',
      batting_hand: '우타',
      at_bat: [
        { pitch_num: 1, type: 'S', pitch: '직구' },
        { pitch_num: 2, type: 'S', pitch: '슬라이더' },
        { pitch_num: 3, type: 'B', pitch: '체인지업' },
        { pitch_num: 4, type: 'S', pitch: '직구' },
      ],
      final_result: {
        code: 'K',
        description: '루킹 스트라이크 아웃',
      },
    },
    {
      batter: '강승호',
      batting_hand: '우타',
      at_bat: [
        { pitch_num: 1, type: 'B', pitch: '직구' },
        { pitch_num: 2, type: 'S', pitch: '직구' },
        { pitch_num: 3, type: 'S', pitch: '슬라이더' },
        { pitch_num: 4, type: 'F', pitch: '커브' },
      ],
      final_result: {
        code: 'K',
        description: '루킹 스트라이크 아웃',
      },
    },
    {
      batter: '양의지',
      batting_hand: '우타',
      at_bat: [
        { pitch_num: 1, type: 'S', pitch: '직구' },
        { pitch_num: 2, type: 'F', pitch: '슬라이더' },
      ],
      final_result: {
        code: 'G',
        description: '1루수 땅볼',
      },
    },
  ],
};

const LiveGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'LiveGameScreen'>>();
  const navigation = useNavigation();
  const { gameId, homeTeamName, awayTeamName } = route.params;

  const homeTeamId = homeTeamName.split(' ')[0];
  const awayTeamId = awayTeamName.split(' ')[0];

  const [selectedInning, setSelectedInning] = useState(6);

  return (
    
    <View style={styles.container}>
       <View style={{ marginHorizontal: -16 }}>
      <Header
        title={`${homeTeamName.split(' ')[0]} vs ${awayTeamName.split(' ')[0]}`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      </View>

      <View style={{ marginHorizontal: -16 }}>
        <FieldStatusBoard />
      </View>
       
      {/* 스코어 */}
      <View style={styles.scoreBoxFull}>
        <Image source={teamLogoMap[homeTeamId]} style={styles.logo} />
        <View style={styles.teamBlock}>
          <Text style={styles.teamLabel}>{homeTeamName.split(' ')[0]}</Text>
          <Text style={styles.teamLabel}>{homeTeamName.split(' ')[1]}</Text>
        </View>
        <View style={styles.scoreSet}>
          <Text style={styles.inningText}>6회 초</Text>
          <View style={styles.scoreNumbers}>
            <Text style={styles.score}>1</Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={styles.score}>4</Text>
          </View>
        </View>
        <View style={styles.teamBlock}>
          <Text style={styles.teamLabel}>{awayTeamName.split(' ')[0]}</Text>
          <Text style={styles.teamLabel}>{awayTeamName.split(' ')[1]}</Text>
        </View>
        <Image source={teamLogoMap[awayTeamId]} style={styles.logo} />
      </View>

     

      {/* 회차 탭 */}
      <View style={styles.inningTabs}>
        {innings.map((num) => (
          <TouchableOpacity key={num} onPress={() => setSelectedInning(num)}>
            <Text style={[styles.inningTabText, selectedInning === num && styles.selectedTab]}>
              {num}회
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 중계 */}
      <Text style={styles.inningTitle}>{selectedInning}회</Text>
      <FlatList
        data={dummyInningPlay.play_by_play}
        keyExtractor={(item, index) => `${item.batter}_${index}`}
        renderItem={({ item }) => (
          <View style={styles.playRow}>
            <Image
              source={require('../assets/app_logos/ballrae_logo_white.png')}
              style={styles.playerImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.batterName}>{item.batter} ({item.batting_hand})</Text>
              {item.at_bat.map((p) => (
                <Text key={p.pitch_num} style={styles.pitchText}>
                  {p.pitch_num}구 {p.pitch}
                </Text>
              ))}
              <Text style={styles.resultText}>⚾ {item.final_result.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default LiveGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  teamBlock: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  teamLabel: {
    fontSize: 12,
  },
  scoreBoxFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  scoreSet: {
    alignItems: 'center',
  },
  scoreNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft:5,
    marginRight:5,
  },
  inningText: {
    fontSize: 14,
    marginBottom: 4,
  },
  inningTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inningTabText: {
    fontSize: 14,
    color: '#888',
  },
  selectedTab: {
    fontWeight: 'bold',
    color: '#408A21',
    textDecorationLine: 'underline',
  },
  inningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  playerImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 24,
  },
  batterName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pitchText: {
    fontSize: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    marginTop: 4,
  },
});