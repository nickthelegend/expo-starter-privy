import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';
import { usePrivy } from '@privy-io/expo';
import AutoCarousel from '@/components/AutoCarousel';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = usePrivy();
  const { quests, userStats, dailyCheckInCompleted, completeDailyCheckIn } = useAppStore();
  const scrollX = useRef(new Animated.Value(0)).current;

  const mockQuests = [
    {
      id: '1',
      name: 'Downtown Explorer',
      reward: '100 KYRA',
      rewardType: 'TOKEN' as const,
      distance: '0.5 km',
      rarity: 'rare' as const,
      expiresAt: '2h left',
    },
    {
      id: '2',
      name: 'Mystery NFT Drop',
      reward: 'Rare NFT',
      rewardType: 'NFT' as const,
      distance: '1.2 km',
      rarity: 'epic' as const,
      expiresAt: '5h left',
    },
    {
      id: '3',
      name: 'Community Quest',
      reward: '50 XP',
      rewardType: 'XP' as const,
      distance: '2.1 km',
      rarity: 'common' as const,
      expiresAt: '1d left',
    },
  ];

  const handleCheckIn = () => {
    completeDailyCheckIn();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9333EA';
      case 'rare': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0a0514', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        data-testid="home-screen-scroll"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username} data-testid="user-greeting">
              {user?.id ? 'Explorer' : 'Guest'}
            </Text>
          </View>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Daily Check-in */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Check-in</Text>
          <TouchableOpacity
            style={styles.checkInCard}
            onPress={handleCheckIn}
            disabled={dailyCheckInCompleted}
            data-testid="daily-checkin-button"
          >
            <LinearGradient
              colors={dailyCheckInCompleted ? ['#1E1E1E', '#1E1E1E'] : Theme.gradients.primary}
              style={styles.checkInGradient}
            >
              <Text style={styles.checkInIcon}>
                {dailyCheckInCompleted ? '✅' : '🎯'}
              </Text>
              <Text style={styles.checkInTitle}>
                {dailyCheckInCompleted ? 'Checked In!' : 'Check In Today'}
              </Text>
              <Text style={styles.checkInReward}>
                {dailyCheckInCompleted ? 'Come back tomorrow' : '+10 XP'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Active Quests Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <AutoCarousel data={mockQuests} />
        </View>

        {/* Spin to Earn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spin to Earn</Text>
          <TouchableOpacity
            style={styles.spinCard}
            onPress={() => navigation.navigate('spin/spin')}
            data-testid="spin-to-earn-button"
          >
            <LinearGradient
              colors={['#6241E8', '#9333EA']}
              style={styles.spinGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.spinIcon}>🎰</Text>
              <Text style={styles.spinTitle}>Try Your Luck!</Text>
              <Text style={styles.spinSubtitle}>Spin daily for rewards</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Drops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Drops</Text>
          <View style={styles.featuredContainer}>
            <TouchableOpacity style={styles.featuredCard} data-testid="featured-drop-1">
              <View style={styles.featuredContent}>
                <Text style={styles.featuredIcon}>🏆</Text>
                <View>
                  <Text style={styles.featuredTitle}>Weekly Challenge</Text>
                  <Text style={styles.featuredSubtitle}>Complete 10 quests</Text>
                </View>
              </View>
              <Text style={styles.featuredReward}>500 KYRA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featuredCard} data-testid="featured-drop-2">
              <View style={styles.featuredContent}>
                <Text style={styles.featuredIcon}>🌟</Text>
                <View>
                  <Text style={styles.featuredTitle}>New Explorer</Text>
                  <Text style={styles.featuredSubtitle}>Visit 5 new locations</Text>
                </View>
              </View>
              <Text style={styles.featuredReward}>Rare NFT</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    padding: Theme.spacing.lg,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  section: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  seeAll: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  checkInCard: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  checkInGradient: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  checkInIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  checkInReward: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
  carousel: {
    paddingRight: Theme.spacing.lg,
  },
  questCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginRight: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  questExpiry: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  questName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rewardLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  distanceContainer: {
    backgroundColor: 'rgba(98, 65, 232, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distance: {
    fontSize: 14,
    color: Theme.colors.text,
  },
  questGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  spinCard: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  spinGradient: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  spinIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  spinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  spinSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredContainer: {
    gap: Theme.spacing.md,
  },
  featuredCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  featuredIcon: {
    fontSize: 32,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  featuredReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
});
