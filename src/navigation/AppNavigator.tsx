// AppNavigator.tsx 또는 NavigationContainer를 렌더링하는 파일

import React from 'react';
import { RootStackParamList } from './RootStackParamList';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import BottomTabNavigator from './BottomTabNavigator';
import MyTeamScreen from '../screens/MyTeamScreen';
import TeamPostScreen from '../screens/TeamPostScreen';
import WritePostScreen from '../screens/WritePostScreen';
import DetailPostScreen from '../screens/DetailPostScreen';
import LiveGameScreen from '../screens/LiveGameScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 탭 네비게이터를 Stack의 메인으로 */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="MyTeamScreen" component={MyTeamScreen} />
        <Stack.Screen name="TeamPostScreen" component={TeamPostScreen} />
        <Stack.Screen name="WritePostScreen" component={WritePostScreen} />
        <Stack.Screen name="DetailPostScreen" component={DetailPostScreen}/>
        <Stack.Screen name="LiveGameScreen" component={LiveGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;