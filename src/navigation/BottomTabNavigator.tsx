import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import BoardScreen from '../screens/BoardScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import MyPageScreen from '../screens/MyPageScreen';

// 기본 아이콘
import HomeIcon from '../assets/tab_icons/home_icon.svg';
import BoardIcon from '../assets/tab_icons/board_icon.svg';
import ArchiveIcon from '../assets/tab_icons/archive_icon.svg';
import MyIcon from '../assets/tab_icons/my_icon.svg';

// 선택된 아이콘
import HomeSelectIcon from '../assets/tab_icons/home_select_icon.svg';
import BoardSelectIcon from '../assets/tab_icons/board_select_icon.svg';
import ArchiveSelectIcon from '../assets/tab_icons/archive_select_icon.svg';
import MySelectIcon from '../assets/tab_icons/my_select_icon.svg';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#408A21',
        tabBarInactiveTintColor: '#92C17D',
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 8,
        },
        tabBarStyle: {
          paddingTop: 8,
          height: 90, 
        },

      }}
    >
      <Tab.Screen
        name="홈"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? <HomeSelectIcon width={28} height={28} /> : <HomeIcon width={28} height={28} fill={color} />,
        }}
      />
      <Tab.Screen
        name=" 게시판"
        component={BoardScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? <BoardSelectIcon width={28} height={28} /> : <BoardIcon width={28} height={28} fill={color} />,
        }}
      />
      <Tab.Screen
        name="기록실"
        component={ArchiveScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? <ArchiveSelectIcon width={28} height={28} /> : <ArchiveIcon width={28} height={28} fill={color} />,
        }}
      />
      <Tab.Screen
        name="마이"
        component={MyPageScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? <MySelectIcon width={28} height={28} /> : <MyIcon width={28} height={28} fill={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;