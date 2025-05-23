// AppNavigator.tsx 또는 NavigationContainer를 렌더링하는 파일

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import MyTeamScreen from '../screens/MyTeamScreen';
import { RootStackParamList } from './RootStackParamList';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 탭 네비게이터를 Stack의 메인으로 */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="MyTeamScreen" component={MyTeamScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;