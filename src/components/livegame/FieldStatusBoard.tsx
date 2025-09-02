import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import StrikeZoneBox from './StrikeZoneBox';
import BaseballField from './BaseballField';
import axiosInstance from '../../utils/axiosInstance';

const { width: screenWidth } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size: number) => (screenWidth / BASE_WIDTH) * size;

type Pitch = {
  x: number;
  y: number;
  pitchNum: number;
  pitchResult: string;
};

type DefensePositions = {
  [position: string]: string;
};

type Props = {
  gameId: string;
  selectedInning: number;
  setSelectedInning: (inning: number) => void;
  homeTeam: string;
  awayTeam: string;
  pitcherPitchCount?: number;
};

const FieldStatusBoard: React.FC<Props> = ({ gameId, selectedInning, setSelectedInning, homeTeam, awayTeam, pitcherPitchCount }) => {
  const [strikeZone, setStrikeZone] = useState<[number, number, number, number]>([3.305, 1.603, 0.75, -0.75]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [defensePositions, setDefensePositions] = useState<DefensePositions>({});
  const [bso, setBso] = useState({ B: 0, S: 0, O: 0 });
  const [inning, setInning] = useState<number | null>(null);
  const [onBase, setOnBase] = useState({ base1: '0', base2: '0', base3: '0' });
  const [onBaseRunners, setOnBaseRunners] = useState<{ base1?: string; base2?: string; base3?: string }>({});
  const [currentHalf, setCurrentHalf] = useState<'top' | 'bot'>('top');
  const [currentBatterName, setCurrentBatterName] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/api/games/${gameId}/relay/${selectedInning}/`);
      const data = res.data?.data;
      if (!data) return;

      let detectedHalf: 'top' | 'bot' | null = null;
      let currentAtbat = null;

      if (data.top?.atbats?.some((ab: any) => ab.full_result === '(진행 중)')) {
        detectedHalf = 'top';
        currentAtbat = data.top.atbats.find((ab: any) => ab.full_result === '(진행 중)');
      } else if (data.bot?.atbats?.some((ab: any) => ab.full_result === '(진행 중)')) {
        detectedHalf = 'bot';
        currentAtbat = data.bot.atbats.find((ab: any) => ab.full_result === '(진행 중)');
      }

      if (!currentAtbat || !detectedHalf) return;

      setCurrentHalf(detectedHalf);
      const currentData = data[detectedHalf];

      const liveInning = currentData?.inning_number ?? null;
      setSelectedInning(liveInning);
      setInning(liveInning);
      setOnBase(currentAtbat.on_base ?? { base1: '0', base2: '0', base3: '0' });
      setCurrentBatterName(currentAtbat.actual_batter?.player_name ?? '');

      const baseNames: { [key: string]: string } = {};
      ['base1', 'base2', 'base3'].forEach((base) => {
        const baseValue = currentAtbat.on_base?.[base] ?? '0';
        if (baseValue !== '0') {
          const runner = currentData.atbats.find(
            (ab: any) => ab.bat_order?.toString() === baseValue
          );
          baseNames[base] = runner?.actual_batter?.player_name || '주자';
        }
      });
      setOnBaseRunners(baseNames);

      const zone = currentAtbat.strike_zone;
      if (Array.isArray(zone) && zone.length === 4) {
        setStrikeZone(zone as [number, number, number, number]);
      }

      const pitches = currentAtbat.pitch_sequence ?? [];
      let parsedPitches: Pitch[] = [];
      let totalPitches = 0;
      let ball = 0, strike = 0;

      for (const p of pitches) {
        totalPitches++;
        const coords = p.pitch_coordinate?.[0];
        if (Array.isArray(coords) && coords.length === 2) {
          parsedPitches.push({
            x: coords[0],
            y: coords[1],
            pitchNum: p.pitch_num ?? totalPitches,
            pitchResult: p.pitch_result ?? '기타',
          });
        }
        const result = p.pitch_result;
        if (result === '스트라이크' || result === '헛스윙' || result === '파울') {
          if (strike < 2) strike++;
        } else if (result === '볼') {
          if (ball < 3) ball++;
        }
      }

      setPitches(parsedPitches);
      setBso({ B: ball, S: strike, O: Number(currentAtbat.out ?? 0) });

      const positions = detectedHalf === 'top' ? data.defense_positions?.home : data.defense_positions?.away;
      setDefensePositions(positions || {});
    } catch (err) {
     // console.error('❌ API fetch 실패:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [gameId, selectedInning]);

  const getBaseStyle = (base: 'base1' | 'base2' | 'base3') => {
    const isRunnerOn = onBase[base] !== '0';
    const basePos = base === 'base1' ? styles.runnerRight : base === 'base2' ? styles.runnerTop : styles.runnerLeft;
    return [styles.baseIcon, basePos, isRunnerOn && styles.runnerFilled];
  };

  return (
    <View style={styles.container}>
      <View style={styles.diamondView}>
        <View style={{ width: '120%', height: '100%' }}>
          <BaseballField
            width="100%"
            height="100%"
            defensePositions={defensePositions}
            onBaseRunners={onBaseRunners}
            currentBatterName={currentBatterName}
          />
        </View>
      </View>

      <View style={styles.rightPanel}>
        <View style={styles.inningAndRunner}>
          <View style={styles.inningBox}>
            <View style={[styles.triangleUp, currentHalf === 'top' && { borderBottomColor: 'white' }]} />
            <Text style={styles.inningText}>{inning ?? '-'}</Text>
            <View style={[styles.triangleDown, currentHalf === 'bot' && { borderTopColor: 'white' }]} />
          </View>

          <View style={styles.runnerBox}>
            {(['base1', 'base2', 'base3'] as const).map((base, idx) => (
              <View key={idx} style={getBaseStyle(base)} />
            ))}
          </View>
        </View>

        <View style={styles.countBox}>
          {[
            { label: 'B', count: bso.B, color: '#6c3', max: 4 },
            { label: 'S', count: bso.S, color: '#fc3', max: 3 },
            { label: 'O', count: bso.O, color: '#f44', max: 3 },
          ].map(({ label, count, color, max }) => (
            <View style={styles.countRow} key={label}>
              <Text style={styles.countLabel}>{label}</Text>
              {Array(max).fill(0).map((_, i) => (
                <View key={i} style={[styles.countDot, { backgroundColor: i < count ? color : '#8bb980' }]} />
              ))}
            </View>
          ))}
          <View style={styles.countRow}>
            <Text style={styles.countLabel}>P</Text>
            <Text style={styles.pitchText}>{typeof pitcherPitchCount === 'number' ? pitcherPitchCount : 0}</Text>
          </View>
        </View>

        <View style={styles.strikeZoneContainer}>
          <StrikeZoneBox
            strikeZone={strikeZone}
            pitches={pitches}
            width={scale(125)}
            height={scale(140)}
          />
        </View>
      </View>
    </View>
  );
};

export default FieldStatusBoard;


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: scale(300),
    backgroundColor: '#3e8e22',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diamondView: {
    width: '70%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rightPanel: {
    width: '30%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inningAndRunner: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: scale(20),
  },
  inningBox: {
    alignItems: 'center',
    marginLeft: scale(20),
  },
  inningText: {
    color: 'white',
    fontSize: scale(28),
    fontWeight: 'bold',
    marginVertical: scale(2),
  },
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(5),
    borderRightWidth: scale(5),
    borderBottomWidth: scale(7),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#a5cd8d',
  },
  triangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(5),
    borderRightWidth: scale(5),
    borderTopWidth: scale(7),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#a5cd8d',
  },
  runnerBox: {
    position: 'relative',
    width: scale(50),
    height: scale(50),
    marginTop: scale(12),
  },
  baseIcon: {
    width: scale(12),
    height: scale(12),
    backgroundColor: '#a5cd8d',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },
  runnerTop: {
    top: 0,
    left: '50%',
    marginLeft: -scale(6),
  },
  runnerLeft: {
    top: '50%',
    left: scale(8),
    marginTop: -scale(13),
  },
  runnerRight: {
    top: '50%',
    right: scale(8),
    marginTop: -scale(13),
  },
  runnerFilled: {
    backgroundColor: '#ffffff',
  },
  countBox: {
    alignItems: 'flex-start',
    marginLeft: scale(20),
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(2),
  },
  countLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: scale(13),
    width: scale(14),
    marginRight: scale(4),
  },
  countDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(4),
  },
  pitchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: scale(13),
  },
  strikeZoneContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});