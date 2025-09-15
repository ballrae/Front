// App.tsx
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import backgroundLiveActivityService from './src/services/BackgroundLiveActivityService';

function App(): React.JSX.Element {
  useEffect(() => {
    // 개발 모드 경고 메시지 숨기기
    if (__DEV__) {
      // 특정 경고 메시지들 무시
      LogBox.ignoreLogs([
        'Remote debugger',
        'Flipper',
        'Metro',
        'Connect to Metro',
        'Running application',
        'VirtualizedLists should never be nested',
        'Setting a timer',
        'Require cycle',
        'Non-serializable values were found in the navigation state',
        'componentWillReceiveProps',
        'componentWillMount',
      ]);
      
      // 릴리즈 빌드를 위해 모든 개발자 경고 완전히 숨기기
      LogBox.ignoreAllLogs(true);
    }
    
    // 앱 시작 시 백그라운드 서비스 초기화 (AppState 리스너 등록)
    console.log('🔍 App started, background service initialized');
    
    return () => {
      // 앱 종료 시 백그라운드 서비스 정리
      console.log('🔍 App unmounting, cleaning up background service');
      backgroundLiveActivityService.stopBackgroundPolling();
      backgroundLiveActivityService.cleanup();
    };
  }, []);

  return <AppNavigator />;
}

export default App;