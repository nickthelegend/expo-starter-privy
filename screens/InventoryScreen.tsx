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
const ITEM_SIZE = (width - 48) / 2;

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
        colors={['#000000', '#0a0514', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Inventory</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#6241E8', '#795CEB']}
                style={styles.statGradient}
              >
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statValue}>{userStats.xp}</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#9333EA', '#C084FC']}
                style={styles.statGradient}
              >
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statValue}>{userStats.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
                style={styles.statGradient}
              >
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>{userStats.level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.statGradient}
              >
                <Text style={styles.statIcon}>🏆</Text>
                <Text style={styles.statValue}>{mockInventory.length}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </LinearGradient>
            </View>
          </View>
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
              <View
                style={[
                  styles.itemBorder,
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
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.type === 'TOKEN' && item.amount && (
                  <Text style={styles.itemAmount}>{item.amount} KYRA</Text>
                )}
                <View
                  style={[
                    styles.itemType,
                    { backgroundColor: getRarityColor(item.rarity) },
                  ]}
                >
                  <Text style={styles.itemTypeText}>{item.type}</Text>
                </View>
              </View>
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
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  statCard: {
    width: (width - 48 - 12) / 2,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  statGradient: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Theme.spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
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
    fontWeight: '600',
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
  itemBorder: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    padding: Theme.spacing.md,
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    position: 'relative',
  },
  itemIcon: {
    fontSize: 48,
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemName: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: Theme.spacing.sm,
    marginBottom: 4,
  },
  itemAmount: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: Theme.spacing.xs,
  },
  itemType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemTypeText: {
    color: Theme.colors.text,
    fontSize: 10,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
  },
});
