import { SafeAreaView, Text, View } from "react-native";
import SplashScreen from "@/components/SplashScreen";
import React, { useState, useEffect } from "react";
import Constants from "expo-constants";
import LoginScreen from "@/components/LoginScreen";
import { usePrivy } from "@privy-io/expo";
import { Theme } from "@/constants/Theme";
import { useAppStore } from "@/store/useAppStore";
import OnboardingScreen from "@/screens/OnboardingScreen";
import AppNavigator from "@/navigation/AppNavigator";

export default function Index() {
  const { user, isReady } = usePrivy();
  const { hasCompletedOnboarding, loadStoredData } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadStoredData();
      setLoading(false);
    };
    init();
  }, []);

  if ((Constants.expoConfig?.extra?.privyAppId as string).length !== 25) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: Theme.colors.text, textAlign: 'center' }}>
            You have not set a valid `privyAppId` in app.json
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    !(Constants.expoConfig?.extra?.privyClientId as string).startsWith("client-")
  ) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: Theme.colors.text, textAlign: 'center' }}>
            You have not set a valid `privyClientId` in app.json
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !isReady) {
    return <SplashScreen />;
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={() => { }} />;
  }

  // Show login if no user
  if (!user) {
    return <LoginScreen />;
  }

  // Show main app
  return <AppNavigator />;
}
