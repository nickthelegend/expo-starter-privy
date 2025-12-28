import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';
import { usePrivy } from '@privy-io/expo';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48 - Theme.spacing.md) / 2;

interface InventoryScreenProps {
  navigation: any;
}

export default function InventoryScreen({ navigation }: InventoryScreenProps) {
  const { rewards, userStats } = useAppStore();
  const { user } = usePrivy();
  const [filter, setFilter] = useState<'ALL' | 'NFT' | 'TOKEN' | 'XP'>('ALL');

  const mockInventory = [
    {
      id: '1',
      type: 'NFT' as const,
      name: 'Explorer Badge #123',
      image: '🏆',
      rarity: 'rare',
    },
    {
      id: '2',
      type: 'TOKEN' as const,
      name: 'KYRA Token',
      amount: 250,
      image: '🪙',
      rarity: 'common',
    },
    {
      id: '3',
      type: 'NFT' as const,
      name: 'Mystery Box NFT',
      image: '🎁',
      rarity: 'epic',
    },
    {
      id: '4',
      type: 'TOKEN' as const,
      name: 'KYRA Token',
      amount: 100,
      image: '🪙',
      rarity: 'common',
    },
  ];

  const filteredInventory = filter === 'ALL'
    ? mockInventory
    : mockInventory.filter(item => item.type === filter);

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
        colors={['#000000', '#0a0514', '#000000'] as any}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Inventory</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsHorizontal}
          >
            {[
              { label: 'Total XP', value: userStats.xp, icon: '⭐', colors: ['#6241E8', '#795CEB'] },
              { label: 'Day Streak', value: userStats.streak, icon: '🔥', colors: ['#9333EA', '#C084FC'] },
              { label: 'Level', value: userStats.level, icon: '🎯', colors: ['#3B82F6', '#60A5FA'] },
              { label: 'Items', value: mockInventory.length, icon: '🏆', colors: ['#10B981', '#34D399'] },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <LinearGradient
                  colors={stat.colors as any}
                  style={styles.statGradient}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['ALL', 'NFT', 'TOKEN', 'XP'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(f as any)}
                data-testid={`filter-${f.toLowerCase()}`}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Inventory Grid */}
        <View style={styles.inventoryGrid}>
          {filteredInventory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.inventoryItem}
              data-testid={`inventory-item-${item.id}`}
            >
              <LinearGradient
                colors={['#181121', '#241a2f'] as any}
                style={[
                  styles.itemCard,
                  { borderColor: getRarityColor(item.rarity) },
                ]}
              >
                <View style={styles.itemContent}>
                  <Text style={styles.itemIcon}>{item.image}</Text>
                  <View
                    style={[
                      styles.rarityIndicator,
                      { backgroundColor: getRarityColor(item.rarity) },
                    ]}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.type === 'TOKEN' && item.amount && (
                    <Text style={styles.itemAmount}>{item.amount} KYRA</Text>
                  )}
                  <View
                    style={[
                      styles.itemType,
                      { backgroundColor: getRarityColor(item.rarity) + '20' },
                      { borderColor: getRarityColor(item.rarity) },
                    ]}
                  >
                    <Text style={[styles.itemTypeText, { color: getRarityColor(item.rarity) }]}>{item.type}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {filteredInventory.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyDescription}>
              Complete quests to earn NFTs and tokens
            </Text>
          </View>
        )}
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
  headerTitle: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  statsHorizontal: {
    paddingRight: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  statCard: {
    width: 140,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  statGradient: {
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Theme.typography.fontFamily.medium,
  },
  filtersContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: Theme.spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  filterTextActive: {
    color: Theme.colors.text,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  inventoryItem: {
    width: ITEM_SIZE,
  },
  itemCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    height: 200, // Fixed height for uniformity
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100, // Reduced height to fit info better
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'relative',
  },
  itemIcon: {
    fontSize: 54,
  },
  rarityIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemInfo: {
    padding: Theme.spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    color: Theme.colors.text,
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.semiBold,
    marginBottom: 2,
  },
  itemAmount: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
    marginBottom: Theme.spacing.xs,
  },
  itemType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  itemTypeText: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.header,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily.regular,
  },
});
