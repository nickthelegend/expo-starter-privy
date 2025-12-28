import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
          <LinearGradient
            colors={Theme.gradients.primary}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>KQ</Text>
          </LinearGradient>
          <Text style={styles.appName}>KyraQuest</Text>
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
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.glow,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
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
