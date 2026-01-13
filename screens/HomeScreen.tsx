import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import AutoCarousel from '@/components/AutoCarousel';
import ClaimModal from '@/components/ClaimModal';
import { ScanIcon } from '@/components/TabIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = usePrivy();
  const { quests, userStats, dailyCheckInCompleted, completeDailyCheckIn } = useAppStore();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [earnedReward, setEarnedReward] = useState<{ type: 'XP' | 'TOKEN' | 'NFT', amount?: number, name: string }>({ type: 'XP', amount: 10, name: 'Daily Check-in' });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState<any>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { supabase } = await import('@/lib/supabase');

      // 1. Get Active Season
      const { data: season } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();

      if (season) setActiveSeason(season);

      // 2. Get Stats for Season
      // Ideally join players, but for now just raw stats or if we have players table
      // If "season_stats" is empty (new season), we might show "No data"
      let query = supabase
        .from('season_stats')
        .select('*, player_wallet')
        .order('total_xp', { ascending: false })
        .limit(10);

      if (season) {
        query = query.eq('season_id', season.id);
      }

      const { data: stats } = await query;
      if (stats && stats.length > 0) {
        setLeaderboard(stats);
      } else {
        // Fallback: If no season stats yet, just show 'players' sorted by high score if you have a legacy table, 
        // OR just show empty state. Let's show empty state or mock if completely empty for demo?
        // For demo purposes, if empty, we might keep the "mock" data? 
        // No, user asked for "Leaderboard Seasons", so let's try to be real.
        // But if I just created the table, it IS empty.
        // So I should probably insert some dummy data if empty so the UI doesn't look broken.
      }
    };
    fetchLeaderboard();
  }, []);

  const mockQuests = [
    {
      id: '1',
      name: 'Downtown Explorer',
      reward: '100 KYRA',
      rewardType: 'TOKEN' as const,
      distance: '0.5 km',
      rarity: 'rare' as const,
      expiresAt: '2h left',
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
    },
    {
      id: '2',
      name: 'Mystery NFT Drop',
      reward: 'Rare NFT',
      rewardType: 'NFT' as const,
      distance: '1.2 km',
      rarity: 'epic' as const,
      expiresAt: '5h left',
      coordinate: { latitude: 37.79025, longitude: -122.4344 },
    },
    {
      id: '3',
      name: 'Community Quest',
      reward: '50 XP',
      rewardType: 'XP' as const,
      distance: '2.1 km',
      rarity: 'common' as const,
      expiresAt: '1d left',
      coordinate: { latitude: 37.78625, longitude: -122.4304 },
    },
  ];

  const handleCheckIn = () => {
    completeDailyCheckIn();
    setEarnedReward({ type: 'XP', amount: 10, name: 'Daily Check-in Reward' });
    setShowClaimModal(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9333EA';
      case 'rare': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const { wallets } = useEmbeddedEthereumWallet();
  const wallet = wallets.find(w => w.chainType === 'ethereum');
  const userAddress = wallet?.address || (user as any)?.wallet?.address;
  const avatarUrl = userAddress
    ? `https://api.dicebear.com/7.x/identicon/png?seed=${userAddress}`
    : (user as any)?.linked_accounts?.[0]?.picture;

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
          <Image
            source={require('../assets/images/icon-logo-text.png')}
            style={styles.logoText}
            resizeMode="contain"
          />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username} data-testid="user-greeting">
                {user?.id ? 'Explorer' : 'Guest'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => navigation.navigate('Scan')}
              >
                <ScanIcon width={24} height={24} fill="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <LinearGradient
                  colors={Theme.gradients.primary as any}
                  style={styles.avatarBorder}
                >
                  <View style={styles.avatarInner}>
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarEmoji}>👤</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Quests Carousel - Now at the top */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Quests')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <AutoCarousel data={mockQuests} />
        </View>

        {/* Quest Fast Finish Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeSeason ? activeSeason.name : "Global Leaderboard"}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderboardContainer}>
            {leaderboard.length === 0 ? (
              <Text style={{ color: Theme.colors.textMuted, padding: 20, textAlign: 'center' }}>
                No data for this season yet. Be the first!
              </Text>
            ) : (
              leaderboard.slice(0, 3).map((player, index) => {
                let rankIcon = '👏';
                if (index === 0) rankIcon = '🥇';
                if (index === 1) rankIcon = '🥈';
                if (index === 2) rankIcon = '🥉';

                return (
                  <View key={player.id || index} style={styles.leaderboardItem}>
                    <View style={styles.leaderboardLeft}>
                      <Text style={styles.rankText}>{rankIcon}</Text>
                      <Text style={styles.leaderboardName}>
                        {player.player_wallet
                          ? `...${player.player_wallet.slice(-4)}`
                          : `Explorer ${index + 1}`
                        }
                      </Text>
                    </View>
                    <Text style={styles.leaderboardTime}>{player.total_xp} XP</Text>
                  </View>
                );
              })
            )}
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
              colors={dailyCheckInCompleted ? ['#1E1E1E', '#1E1E1E'] as any : Theme.gradients.primary as any}
              style={styles.checkInGradient}
            >
              <Text style={styles.checkInIcon}>
                {dailyCheckInCompleted ? '✅' : '🎯'}
              </Text>
              <Text style={styles.checkInTitle}>
                {dailyCheckInCompleted ? 'Checked In!' : 'Check In Today'}
              </Text>
              <Text style={styles.checkInReward}>
                {dailyCheckInCompleted ? '+0 XP' : '+10 XP'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
      <ClaimModal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        reward={earnedReward}
      />
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
  logoText: {
    height: 40,
    width: 120,
    marginBottom: Theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    borderRadius: 25,
    ...Theme.shadows.glow,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarBorder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
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
    fontFamily: Theme.typography.fontFamily.header,
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
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  leaderboardContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankText: {
    fontSize: 20,
  },
  leaderboardName: {
    color: Theme.colors.text,
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  leaderboardTime: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  seeAll: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.semiBold,
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
    fontFamily: Theme.typography.fontFamily.header,
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
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: Theme.colors.text,
  },
  questExpiry: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  questName: {
    fontSize: 22,
    fontFamily: Theme.typography.fontFamily.header,
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
    fontFamily: Theme.typography.fontFamily.header,
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
    fontFamily: Theme.typography.fontFamily.header,
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
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  featuredReward: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: Theme.colors.primary,
  },
});
