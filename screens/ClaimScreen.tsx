import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { usePrivy, getUserEmbeddedEthereumWallet } from '@privy-io/expo';
import { useAppStore } from '@/store/useAppStore';
import { claimReward } from '@/services/api';

interface ClaimScreenProps {
  navigation: any;
  route: any;
}

export default function ClaimScreen({ navigation, route }: ClaimScreenProps) {
  const { questId, reward, rewardType } = route.params || {};
  const { user } = usePrivy();
  const wallet = getUserEmbeddedEthereumWallet(user);
  const { addReward, updateUserStats } = useAppStore();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    if (!wallet) {
      Alert.alert('Wallet Required', 'Please connect your wallet to claim rewards');
      return;
    }

    setClaiming(true);

    try {
      // Mock claim for now
      // const result = await claimReward(questId, wallet.address);

      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Add reward to store
      addReward({
        id: Date.now().toString(),
        type: rewardType,
        name: reward,
        claimedAt: new Date().toISOString(),
      });

      // Update XP
      updateUserStats({ xp: 50 });

      setClaimed(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
      setClaiming(false);
    }
  };

  const handleDone = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#181121', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        {!claimed ? (
          <>
            {/* Reward Preview */}
            <View style={styles.rewardContainer}>
              <LinearGradient
                colors={['#6241E8', '#9333EA']}
                style={styles.rewardGradient}
              >
                <Text style={styles.rewardIcon}>
                  {rewardType === 'NFT' ? '🇿' : rewardType === 'TOKEN' ? '🪙' : '⭐'}
                </Text>
              </LinearGradient>

              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: Theme.colors.primary },
                ]}
              >
                <Text style={styles.typeBadgeText}>{rewardType}</Text>
              </View>
            </View>

            <Text style={styles.title}>Claim Your Reward</Text>
            <Text style={styles.rewardName}>{reward}</Text>
            <Text style={styles.description}>
              Complete the transaction to claim this reward to your wallet
            </Text>

            {/* Wallet Info */}
            {wallet && (
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Sending to:</Text>
                <Text style={styles.walletAddress} numberOfLines={1}>
                  {wallet.address}
                </Text>
              </View>
            )}

            {/* Claim Button */}
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaim}
              disabled={claiming}
              data-testid="claim-reward-button"
            >
              <LinearGradient
                colors={claiming ? ['#1E1E1E', '#1E1E1E'] : Theme.gradients.primary}
                style={styles.buttonGradient}
              >
                {claiming ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={Theme.colors.text} />
                    <Text style={styles.buttonText}>Claiming...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Claim Reward</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={claiming}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Success State */}
            <View style={styles.successContainer}>
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.successGradient}
              >
                <Text style={styles.successIcon}>✅</Text>
              </LinearGradient>
            </View>

            <Text style={styles.successTitle}>Reward Claimed!</Text>
            <Text style={styles.successDescription}>
              Your {reward} has been successfully claimed and added to your inventory
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>XP Earned</Text>
                <Text style={styles.statValue}>+50</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Rewards</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              data-testid="claim-done-button"
            >
              <LinearGradient
                colors={Theme.gradients.primary}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewInventoryButton}
              onPress={() => navigation.navigate('Inventory')}
            >
              <Text style={styles.viewInventoryText}>View Inventory</Text>
            </TouchableOpacity>
          </>
        )}
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
  rewardContainer: {
    marginBottom: Theme.spacing.xl,
    position: 'relative',
  },
  rewardGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.glow,
  },
  rewardIcon: {
    fontSize: 70,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Theme.colors.background,
  },
  typeBadgeText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  title: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  rewardName: {
    fontSize: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.header,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
    fontFamily: Theme.typography.fontFamily.regular,
  },
  walletInfo: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  walletLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 6,
    fontFamily: Theme.typography.fontFamily.regular,
  },
  walletAddress: {
    fontSize: 14,
    color: Theme.colors.text,
    fontWeight: '500',
    fontFamily: Theme.typography.fontFamily.mono,
  },
  claimButton: {
    width: '100%',
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  buttonGradient: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  buttonText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.header,
  },
  cancelButton: {
    padding: Theme.spacing.md,
  },
  cancelText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Theme.typography.fontFamily.medium,
  },
  successContainer: {
    marginBottom: Theme.spacing.xl,
  },
  successGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 70,
  },
  successTitle: {
    fontSize: 32,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 20,
    fontFamily: Theme.typography.fontFamily.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Theme.colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 6,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.header,
  },
  doneButton: {
    width: '100%',
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  viewInventoryButton: {
    padding: Theme.spacing.md,
  },
  viewInventoryText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
