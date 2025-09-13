// src/bridge/SharedData.ts
import { NativeModules, Platform } from 'react-native';

const { MessageBridge, SharedDataBridge } = NativeModules;

// ✅ 메시지 리스트 정의
const messages = [
  '🔥 불꽃처럼 뜨겁게!',
  '📌 오늘 할 일 완료!',
  '💪 지희 최고!',
  '📝 기록 완료!',
  '🌟 위젯 테스트 성공!',
  '🎉 오늘도 수고했어!'
];

// ✅ 메시지를 순차적으로 보여주는 내부 함수
async function playMessageSequence() {
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateLiveActivity(messages[i]);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  endLiveActivity();
}

// ✅ 기존 구조 유지하면서 내부에서 순차 실행 호출
export function startLiveActivity(message: string) {
  if (Platform.OS === 'android') {
    MessageBridge?.startLiveActivity?.(message);
  } else {
    if (SharedDataBridge?.startLiveActivity) {
      SharedDataBridge.startLiveActivity(message);
      playMessageSequence(); // ✅ 여기서 메시지 순차 실행 시작
    } else {
      console.warn("🚨 startLiveActivity is not defined on SharedDataBridge");
    }
  }
}

export function updateLiveActivity(detail: string) {
  if (SharedDataBridge?.updateLiveActivity) {
    SharedDataBridge.updateLiveActivity(detail);
  } else {
    console.warn("🚨 updateLiveActivity is not defined on SharedDataBridge");
  }
}

export function endLiveActivity() {
  if (SharedDataBridge?.endLiveActivity) {
    SharedDataBridge.endLiveActivity();
  } else {
    console.warn("🚨 endLiveActivity is not defined on SharedDataBridge");
  }
}

export function hasActiveLiveActivity(): boolean {
  if (SharedDataBridge?.hasActiveLiveActivity) {
    return SharedDataBridge.hasActiveLiveActivity();
  } else {
    console.warn("🚨 hasActiveLiveActivity is not defined on SharedDataBridge");
    return false;
  }
}

export function getActiveGameId(): string | null {
  if (SharedDataBridge?.getActiveGameId) {
    return SharedDataBridge.getActiveGameId();
  } else {
    console.warn("🚨 getActiveGameId is not defined on SharedDataBridge");
    return null;
  }
}

export function saveMessageToWidget(message: string) {
  if (Platform.OS === 'android') {
    MessageBridge?.saveMessage(message);
  } else {
    SharedDataBridge?.saveMessage(message);
  }
}

export function startGameLiveActivity(gameData: {
  gameId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  inning: string;
  half: string;
  homePlayer: string;
  awayPlayer: string;
  gameMessage: string;
  isLive: boolean;
}) {
  if (Platform.OS === 'android') {
    // Android는 아직 구현 안됨
    console.log("Android Game Live Activity not implemented yet");
  } else {
    if (SharedDataBridge?.startGameLiveActivity) {
      SharedDataBridge.startGameLiveActivity(
        gameData.gameId,
        gameData.homeTeamName,
        gameData.awayTeamName,
        gameData.homeScore,
        gameData.awayScore,
        gameData.inning,
        gameData.half,
        gameData.homePlayer,
        gameData.awayPlayer,
        gameData.gameMessage,
        gameData.isLive
      );
    } else {
      console.warn("🚨 startGameLiveActivity is not defined on SharedDataBridge");
    }
  }
}

export function updateGameLiveActivity(gameData: {
  homeScore: number;
  awayScore: number;
  inning: string;
  half: string;
  homePlayer: string;
  awayPlayer: string;
  gameMessage: string;
  isLive: boolean;
}) {
  if (Platform.OS === 'android') {
    // Android는 아직 구현 안됨
    console.log("Android Game Live Activity update not implemented yet");
  } else {
    if (SharedDataBridge?.updateGameLiveActivity) {
      SharedDataBridge.updateGameLiveActivity(
        gameData.homeScore,
        gameData.awayScore,
        gameData.inning,
        gameData.half,
        gameData.homePlayer,
        gameData.awayPlayer,
        gameData.gameMessage,
        gameData.isLive
      );
    } else {
      console.warn("🚨 updateGameLiveActivity is not defined on SharedDataBridge");
    }
  }
}