import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import LogoHeader from '../components/LogoHeader';
import teamLogoMap from '../constants/teamLogos';

// 네비게이션
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

const dummyGames = [
  {
    id: '1',
    homeTeam: 'LG',
    awayTeam: 'OB',
    homeTeamName: 'LG 트윈스',
    awayTeamName: '두산 베어스',
    homeScore: 1,
    awayScore: 4,
    stadium: '잠실야구장',
    status: 'LIVE',
  },
  {
    id: '2',
    homeTeam: 'HT',
    awayTeam: 'WO',
    homeTeamName: 'KIA 타이거즈',
    awayTeamName: '키움 히어로즈',
    homeScore: 13,
    awayScore: 1,
    stadium: '고척스카이돔',
    status: 'LIVE',
  },
  {
    id: '3',
    homeTeam: 'SK',
    awayTeam: 'LT',
    homeTeamName: 'SSG 랜더스',
    awayTeamName: '롯데 자이언츠',
    homeScore: 1,
    awayScore: 7,
    stadium: '사직야구장',
    status: 'DONE',
  },
  {
    id: '4',
    homeTeam: 'SS',
    awayTeam: 'HH',
    homeTeamName: '삼성 라이온즈',
    awayTeamName: '한화 이글스',
    homeScore: 1,
    awayScore: 3,
    stadium: '대전 한화생명 볼파크',
    status: 'DONE',
  },
  {
    id: '5',
    homeTeam: 'NC',
    awayTeam: 'KT',
    homeTeamName: 'NC 다이노스',
    awayTeamName: 'KT 위즈',
    homeScore: 0,
    awayScore: 0,
    stadium: '수원 케이티위즈 파크',
    status: 'SCHEDULED',
  },
];

const statusStyleMap: { [key: string]: string } = {
  LIVE: '#408A21',
  DONE: '#92C17D',
  SCHEDULED: '#7C7C7C',
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'LiveGameScreen'>>();

  return (
    <View style={styles.container}>
      <LogoHeader title="최근 경기" />
      <FlatList
        data={dummyGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('LiveGameScreen', {
                gameId: item.id,
                homeTeamName: item.homeTeamName,
                awayTeamName: item.awayTeamName,
              })
            }
          >
            <View style={styles.row}>
              {/* Home Team */}
              <View style={styles.teamLeft}>
                <Image source={teamLogoMap[item.homeTeam]} style={styles.logo} />
                <View style={styles.teamTextBoxLeft}>
                  <Text style={styles.teamTextLine}>{item.homeTeamName.split(' ')[0]}</Text>
                  <Text style={styles.teamTextLine}>{item.homeTeamName.split(' ')[1]}</Text>
                </View>
              </View>

              {/* Center (score + stadium + status) */}
              <View style={styles.center}>
                <Text style={styles.stadium}>{item.stadium}</Text>
                <View style={styles.scoreBox}>
                  <Text style={styles.score}>{item.homeScore}</Text>
                  <Text style={styles.vs}>vs</Text>
                  <Text style={styles.score}>{item.awayScore}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: statusStyleMap[item.status] }]}>
                  <Text style={styles.statusText}>
                    {item.status === 'LIVE'
                      ? 'Live'
                      : item.status === 'DONE'
                      ? '종료'
                      : '17:00'}
                  </Text>
                </View>
              </View>

              {/* Away Team */}
              <View style={styles.teamRight}>
                <View style={styles.teamTextBoxRight}>
                  <Text style={styles.teamTextLine}>{item.awayTeamName.split(' ')[0]}</Text>
                  <Text style={styles.teamTextLine}>{item.awayTeamName.split(' ')[1]}</Text>
                </View>
                <Image source={teamLogoMap[item.awayTeam]} style={styles.logo} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  card: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  teamTextBoxLeft: {
    marginLeft: 8,
  },
  teamTextBoxRight: {
    marginRight: 8,
    alignItems: 'flex-end',
  },
  teamTextLine: {
    fontSize: 13,
    lineHeight: 18,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  center: {
    flex: 1.5,
    alignItems: 'center',
  },
  stadium: {
    fontSize: 12,
    color: '#000',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  vs: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    marginRight: 10,
  },
  statusTag: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});