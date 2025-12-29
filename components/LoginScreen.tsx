import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/Theme";
import PrivyUI from "./login/PrivyUI";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#181121', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon-logo-text.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Explore. Scan. Earn.</Text>
        </View>

        {/* Login Options */}
        <View style={styles.loginContainer}>
          <PrivyUI />
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 200,
    height: 80,
    marginBottom: Theme.spacing.lg,
  },
  tagline: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  loginContainer: {
    width: '100%',
    marginBottom: Theme.spacing.xl,
  },
  footer: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
});
