// src/bridge/SharedData.ts
import { NativeModules, Platform } from 'react-native';

const { MessageBridge, SharedDataBridge } = NativeModules;

export function saveMessageToWidget(message: string) {
  if (Platform.OS === 'android') {
    MessageBridge?.saveMessage(message);
  } else {
    SharedDataBridge?.saveMessage(message);
  }
}