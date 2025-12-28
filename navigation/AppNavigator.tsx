import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ClaimScreen from '@/screens/ClaimScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Claim"
        component={ClaimScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
