import Constants from "expo-constants";
import { Stack } from "expo-router";
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_700Bold,
  SpaceGrotesk_500Medium,
} from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { mantleSepolia } from "@/constants/Chains";


import { base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet } from "viem/chains";

export default function RootLayout() {
  const { loadStoredData } = useAppStore();

  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_700Bold,
    SpaceGrotesk_500Medium,
  });

  useEffect(() => {
    loadStoredData();
  }, []);

  return (
    <PrivyProvider
      appId={Constants.expoConfig?.extra?.privyAppId}
      clientId={Constants.expoConfig?.extra?.privyClientId}
      supportedChains={[
        base,
        mainnet,
        optimism,
        arbitrum,
        polygon,
        mantleSepoliaTestnet,
      ]}
      config={{

        embedded: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      <PrivyElements />
    </PrivyProvider>
  );
}
