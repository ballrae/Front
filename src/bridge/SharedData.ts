// src/bridge/SharedData.ts
import { NativeModules, Platform } from 'react-native';

const { MessageBridge, SharedDataBridge } = NativeModules;

// 메시지 리스트 정의
const messages = [
  '⚾ 경기 시작! 1회말 공격 시작합니다!',
  '👤 1번 타자 지희, 타석에 섭니다!',
  '💥 안타! 주자 1루 진루!',
  '👣 도루 성공! 2루 진출!',
  '🥁 클라이맥스...!',
  '🔥 4번 타자! 적시타!!',
  '🎉 득점 성공!!',
  '🧹 공격 종료, 수비 준비 중...',
  '🏁 9회말, 경기가 종료되었습니다!'
];

//  메시지를 순차적으로 보여주는 내부 함수
async function playMessageSequence() {
  for (let i = 0; i < messages.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateLiveActivity(messages[i]);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  endLiveActivity();
}

//  기존 구조 유지하면서 내부에서 순차 실행 호출
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

export function saveMessageToWidget(message: string) {
  if (Platform.OS === 'android') {
    MessageBridge?.saveMessage(message);
  } else {
    SharedDataBridge?.saveMessage(message);
  }
}