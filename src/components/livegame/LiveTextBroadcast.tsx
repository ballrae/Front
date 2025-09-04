import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import mainResultColorMap, { mainresultCodeMap } from '../../constants/mainresultCodeMap';

type LiveTextBroadcastProps = {
  gameId: string;
  selectedInning: number;
  setSelectedInning: React.Dispatch<React.SetStateAction<number>>;
  homeTeam: string;
  awayTeam: string;
  maxInning: number;
  setPitcherId?: (id: number) => void;
  setBatterId?: (id: number) => void;
  isGameDone?: boolean;
  cheerSongEnabled?: boolean;
  setCheerSongEnabled?: (enabled: boolean) => void;
};

const LiveTextBroadcast = ({
  gameId,
  selectedInning,
  setSelectedInning,
  homeTeam,
  awayTeam,
  maxInning: maxInningProp,
  setPitcherId,
  setBatterId,
  isGameDone = false,
  cheerSongEnabled = true,
  setCheerSongEnabled,
}: LiveTextBroadcastProps) => {
  const [topData, setTopData] = useState<any[]>([]);
  const [botData, setBotData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'OK_REALTIME' | 'OK_ARCHIVED' | 'scheduled'>('scheduled');
  const [maxInningFromAPI, setMaxInningFromAPI] = useState<number>(9);
  const [archivedReady, setArchivedReady] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const scrollRef = useRef<ScrollView>(null);
  const currentOffsetRef = useRef<number>(0);
  const dataSignatureRef = useRef<string>('');

  const maxInning = Math.max(maxInningFromAPI, maxInningProp || 9);
  const allInnings = Array.from({ length: maxInning }, (_, i) => i + 1);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchInningData = async (showLoading: boolean) => {
      setError(null);
      if (showLoading) setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/games/${gameId}/relay/${selectedInning}/`);
        const raw = res.data;

        const isRealtime = raw.status === 'OK_REALTIME';
        setStatus(raw.status);
        setLastUpdateTime(raw.last_update || new Date().toISOString());

        const topAtBats = raw.data?.top?.atbats || [];
        const botAtBats = raw.data?.bot?.atbats || [];

        // 진행 중일 때만 최대 이닝 감지 (종료된 경기는 이미 maxInningProp으로 받음)
        if (!isGameDone) {
          const inningNum = raw.data?.top?.inning_number || raw.data?.bot?.inning_number || selectedInning;
          setMaxInningFromAPI(prev => Math.max(prev, inningNum));
        }

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

        // 더 정확한 데이터 변경 감지 - 각 타자의 상세 정보까지 비교
        const topSignature = topAtBats.map((ab: any) => 
          `${ab.actual_batter || ab.actual_player}-${ab.main_result || ''}-${(ab.pitch_sequence || ab.pitches || []).length}-${ab.full_result || ''}`
        ).join('|');
        
        const botSignature = botAtBats.map((ab: any) => 
          `${ab.actual_batter || ab.actual_player}-${ab.main_result || ''}-${(ab.pitch_sequence || ab.pitches || []).length}-${ab.full_result || ''}`
        ).join('|');
        
        const nextSignature = `${isRealtime ? 'R' : 'A'}|${selectedInning}|${topSignature}|${botSignature}`;
        const hasDataChanged = dataSignatureRef.current !== nextSignature;
        
        if (hasDataChanged) {
          dataSignatureRef.current = nextSignature;
          setTopData(mapAtBats(topAtBats));
          setBotData(mapAtBats(botAtBats));
          
          // 데이터가 변경되었을 때만 콘솔에 로그 (디버깅용)
          console.log(`[LiveTextBroadcast] 데이터 업데이트: ${selectedInning}회, ${isRealtime ? '실시간' : '아카이브'}`);
        }

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
        console.error('[LiveTextBroadcast] API 호출 오류:', e);
        setError('데이터 요청 중 오류 발생');
        setTopData([]);
        setBotData([]);
      } finally {
        if (showLoading) setLoading(false);
        else {
          const y = currentOffsetRef.current;
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ y, animated: false });
            }
          });
        }
      }
    };

    // 초기 1회 호출
    fetchInningData(true);

    // 진행 중일 때만 10초 폴링 (20초에서 10초로 단축)
    if (!isGameDone) {
      intervalId = setInterval(() => fetchInningData(false), 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameId, selectedInning, isGameDone]);

  // 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 모든 인터벌 정리
      // Node.js 환경에서는 모든 인터벌을 정리할 수 없으므로 
      // 필요한 경우에만 특정 인터벌을 정리
    };
  }, []);





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

      // 경기가 종료되었을 때 완료되지 않은 타자는 표시하지 않음
      if (isGameDone && (!play.at_bat || play.at_bat.length === 0 || !play.final_result.description)) {
        return null;
      }

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
                const eventText = Array.isArray(p.event) ? p.event.join('\n') : (p.event || '');
                const fullResultRaw = typeof play.full_result === 'string' ? play.full_result : '';
                const fullResultHead = fullResultRaw.split('|')[0] || '';
                const norm = (s: string) => s.replace(/[\s()]/g, '');
                const isDuplicateEvent = eventText && fullResultHead && (norm(fullResultHead).includes(norm(eventText)) || norm(eventText).includes(norm(fullResultHead)));

                // 이벤트만 있고 아직 투구 정보가 없는 경우: 이벤트만 표시하고 '결과 없음'은 숨김
                if (!!eventText && !isDuplicateEvent && !hasPitch && !p.type) {
                  const formattedEvent = eventText.split('|').map((s: string) => s.trim()).join('\n');
                  return (
                    <View key={idx} style={styles.pitchRow}>
                      <View style={styles.leftColumn}>
                        <Text style={styles.eventText}>{formattedEvent}</Text>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={idx}>
                    {!!eventText && !isDuplicateEvent && (
                      <View style={styles.pitchRow}>
                        <View style={styles.leftColumn}>
                          <Text style={styles.eventText}>{eventText.split('|').map((s: string) => s.trim()).join('\n')}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.pitchRow}>
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
                          // 동그라미로 변환되지 않는 결과는 표시하지 않음
                          displayCode !== '?' && p.type ? (
                            <Text style={styles.pitchText}>
                              {p.type}
                            </Text>
                          ) : null
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
                  </View>
                );
              })} 
              {play.full_result && play.full_result !== '(진행 중)' && (
                <View style={{ marginTop: 6 }}>
                  {play.full_result.split('|').map((line: string, idx: number) => {
                    const i = line.indexOf('(');
                    const insideParen = line.slice(i).trim();
                    const isParenthesis = i !== -1;

                    const shouldNotBreak = isParenthesis && (insideParen.startsWith('(으') || insideParen.startsWith('(로'));

                    if (isParenthesis && !shouldNotBreak) {
                      return (
                        <Text key={idx} style={styles.fullResultText}>
                          {line.slice(0, i).trim()}
                          {'\n'}
                          <Text style={styles.resultTextSmall}>{insideParen}</Text>
                        </Text>
                      );
                    }

                    return (
                      <Text key={idx} style={styles.fullResultText}>
                        {line.trim()}
                      </Text>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    });

  // 무거운 JSX 생성 메모이즈
  const topPlaysView = useMemo(() => renderPlay(topData, true), [topData, awayTeam, homeTeam]);
  const botPlaysView = useMemo(() => renderPlay(botData, false), [botData, awayTeam, homeTeam]);

  return (
    <ScrollView
      style={styles.container}
      ref={scrollRef}
      scrollEventThrottle={16}
      onScroll={(e) => {
        currentOffsetRef.current = e.nativeEvent.contentOffset.y;
      }}
      onContentSizeChange={() => {
        const y = currentOffsetRef.current;
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ y, animated: false });
          }
        });
      }}
    >
    
      {!isGameDone && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>문자중계</Text>
          {setCheerSongEnabled && (
            <TouchableOpacity
              style={[styles.cheerSongToggle, cheerSongEnabled && styles.cheerSongToggleActive]}
              onPress={() => setCheerSongEnabled(!cheerSongEnabled)}
            >
              <Text style={[styles.cheerSongToggleText, cheerSongEnabled && styles.cheerSongToggleTextActive]}>
                {cheerSongEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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
              style={[
                styles.inningTabText,
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
        topData.length > 0 ? topPlaysView : <Text style={styles.noticeText}>초 이닝 정보가 없습니다.</Text>}

      <View style={styles.halfLabel}><Text style={styles.halfLabelText}>{selectedInning}회 말</Text></View>
      {loading ? <ActivityIndicator size="small" color="#408A21" style={{ marginTop: 12 }} /> :
        botData.length > 0 ? botPlaysView : <Text style={styles.noticeText}>말 이닝 정보가 없습니다.</Text>}
    </ScrollView>
  );
};

export default LiveTextBroadcast;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  updateStatusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  updateStatusText: { fontSize: 12, color: '#666' },
  inningTabs: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  inningTabText: { fontSize: 13, color: '#000' },
  selectedInning: { fontWeight: 'bold', color: 'green' },
  title: { fontSize: 20, marginBottom: 12 },
  noticeText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 20 },
  playContainer: { flexDirection: 'row', marginBottom: 24 },
  avatar: { width: 48, height: 48, resizeMode: 'contain', marginRight: 12 },
  infoBox: { flex: 1 },
  batterName: { fontSize: 15 },
  battingHand: { fontSize: 12, color: '#888' },
  pitches: { marginTop: 8 },
  pitchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  leftColumn: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  rightColumn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0, minWidth: 0, marginLeft: 40 },
  pitchCircle: { width: 18, height: 18, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  pitchCircleText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  pitchText: { fontSize: 11 },
  resultText: { fontSize: 11, lineHeight: 18, fontWeight: '500', textAlign: 'left' },
  resultTextSmall: { fontSize: 10, color: '#666' },
  fullResultText: { fontSize: 11, color: '#408A21', fontWeight: '800', lineHeight: 18 },
  velocityText: { fontSize: 10, color: '#888' },
  eventText: { fontSize: 10, color: '#2E7D32', marginTop: -1, marginBottom: 2 },
  halfLabel: { backgroundColor: '#408A21', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start', marginBottom: 25, marginTop: 5 },
  halfLabelText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  fullresultTextSmall: { fontSize: 10, color: '#408A21' },
  cheerSongToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cheerSongToggleActive: {
    backgroundColor: '#9DCC8A',
    borderColor: '#9DCC8A',
  },
  cheerSongToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  cheerSongToggleTextActive: {
    color: '#ffffff',
  },
});