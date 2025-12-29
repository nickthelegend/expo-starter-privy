import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { usePrivy, getUserEmbeddedEthereumWallet, useEmbeddedEthereumWallet, PrivyEmbeddedWalletProvider } from '@privy-io/expo';
import { base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet } from "viem/chains";

interface ProfileScreenProps {
  navigation: any;
}

import { useWalletAvatar } from '@/hooks/useWalletAvatar';

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

  const [mantleBalance, setMantleBalance] = React.useState<string | null>(null);
  const MANTLE_RPC_URL = "https://mantle-sepolia.g.alchemy.com/v2/3qRB0TMQQv3hyKgav_6lF";

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet?.address) return;
      try {
        const { createPublicClient, http, formatEther } = await import("viem");
        const publicClient = createPublicClient({
          chain: mantleSepoliaTestnet,
          transport: http(MANTLE_RPC_URL),
        });
        const balance = await publicClient.getBalance({
          address: wallet.address as `0x${string}`,
        });
        setMantleBalance(formatEther(balance));
      } catch (err) {
        console.error("Error fetching Mantle balance:", err);
      }
    };
    fetchBalance();
  }, [wallet?.address]);

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
        {/* Profile Header with Cover */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#6241E8', '#9333EA', '#000000'] as any}
            style={styles.coverGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={Theme.gradients.primary as any}
                style={styles.avatarBorder}
              >
                <View style={styles.avatarInner}>
                  {wallet?.address ? (
                    <Image
                      source={{ uri: useWalletAvatar(wallet.address) || undefined }}
                      style={styles.avatarImage}
                    />
                  ) : (user as any)?.linked_accounts?.[0]?.picture ? (
                    <Image
                      source={{ uri: (user as any).linked_accounts[0].picture }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user?.id ? user.id.slice(0, 2).toUpperCase() : 'KQ'}
                    </Text>
                  )}
                </View>
              </LinearGradient>
              <View style={styles.onlineBadge} />
            </View>

            <Text style={styles.userName}>
              {user?.id ? `Explorer ${user.id.slice(0, 6)}` : 'Guest Explorer'}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.verificationBadge}>
                <Text style={styles.verificationText}>✅ Verified</Text>
              </View>
              <View style={styles.trustBadgeSmall}>
                <Text style={styles.trustTextSmall}>🌟 Level 3</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Global Stats */}
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>12</Text>
            <Text style={styles.miniStatLabel}>Quests</Text>
          </View>
          <View style={[styles.miniStat, styles.miniStatCenter]}>
            <Text style={styles.miniStatValue}>{mantleBalance ? parseFloat(mantleBalance).toFixed(2) : "0.00"}</Text>
            <Text style={styles.miniStatLabel}>MNT</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>85%</Text>
            <Text style={styles.miniStatLabel}>Trust</Text>
          </View>
        </View>

        {/* Wallet Section */}
        {wallet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Wallet</Text>
            <TouchableOpacity
              style={styles.premiumCard}
              onPress={() => navigation.navigate('WalletDetail')}
            >
              <LinearGradient
                colors={['rgba(98, 65, 232, 0.1)', 'rgba(147, 51, 234, 0.05)'] as any}
                style={styles.cardGradient}
              >
                <View style={styles.walletInfo}>
                  <View style={styles.walletIconContainer}>
                    <Text style={styles.walletEmoji}>💳</Text>
                  </View>
                  <View style={styles.walletTextContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.walletTypeLabel}>{walletType}</Text>
                      <View style={styles.networkBadge}>
                        <Text style={styles.networkText}>Mantle L2</Text>
                      </View>
                    </View>
                    <Text style={styles.walletAddressText} numberOfLines={1}>
                      {wallet.address}
                    </Text>
                    <Text style={[styles.walletTypeLabel, { marginTop: 4, color: Theme.colors.primary }]}>
                      Balance: {mantleBalance ? `${parseFloat(mantleBalance).toFixed(4)} MNT` : 'Loading...'}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.activeIndicator}>
                    <View style={styles.indicatorDot} />
                    <Text style={styles.indicatorText}>Active</Text>
                  </View>
                  <Text style={styles.tapToCopy}>Tap to copy address</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Selection</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.networkScroll}>
            {[
              { ...mantleSepoliaTestnet, icon: '🔥' },
              { ...base, icon: '🔵' },
              { ...polygon, icon: '🟣' },
              { ...arbitrum, icon: '🛡️' },
              { ...optimism, icon: '🔴' },
              { ...mainnet, icon: '💎' },
            ].map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={styles.networkCard}
                onPress={async () => {
                  if (wallets.length > 0) {
                    const provider = await wallets[0].getProvider();
                    switchChain(provider, `0x${chain.id.toString(16)}`);
                  } else {
                    Alert.alert('Error', 'No embedded wallet found');
                  }
                }}
              >
                <Text style={styles.networkIcon}>{chain.icon}</Text>
                <Text style={styles.networkName}>{chain.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsGrid}>
            {[
              { id: 'notif', title: 'Notifications', desc: 'Alerts & Sounds', icon: '🔔' },
              { id: 'loc', title: 'Location', desc: 'Map Visibility', icon: '📍' },
              { id: 'priv', title: 'Privacy', desc: 'Data Usage', icon: '🔒' },
              { id: 'help', title: 'Support', desc: 'Get Assistance', icon: '❓' },
            ].map((item) => (
              <TouchableOpacity key={item.id} style={styles.modernSettingItem}>
                <View style={styles.settingIconBox}>
                  <Text style={styles.settingEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.settingTextBox}>
                  <Text style={styles.settingMainText}>{item.title}</Text>
                  <Text style={styles.settingSubText}>{item.desc}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.logoutButtonModern}
            onPress={handleLogout}
          >
            <Text style={styles.logoutTextModern}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionInfo}>KyraQuest v1.0.0 • Protocol Mainnet</Text>
        </View>
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
  headerContainer: {
    paddingBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.background,
  },
  coverGradient: {
    height: 180,
    width: '100%',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: Theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.md,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    borderRadius: 57,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    borderWidth: 4,
    borderColor: Theme.colors.background,
  },
  userName: {
    fontSize: 26,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  verificationText: {
    color: '#60A5FA',
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  trustBadgeSmall: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trustTextSmall: {
    color: '#FBBF24',
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.card,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.medium,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  miniStatValue: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
  },
  miniStatLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  section: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    opacity: 0.8,
  },
  premiumCard: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardGradient: {
    padding: Theme.spacing.lg,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletTextContainer: {
    flex: 1,
  },
  walletTypeLabel: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 2,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  walletAddressText: {
    fontSize: 16,
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: Theme.spacing.md,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  indicatorText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  tapToCopy: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
    fontFamily: Theme.typography.fontFamily.regular,
  },
  networkScroll: {
    marginHorizontal: -Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
  },
  networkCard: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.md,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  networkIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  networkName: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsGrid: {
    gap: Theme.spacing.md,
  },
  modernSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  settingEmoji: {
    fontSize: 18,
  },
  settingTextBox: {
    flex: 1,
  },
  settingMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  settingSubText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: Theme.colors.textMuted,
    marginLeft: Theme.spacing.sm,
  },
  footerActions: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  logoutButtonModern: {
    width: '100%',
    height: 56,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: Theme.spacing.lg,
  },
  logoutTextModern: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionInfo: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    opacity: 0.5,
  },
  networkBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7C3AED',
    marginLeft: 8,
  },
  networkText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '600',
  },
});
