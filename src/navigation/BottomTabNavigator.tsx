import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import BoardScreen from '../screens/BoardScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import MyPageScreen from '../screens/MyPageScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
              }}
            >
              <Tab.Screen name="홈" component={HomeScreen} />
              <Tab.Screen name="게시판" component={BoardScreen} />
              <Tab.Screen name="기록실" component={ArchiveScreen} />
              <Tab.Screen name="마이페이지" component={MyPageScreen} />
            </Tab.Navigator>
          </NavigationContainer>
    )
}

export default BottomTabNavigator;