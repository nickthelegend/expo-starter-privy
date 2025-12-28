import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { usePrivy, getUserEmbeddedEthereumWallet, useEmbeddedEthereumWallet, PrivyEmbeddedWalletProvider } from '@privy-io/expo';
import { base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet } from "viem/chains";

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const embeddedWallet = getUserEmbeddedEthereumWallet(user);
  const externalWallet = (user as any)?.wallet;
  const wallet = embeddedWallet || externalWallet;
  const walletType = embeddedWallet ? 'Embedded Wallet' : 'External Wallet';

  const switchChain = useCallback(
    async (provider: PrivyEmbeddedWalletProvider, id: string) => {
      try {
        console.log(`[NetworkSwitch] Requesting switch to chainId: ${id}`);
        const result = await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: id }],
        });
        console.log(`[NetworkSwitch] Success: result =`, result);
        Alert.alert('Success', `Chain switched successfully to ${id}`);
      } catch (e) {
        console.error(`[NetworkSwitch] Error:`, e);
        Alert.alert('Error', 'Failed to switch chain');
      }
    },
    []
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const copyToClipboard = (text: string) => {
    // Note: Would need expo-clipboard for actual copying
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0a0514', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={Theme.gradients.primary as any}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user?.id ? user.id.slice(0, 2).toUpperCase() : 'KQ'}
            </Text>
          </LinearGradient>
          <Text style={styles.userName} data-testid="profile-user-name">
            {user?.id ? `User ${user.id.slice(0, 8)}` : 'Guest User'}
          </Text>
          <View style={styles.verificationBadge}>
            <Text style={styles.verificationText}>✅ Verified</Text>
          </View>
        </View>

        {/* Wallet Section */}
        {wallet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet</Text>
            <TouchableOpacity
              style={styles.walletCard}
              onPress={() => copyToClipboard(wallet.address)}
              data-testid="wallet-address-card"
            >
              <View style={styles.walletHeader}>
                <Text style={styles.walletLabel}>{walletType}</Text>
                <View style={styles.networkBadge}>
                  <View style={styles.networkDot} />
                  <Text style={styles.networkText}>Connected</Text>
                </View>
              </View>
              <Text style={styles.walletAddress} numberOfLines={1}>
                {wallet.address}
              </Text>
              <Text style={styles.copyHint}>Tap to copy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trust Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trust Level</Text>
          <View style={styles.trustCard}>
            <View style={styles.trustHeader}>
              <Text style={styles.trustLevel}>Level 3</Text>
              <Text style={styles.trustBadge}>🌟 Elite</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={Theme.gradients.primary as any}
                style={[styles.progressFill, { width: '75%' }]}
              />
            </View>
            <Text style={styles.trustDescription}>
              Complete more quests to increase your trust level
            </Text>
          </View>
        </View>

        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network</Text>
          <View style={styles.networkGrid}>
            {[
              base,
              mainnet,
              optimism,
              arbitrum,
              polygon,
              mantleSepoliaTestnet,
            ].map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={styles.networkButton}
                onPress={async () => {
                  if (wallets.length > 0) {
                    const provider = await wallets[0].getProvider();
                    switchChain(provider, `0x${chain.id.toString(16)}`);
                  } else {
                    Alert.alert('Error', 'No embedded wallet found');
                  }
                }}
              >
                <Text style={styles.networkButtonText}>{chain.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            data-testid="notifications-setting"
          >
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Manage notification preferences</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            data-testid="location-setting"
          >
            <Text style={styles.settingIcon}>📍</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Location</Text>
              <Text style={styles.settingDescription}>Enable location services</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            data-testid="privacy-setting"
          >
            <Text style={styles.settingIcon}>🔒</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy</Text>
              <Text style={styles.settingDescription}>Privacy and security settings</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            data-testid="help-setting"
          >
            <Text style={styles.settingIcon}>❓</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>Get help or contact support</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          data-testid="logout-button"
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  verificationBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.success,
  },
  verificationText: {
    color: Theme.colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  walletCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.success,
    marginRight: 6,
  },
  networkText: {
    fontSize: 11,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  copyHint: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  trustCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  trustLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  trustBadge: {
    fontSize: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  trustDescription: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  networkButton: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  networkButtonText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  settingArrow: {
    fontSize: 24,
    color: Theme.colors.textMuted,
  },
  logoutButton: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.error,
    alignItems: 'center',
  },
  logoutText: {
    color: Theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 40,
  },
});
