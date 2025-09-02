// src/bridge/SharedData.ts
import { NativeModules, Platform } from 'react-native';

const { MessageBridge, SharedDataBridge } = NativeModules;

//  기존 구조 유지하면서 내부에서 순차 실행 호출
export function startLiveActivity(message: string) {
  if (Platform.OS === 'android') {
    MessageBridge?.startLiveActivity?.(message);
  } else {
    if (SharedDataBridge?.startLiveActivity) {
      SharedDataBridge.startLiveActivity(message);
      // Swift 네이티브에서 백그라운드 메시지 업데이트 처리
      console.log("🚀 LiveActivity 시작됨 - Swift에서 백그라운드 업데이트 처리");
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

// 모든 LiveActivity 강제 정리
export function forceEndAllLiveActivities() {
  if (Platform.OS === 'android') {
    console.log("💥 Android에서는 LiveActivity를 지원하지 않습니다");
  } else {
    if (SharedDataBridge?.forceEndAllLiveActivities) {
      SharedDataBridge.forceEndAllLiveActivities();
      console.log("💥 모든 LiveActivity 강제 정리 시작");
    } else {
      console.warn("🚨 forceEndAllLiveActivities is not defined on SharedDataBridge");
    }
  }
}

export function saveMessageToWidget(message: string) {
  if (Platform.OS === 'android') {
    MessageBridge?.saveMessage(message);
  } else {
    SharedDataBridge?.saveMessage(message);
  }
}