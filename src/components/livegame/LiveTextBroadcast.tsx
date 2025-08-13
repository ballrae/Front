// LiveTextBroadcast.tsx
import React, { useEffect, useState } from 'react';
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

type LiveTextBroadcastProps = {
  gameId: string;
  selectedInning: number;
  setSelectedInning: React.Dispatch<React.SetStateAction<number>>;
};

const LiveTextBroadcast = ({ gameId, selectedInning, setSelectedInning }: LiveTextBroadcastProps) => {
  const [topData, setTopData] = useState<any[]>([]);
  const [botData, setBotData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inningStatus, setInningStatus] = useState<string>('live');

  const allInnings = Array.from({ length: 9 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchInningData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://3.16.129.16:8000/api/games/${gameId}/relay/${selectedInning}/`);
        if (!response.ok) throw new Error('데이터 요청 실패');
        const raw = await response.json();

        const topAtBats = raw.data?.top?.atbats || [];
        const botAtBats = raw.data?.bot?.atbats || [];
        setInningStatus(raw.data?.status || 'live');

        const mapAtBats = (atbats: any[]) =>
          atbats
            .filter((ab: any) => {
              const validPitches = (ab.pitches || []).filter(
                (p: any) => p.pitch_result !== null && p.pitch_result !== undefined
              );
              return validPitches.length > 0;
            })
            .map((ab: any) => {
              const filteredPitches = ab.pitches?.filter(
                (p: any) => p.pitch_result !== null && p.pitch_result !== undefined
              );

              return {
                batter: ab.actual_player || '알 수 없음',
                batting_hand: ab.batting_hand || '',
                at_bat: filteredPitches.map((p: any) => ({
                  pitch_num: p.pitch_num,
                  type: p.pitch_result || '기타',
                  pitch: p.pitch_type,
                  velocity: p.speed,
                })),
                final_result: {
                  code: typeof ab.main_result === 'string' ? ab.main_result[0] : 'X',
                  description: ab.main_result || '결과 없음',
                },
              };
            });

        setTopData(mapAtBats(topAtBats));
        setBotData(mapAtBats(botAtBats));
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setTopData([]);
        setBotData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInningData();
  }, [gameId, selectedInning]);

  const renderResultDescription = (description: string) => {
    const openParenIndex = description.indexOf('(');
    if (openParenIndex !== -1) {
      const before = description.slice(0, openParenIndex).trim();
      const after = description.slice(openParenIndex).trim();
      return (
        <Text style={styles.resultText}>
          {before}
          {'\n'}
          <Text style={styles.resultTextSmall}>{after}</Text>
        </Text>
      );
    } else {
      return <Text style={styles.resultText}>{description}</Text>;
    }
  };

  const renderPlay = (plays: any[]) =>
    plays.map((play, index) => {
      const batterName = typeof play.batter === 'string' ? play.batter : play.batter?.player_name || '알 수 없음';

      return (
        <View key={index} style={styles.playContainer}>
          <Image source={require('../../assets/dummy.png')} style={styles.avatar} />
          <View style={styles.infoBox}>
            <Text style={styles.batterName}>
              {batterName} <Text style={styles.battingHand}>{play.batting_hand}</Text>
            </Text>

            <View style={styles.pitches}>
              {play.at_bat.map((pitch: any, i: number) => {
                const isLast = i === play.at_bat.length - 1;
                const pitchLabel = pitch.type;
                const displayCode = pitchResultTextToCodeMap[pitchLabel] || pitchLabel[0] || '?';
                const circleColor = pitchResultColorMap[pitchLabel] || '#888';

                return (
                  <View key={i} style={styles.pitchRow}>
                    <View style={styles.leftColumn}>
                      <View style={[styles.pitchCircle, { backgroundColor: circleColor }]}>
                        <Text style={styles.pitchCircleText}>{displayCode}</Text>
                      </View>
                      <Text style={styles.pitchText}>
                        {`${pitch.pitch_num}구: ${pitch.pitch} `}
                        <Text style={styles.velocityText}>{`${pitch.velocity}km/h`}</Text>
                      </Text>
                    </View>

                    {isLast && (
                      <View style={styles.rightColumn}>
                        <View
                          style={[
                            styles.pitchCircle,
                            {
                              backgroundColor:
                                pitchResultColorMap[play.final_result.description] || '#ccc',
                            },
                          ]}
                        >
                          <Text style={styles.pitchCircleText}>
                            {pitchResultTextToCodeMap[play.final_result.description] ||
                              play.final_result.code}
                          </Text>
                        </View>
                        <Text style={styles.resultText}>
                          {renderResultDescription(play.final_result.description)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      );
    });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>문자중계</Text>
      </View>

      <View style={styles.inningTabs}>
        {allInnings.map((inning) => (
          <TouchableOpacity
            key={inning}
            onPress={() => {
              if (inningStatus !== 'scheduled') setSelectedInning(inning);
            }}
            disabled={inningStatus === 'scheduled'}
          >
            <Text
              style={[
                styles.inningTabText,
                selectedInning === inning && styles.selectedInning,
                inningStatus === 'scheduled' && { color: '#aaa' },
              ]}
            >
              {inning}회
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.halfLabel}>
        <Text style={styles.halfLabelText}>{selectedInning}회 초</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#408A21" style={{ marginTop: 12 }} />
      ) : topData.length > 0 ? (
        renderPlay(topData)
      ) : (
        <Text style={styles.noticeText}>아직 초 이닝 정보가 없습니다.</Text>
      )}

      <View style={styles.halfLabel}>
        <Text style={styles.halfLabelText}>{selectedInning}회 말</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#408A21" style={{ marginTop: 12 }} />
      ) : botData.length > 0 ? (
        renderPlay(botData)
      ) : (
        <Text style={styles.noticeText}>말 이닝이 아직 시작되지 않았습니다.</Text>
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
  alignSelf: 'flex-start',  // 왼쪽 정렬
  marginBottom: 25,
  marginTop: 5,
},

halfLabelText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
});