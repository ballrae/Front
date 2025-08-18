// LiveTextBroadcast.tsx (수정됨)
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { pitchResultColorMap, pitchResultTextToCodeMap } from '../../constants/pitchResultMaps';
import teamSymbolMap from '../../constants/teamSymbols';
import axiosInstance from '../../utils/axiosInstance';
import mainResultColorMap from '../../constants/mainresultCodeMap';
import { mainresultCodeMap } from '../../constants/mainresultCodeMap';

type LiveTextBroadcastProps = {
  gameId: string;
  selectedInning: number;
  setSelectedInning: React.Dispatch<React.SetStateAction<number>>;
  homeTeam: string;
  awayTeam: string;
  setPitcherId?: (id: number) => void;
  setBatterId?: (id: number) => void;
};

const LiveTextBroadcast = ({ gameId, selectedInning, setSelectedInning, homeTeam, awayTeam , setPitcherId, setBatterId}: LiveTextBroadcastProps) => {
  const [topData, setTopData] = useState<any[]>([]);
  const [botData, setBotData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'OK_REALTIME' | 'OK_ARCHIVED' | 'scheduled'>('scheduled');

  const scrollRef = useRef<ScrollView>(null);
  const allInnings = Array.from({ length: 9 }, (_, i) => i + 1);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchInningData = async () => {
      setError(null);
      try {
        const res = await axiosInstance.get(`/api/games/${gameId}/relay/${selectedInning}/`);
        const raw = res.data;

        const isRealtime = raw.status === 'OK_REALTIME';
        setStatus(raw.status);

        const topAtBats = raw.data?.top?.atbats || [];
        const botAtBats = raw.data?.bot?.atbats || [];

        const mapAtBats = (atbats: any[]) =>
          atbats.map((ab: any) => {
            const pitches = isRealtime ? ab.pitch_sequence : ab.pitches;
            return {
              batter: isRealtime ? ab.actual_batter : ab.actual_player,
              batting_hand: ab.batting_hand || '',
              at_bat: (pitches || []).map((p: any) => ({
                pitch_num: p.pitch_num,
                type: p.pitch_result || '',
                pitch: p.pitch_type || '',
                velocity: p.speed,
                event: p.event,
              })),
              final_result: {
                code: mainresultCodeMap(ab.main_result || '') as 'B' | 'H' | 'O' | 'X',
                description: ab.main_result || '',
              },
              full_result: ab.full_result || '',
            };
          });

        setTopData(mapAtBats(topAtBats));
        setBotData(mapAtBats(botAtBats));

        if (setPitcherId && setBatterId) {
          const lastBot = botAtBats[botAtBats.length - 1];
          const lastTop = topAtBats[topAtBats.length - 1];
          const recentAtBat = lastBot || lastTop;

          if (recentAtBat?.pitcher && recentAtBat?.actual_batter) {
            setPitcherId(Number(recentAtBat.pitcher));
            setBatterId(Number(recentAtBat.actual_batter));
          }
        }
      } catch (e) {
        console.error(e);
        setError('데이터 요청 중 오류 발생');
        setTopData([]);
        setBotData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInningData();
    intervalId = setInterval(fetchInningData, 20000);
    return () => clearInterval(intervalId);
  }, [gameId, selectedInning]);

  const renderResultDescription = (desc: string) => {
    const i = desc.indexOf('(');
    if (i !== -1) {
      return (
        <Text style={styles.resultText}>
          {desc.slice(0, i).trim()}
          {'\n'}
          <Text style={styles.resultTextSmall}>{desc.slice(i).trim()}</Text>
        </Text>
      );
    }
    return <Text style={styles.resultText}>{desc}</Text>;
  };

  const renderPlay = (plays: any[], isTop: boolean) =>
    plays.map((play, i) => {
      const batterName = typeof play.batter === 'string' ? play.batter : play.batter?.player_name || '알 수 없음';
      const teamKey = isTop ? awayTeam.toLowerCase() : homeTeam.toLowerCase();
      const teamSymbol = teamSymbolMap[teamKey] || require('../../assets/app_logos/ballrae_logo_green.png');

      return (
        <View key={i} style={styles.playContainer}>
          <Image source={teamSymbol} style={styles.avatar} />
          <View style={styles.infoBox}>
            <Text style={styles.batterName}>
              {batterName} <Text style={styles.battingHand}>{play.batting_hand}</Text>
            </Text>
            <View style={styles.pitches}>
              {play.at_bat.map((p: any, idx: number) => {
                const isLast = idx === play.at_bat.length - 1;
                const displayCode = pitchResultTextToCodeMap[p.type] || p.type[0] || '?';
                const circleColor = pitchResultColorMap[p.type] || '#888';
                const hasPitch = p.pitch?.trim();

                return (
                  <View key={idx} style={styles.pitchRow}>
                    <View style={styles.leftColumn}>
                      {hasPitch ? (
                        <>
                          <View style={[styles.pitchCircle, { backgroundColor: circleColor }]}> 
                            <Text style={styles.pitchCircleText}>{displayCode}</Text>
                          </View>
                          <Text style={styles.pitchText}>
                            {`${p.pitch_num}구: ${p.pitch}`} <Text style={styles.velocityText}>{p.velocity ? `${p.velocity}km/h` : ''}</Text>
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.pitchText}>
                          {p.type || (Array.isArray(p.event) ? p.event.join('\n') : p.event || '결과 없음')}
                        </Text>
                      )}
                    </View>
                    {isLast && play.final_result.description && (
                      <View style={styles.rightColumn}>
                        <View style={[styles.pitchCircle, {
                          backgroundColor: mainResultColorMap[play.final_result.code as 'B' | 'H' | 'O' | 'X'],
                        }]}> 
                          <Text style={styles.pitchCircleText}>{play.final_result.code}</Text>
                        </View>
                        {renderResultDescription(play.final_result.description)}
                      </View>
                    )}
                  </View>
                );
              })} 
              {play.full_result && play.full_result !== '(진행 중)' && <Text style={styles.fullResultText}>{play.full_result}</Text>}
            </View>
          </View>
        </View>
      );
    });

  return (
    <ScrollView style={styles.container} ref={scrollRef} scrollEventThrottle={16}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>문자중계</Text>
      </View>

      <View style={styles.inningTabs}>
        {allInnings.map((inning) => (
          <TouchableOpacity
            key={inning}
            onPress={() => {
              if (status !== 'scheduled') setSelectedInning(inning);
            }}
            disabled={status === 'scheduled'}
          >
            <Text
              style={[styles.inningTabText,
                selectedInning === inning && styles.selectedInning,
                status === 'scheduled' && { color: '#aaa' },
              ]}
            >
              {inning}회
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.halfLabel}><Text style={styles.halfLabelText}>{selectedInning}회 초</Text></View>
      {loading ? <ActivityIndicator size="small" color="#408A21" style={{ marginTop: 12 }} /> :
        topData.length > 0 ? renderPlay(topData, true) : <Text style={styles.noticeText}>초 이닝 정보가 없습니다.</Text>}

      <View style={styles.halfLabel}><Text style={styles.halfLabelText}>{selectedInning}회 말</Text></View>
      {loading ? <ActivityIndicator size="small" color="#408A21" style={{ marginTop: 12 }} /> :
        botData.length > 0 ? renderPlay(botData, false) : <Text style={styles.noticeText}>말 이닝 정보가 없습니다.</Text>}
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
    paddingLeft: 12,
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
    resizeMode: 'contain',
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
    marginBottom: 5,
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
    flexShrink: 0,
    minWidth: 0,
    marginLeft: 40,
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
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'left',
  },
  fullResultText: {
  fontSize: 11,
  color: '#408A21',
  marginTop: 6,
  fontWeight: '800',
  lineHeight: 18,
},

  resultTextSmall: {
    fontSize: 10,
    color: '#666',
  },
  velocityText: {
    fontSize: 10,
    color: '#888',
  },
  halfLabel: {
    backgroundColor: '#408A21',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 25,
    marginTop: 5,
  },
  halfLabelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
