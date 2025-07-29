import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, Pressable
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';


// 달력
import { Calendar } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';


import LogoHeader from '../components/LogoHeader';
import FadeInView from '../components/FadeInView';

// mapping
import teamNameMap from '../constants/teamNames';
import teamLogoMap from '../constants/teamLogos';

const statusStyleMap: { [key: string]: string } = {
  LIVE: '#408A21',
  DONE: '#92C17D',
  SCHEDULED: '#7C7C7C',
};

const getTodayDateStr = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  stadium: string;
  status: 'LIVE' | 'DONE' | 'SCHEDULED';
  startTime?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [games, setGames] = useState<Game[]>([]);

  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [showCalendar, setShowCalendar] = useState(false);

useEffect(() => {
  const fetchGames = async () => {
    try {
      const res = await fetch(`http://3.237.44.38:8000/api/games/gamelist/${selectedDate}`);
      const json = await res.json();

      if (json.status === 'OK') {
        const parsedGames = json.data.map((item: any) => {
          const [awayScore, homeScore] =
            typeof item.score === 'string' && item.score.includes(':')
              ? item.score.split(':').map(Number)
              : [null, null];

          return {
            id: item.id,
            homeTeam: item.home_team,
            awayTeam: item.away_team,
            homeTeamName: teamNameMap[item.home_team],
            awayTeamName: teamNameMap[item.away_team],
            homeScore,
            awayScore,
            stadium: item.stadium ?? '',
            status: (item.status ?? '').toUpperCase(),
            startTime: item.date ? format(new Date(item.date), 'HH:mm') : undefined,
          };
        });

        setGames(parsedGames);
      }
    } catch (err) {
      console.error('경기 데이터 불러오기 실패:', err);
    }
  };

  fetchGames();
}, [selectedDate]); // <- 여기를 수정

  return (
    <FadeInView style={styles.container}>
      <TouchableOpacity onPress={() => setShowCalendar(true)}>
  <LogoHeader title="최근 경기" />
    </TouchableOpacity>

    <Modal
      visible={showCalendar}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              const formatted = day.dateString.replace(/-/g, '');
              setSelectedDate(formatted);
              setShowCalendar(false);
            }}

            markedDates={{
              [selectedDate.slice(0, 4) + '-' + selectedDate.slice(4, 6) + '-' + selectedDate.slice(6, 8)]: {
                selected: true,
                selectedColor: '#408A21',
              },
            }}
            theme={{
              arrowColor: '#408A21', // 화살표 색상 (초록색)
              todayTextColor: '#FF4D4D', // 오늘 날짜 텍스트 색상 (빨간색)
              textDayFontWeight: 'bold',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
          />
        </View>
      </View>
    </Modal>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LiveGameScreen', {
              gameId: item.id,
              homeTeamName: item.homeTeamName,
              awayTeamName: item.awayTeamName,
              homeScore:item.homeScore ?? 0,
              awayScore:item.awayScore ?? 0,
              status:item.status,
            })}
          >
            <View style={styles.row}>
              {/* 왼쪽: away */}
              <View style={styles.teamLeft}>
                <Image source={teamLogoMap[item.awayTeam]} style={styles.logo} />
                <View style={styles.teamTextBoxLeft}>
                  <Text style={styles.teamTextLine}>{item.awayTeamName.split(' ')[0]}</Text>
                  <Text style={styles.teamTextLine}>{item.awayTeamName.split(' ')[1]}</Text>
                </View>
              </View>

              {/* Center */}
              <View style={styles.center}>
                <Text style={styles.stadium}>{item.stadium}</Text>
                <View style={styles.scoreBox}>
                  <Text style={styles.score}>
                    {item.awayScore !== null ? item.awayScore : '0'}
                  </Text>
                  <Text style={styles.vs}>vs</Text>
                  <Text style={styles.score}>
                    {item.homeScore !== null ? item.homeScore : '0'}
                  </Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: statusStyleMap[item.status] }]}>
                  <Text style={styles.statusText}>
                  {item.status === 'LIVE' && 'Live'}
                  {item.status === 'DONE' && '종료'}
                  {item.status === 'SCHEDULED' && (item.startTime ?? '예정')}
                </Text>
                </View>
              </View>

              {/* 오른쪽: home */}
              <View style={styles.teamRight}>
                <View style={styles.teamTextBoxRight}>
                  <Text style={styles.teamTextLine}>{item.homeTeamName.split(' ')[0]}</Text>
                  <Text style={styles.teamTextLine}>{item.homeTeamName.split(' ')[1]}</Text>
                </View>
                <Image source={teamLogoMap[item.homeTeam]} style={styles.logo} />
              </View>
 
            </View>
          </TouchableOpacity>
        )}
      />
    </FadeInView>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom:20,
    borderRadius: 12,
    width: '90%',
    elevation: 5,
  },
});