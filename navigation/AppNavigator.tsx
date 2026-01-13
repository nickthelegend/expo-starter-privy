import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ClaimScreen from '@/screens/ClaimScreen';

import QuestDetailScreen from '@/screens/QuestDetailScreen';
import LaunchScreen from '@/screens/LaunchScreen';
import LeaderboardScreen from '@/screens/LeaderboardScreen';
import QMapScreen from '@/screens/QMapScreen';
import WalletDetailScreen from '@/screens/WalletDetailScreen';
import UploadScreen from '@/screens/UploadScreen';
import ScanScreen from '@/screens/ScanScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="QMap" component={QMapScreen} />
      <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="Claim"
        component={ClaimScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
