import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ClaimScreen from '@/screens/ClaimScreen';

import QuestDetailScreen from '@/screens/QuestDetailScreen';
import LaunchScreen from '@/screens/LaunchScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import QMapScreen from '@/screens/QMapScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="QMap" component={QMapScreen} />
      <Stack.Screen
        name="Claim"
        component={ClaimScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
