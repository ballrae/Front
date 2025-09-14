import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
import teamNameMap from '../../constants/teamNames';
import axiosInstance from '../../utils/axiosInstance';
import mainResultColorMap, { mainresultCodeMap } from '../../constants/mainresultCodeMap';
import { processRealtimeData } from '../../utils/gameStateManager';

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
  onCommentGenerated?: (comment: string) => void;
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
  onCommentGenerated,
}: LiveTextBroadcastProps) => {
  const [topData, setTopData] = useState<any[]>([]);
  const [botData, setBotData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'OK_REALTIME' | 'OK_ARCHIVED' | 'scheduled'>('scheduled');
  const [maxInningFromAPI, setMaxInningFromAPI] = useState<number>(9);
  const [archivedReady, setArchivedReady] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [cachedData, setCachedData] = useState<{[key: number]: {top: any[], bot: any[]}}>({});

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
      
      // 로컬 캐시에서 데이터 확인
      if (cachedData[selectedInning]) {
        setTopData(cachedData[selectedInning].top);
        setBotData(cachedData[selectedInning].bot);
        setLoading(false);
        return;
      }
      
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
              batter: isRealtime ? (typeof ab.actual_batter === 'object' ? String(ab.actual_batter?.player_name || '') : String(ab.actual_batter || '')) : (typeof ab.actual_player === 'object' ? String(ab.actual_player?.player_name || '') : String(ab.actual_player || '')),
              batting_hand: String(ab.batting_hand || ''),
              at_bat: (pitches || []).map((p: any) => ({
                pitch_num: String(p.pitch_num || ''),
                type: String(p.pitch_result || ''),
                pitch: String(p.pitch_type || ''),
                velocity: String(p.speed || ''),
                event: p.event,
              })),
              final_result: {
                code: mainresultCodeMap(String(ab.main_result || '')) as 'B' | 'H' | 'O' | 'X',
                description: String(ab.main_result || ''),
              },
              full_result: String(ab.full_result || ''),
              pli_data: ab.pli_data || null,
            };
          });

        // 데이터 변경 감지 (경기 종료 시에는 단순화)
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
          const mappedTopData = mapAtBats(topAtBats);
          const mappedBotData = mapAtBats(botAtBats);
          
          // 데이터를 로컬 캐시에 저장
          setCachedData(prev => ({
            ...prev,
            [selectedInning]: {
              top: mappedTopData,
              bot: mappedBotData
            }
          }));
          
          // 현재 선택된 이닝의 데이터만 표시
          setTopData(mappedTopData);
          setBotData(mappedBotData);
          
          // 멘트 생성 로직 추가 (경기 종료 시에는 비활성화)
          if (onCommentGenerated && isRealtime && !isGameDone) {
            try {
              // 현재 진행 중인 타석 찾기
              const currentAtbat = [...topAtBats, ...botAtBats].find(
                (ab: any) => ab.full_result === '(진행 중)'
              );
              
              if (currentAtbat) {
                // 현재 공격팀 결정
                const isTopHalf = topAtBats.some((ab: any) => ab.full_result === '(진행 중)');
                const attackingTeamName = isTopHalf ? teamNameMap[awayTeam] : teamNameMap[homeTeam];
                const isHomeTeam = !isTopHalf;
                
                // API 데이터를 멘트 생성에 맞는 형태로 변환
                const apiDataForComment = {
                  inning: `${selectedInning}회${isTopHalf ? '초' : '말'}`,
                  half: isTopHalf ? 'top' : 'bot',
                  score: `${raw.data?.top?.score || 0}:${raw.data?.bot?.score || 0}`,
                  current_atbat: {
                    actual_batter: currentAtbat.actual_batter,
                    pitcher: currentAtbat.pitcher,
                    main_result: currentAtbat.main_result || '',
                    on_base: currentAtbat.on_base || { base1: '0', base2: '0', base3: '0' },
                    outs: currentAtbat.outs || '0사',
                    strikeout_count: currentAtbat.strikeout_count || '0'
                  },
                  game_info: {
                    inning: selectedInning,
                    half: isTopHalf ? 'top' : 'bot',
                    score: `${raw.data?.top?.score || 0}:${raw.data?.bot?.score || 0}`,
                    outs: currentAtbat.outs || '0'
                  }
                };
                
                // 멘트 생성
                const generatedComment = processRealtimeData(apiDataForComment, attackingTeamName, isHomeTeam);
                
                if (generatedComment) {
                  console.log('🔍 LiveTextBroadcast에서 생성된 멘트:', generatedComment);
                  onCommentGenerated(generatedComment);
                }
              }
            } catch (error) {
              console.error('멘트 생성 중 오류:', error);
            }
          }
          
          // 데이터가 변경되었을 때만 콘솔에 로그 (디버깅용)
         
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

    // 진행 중일 때만 10초 폴링
    if (!isGameDone) {
      intervalId = setInterval(() => fetchInningData(false), 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameId, selectedInning, isGameDone]);

  // 선택된 이닝이 변경될 때 캐시된 데이터를 사용
  useEffect(() => {
    if (cachedData[selectedInning]) {
      setTopData(cachedData[selectedInning].top);
      setBotData(cachedData[selectedInning].bot);
    }
  }, [selectedInning, cachedData]);

  // 캐시 크기 제한 (메모리 누수 방지)
  useEffect(() => {
    const cacheKeys = Object.keys(cachedData);
    if (cacheKeys.length > 10) { // 최대 10개 이닝만 캐시
      const sortedKeys = cacheKeys.map(Number).sort((a, b) => b - a);
      const keysToRemove = sortedKeys.slice(10);
      
      setCachedData(prev => {
        const newCache = { ...prev };
        keysToRemove.forEach(key => {
          delete newCache[key];
        });
        return newCache;
      });
    }
  }, [cachedData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 캐시 정리 (메모리 누수 방지)
      setCachedData({});
      setTopData([]);
      setBotData([]);
    };
  }, []);





  const renderResultDescription = (desc: string) => {
    if (!desc || typeof desc !== 'string') {
      return <Text style={styles.resultText}>결과 없음</Text>;
    }
    
    const trimmedDesc = desc.trim();
    if (!trimmedDesc) {
      return <Text style={styles.resultText}>결과 없음</Text>;
    }
    
    const i = trimmedDesc.indexOf('(');
    if (i !== -1) {
      return (
        <Text style={styles.resultText}>
          {trimmedDesc.slice(0, i).trim()}
          {'\n'}
          <Text style={styles.resultTextSmall}>{trimmedDesc.slice(i).trim()}</Text>
        </Text>
      );
    }
    return <Text style={styles.resultText}>{trimmedDesc}</Text>;
  };

  const renderPlay = useCallback((plays: any[], isTop: boolean) => {
    // 현재 이닝의 모든 타석에서 PLI가 있는 타석들의 인덱스를 찾기
    const pliIndices: number[] = [];
    plays.forEach((play, i) => {
      if (play.pli_data && !play.pli_data.error && play.pli_data.pli) {
        pliIndices.push(i);
      }
    });
    
    return plays.map((play, i) => {
      const batterName = typeof play.batter === 'string' ? play.batter : String(play.batter?.player_name || '알 수 없음');
      const teamKey = isTop ? String(awayTeam).toLowerCase() : String(homeTeam).toLowerCase();
      const teamSymbol = teamSymbolMap[teamKey] || require('../../assets/app_logos/ballrae_logo_green.png');
      
      // 현재 타석의 PLI 값 계산
      let currentPli = null;
      let pliChange = null;
      
      if (play.pli_data && !play.pli_data.error && play.pli_data.pli) {
        currentPli = Math.round(play.pli_data.pli * 100);
        
        // 현재 타석이 PLI가 있는 타석 중 몇 번째인지 찾기
        const currentPliIndex = pliIndices.indexOf(i);
        
        // 이전 PLI 값과 비교 (현재 인덱스가 0보다 클 때만)
        if (currentPliIndex > 0) {
          const previousPliIndex = pliIndices[currentPliIndex - 1];
          const previousPlay = plays[previousPliIndex];
          if (previousPlay && previousPlay.pli_data && !previousPlay.pli_data.error && previousPlay.pli_data.pli) {
            const previousPli = Math.round(previousPlay.pli_data.pli * 100);
            if (previousPli !== currentPli) {
              pliChange = currentPli - previousPli;
            }
          }
        }
      }

      // 경기가 종료되었을 때 완료되지 않은 타자는 표시하지 않음
      if (isGameDone && (!play.at_bat || play.at_bat.length === 0 || !play.final_result.description)) {
        return null;
      }

      return (
        <View key={i} style={styles.playContainer}>
          <Image source={teamSymbol} style={styles.avatar} />
          <View style={styles.infoBox}>
            <Text style={styles.batterName}>
              {batterName} <Text style={styles.battingHand}>{String(play.batting_hand || '')}</Text>
            </Text>
            <View style={styles.pitches}>
              {play.at_bat.map((p: any, idx: number) => {
                const isLast = idx === play.at_bat.length - 1;
                const displayCode = pitchResultTextToCodeMap[String(p.type || '')] || (p.type ? String(p.type)[0] : '') || '?';
                const circleColor = pitchResultColorMap[String(p.type || '')] || '#888';
                const hasPitch = p.pitch ? String(p.pitch).trim() : '';
                const eventText = Array.isArray(p.event) ? p.event.join('\n') : (p.event ? String(p.event) : '');
                const fullResultRaw = typeof play.full_result === 'string' ? play.full_result : String(play.full_result || '');
                const fullResultHead = fullResultRaw.split('|')[0] || '';
                const norm = (s: string) => s.replace(/[\s()]/g, '');
                const isDuplicateEvent = eventText && fullResultHead && (norm(fullResultHead).includes(norm(eventText)) || norm(eventText).includes(norm(fullResultHead)));

                // 이벤트만 있고 아직 투구 정보가 없는 경우: 이벤트만 표시하고 '결과 없음'은 숨김
                if (!!eventText && !isDuplicateEvent && !hasPitch && !p.type) {
                  const formattedEvent = String(eventText).split('|').map((s: string) => String(s).trim()).join('\n');
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
                          <Text style={styles.eventText}>{String(eventText).split('|').map((s: string) => String(s).trim()).join('\n')}</Text>
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
                              {`${String(p.pitch_num || '')}구: ${String(p.pitch || '')}`} <Text style={styles.velocityText}>{p.velocity ? `${String(p.velocity)}km/h` : ''}</Text>
                            </Text>
                          </>
                        ) : (
                          // 동그라미로 변환되지 않는 결과는 표시하지 않음
                          displayCode !== '?' && p.type ? (
                            <Text style={styles.pitchText}>
                              {String(p.type || '')}
                            </Text>
                          ) : null
                        )}
                      </View>
                      {isLast && play.final_result && play.final_result.description && String(play.final_result.description).trim() && (
                        <View style={styles.rightColumn}>
                          <View style={[styles.pitchCircle, {
                            backgroundColor: mainResultColorMap[String(play.final_result.code || '') as 'B' | 'H' | 'O' | 'X'],
                          }]}> 
                            <Text style={styles.pitchCircleText}>{String(play.final_result.code || '')}</Text>
                          </View>
                          {renderResultDescription(play.final_result.description)}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })} 
              {play.full_result && play.full_result !== '(진행 중)' && String(play.full_result).trim() && (
                <View style={{ marginTop: 6 }}>
                  {String(play.full_result).split('|').map((line: string, idx: number) => {
                    const trimmedLine = String(line).trim();
                    if (!trimmedLine) return null;
                    
                    const i = trimmedLine.indexOf('(');
                    const insideParen = trimmedLine.slice(i).trim();
                    const isParenthesis = i !== -1;

                    const shouldNotBreak = isParenthesis && (insideParen.startsWith('(으') || insideParen.startsWith('(로'));

                    if (isParenthesis && !shouldNotBreak) {
                      return (
                        <Text key={idx} style={styles.fullResultText}>
                          {trimmedLine.slice(0, i).trim()}
                          {'\n'}
                          <Text style={styles.resultTextSmall}>{insideParen}</Text>
                        </Text>
                      );
                    }

                    return (
                      <Text key={idx} style={styles.fullResultText}>
                        {trimmedLine}
                      </Text>
                    );
                  })}
                </View>
              )}
              
              {/* 각 타석의 승리 확률 표시 */}
              {play.pli_data && !play.pli_data.error && play.pli_data.pli && (isGameDone || currentPli !== null) && (
                <View style={styles.pliContainer}>
                  <Text style={styles.pliText}>
                    {String(teamNameMap[isTop ? String(awayTeam) : String(homeTeam)] || (isTop ? String(awayTeam) : String(homeTeam)))} 승리 확률 {String(currentPli)}%
                    {pliChange !== null && pliChange !== 0 && (
                      <Text style={[
                        styles.pliChangeText,
                        { color: pliChange > 0 ? '#e74c3c' : '#3498db' }
                      ]}>
                        {' '}({pliChange > 0 ? '+' : ''}{String(pliChange)}%)
                      </Text>
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    });
  }, [awayTeam, homeTeam, isGameDone]);

  // 무거운 JSX 생성 메모이즈
  const topPlaysView = useMemo(() => renderPlay(topData, true), [topData, renderPlay]);
  const botPlaysView = useMemo(() => renderPlay(botData, false), [botData, renderPlay]);

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
  winProbabilityContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#408A21',
  },
  winProbabilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  pliContainer: {
    marginTop: 8,
  },
  pliText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
  },
  pliChangeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});