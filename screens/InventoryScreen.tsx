import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur'; // Unused, removing to avoid dependency issues

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48 - Theme.spacing.md) / 2;

export default function InventoryScreen() {
  const { userStats } = useAppStore();
  const [filter, setFilter] = useState<'ALL' | 'NFT' | 'TOKEN' | 'XP'>('ALL');

  const mockInventory = [
    {
      id: '1',
      type: 'NFT' as const,
      name: 'Pioneer Badge',
      image: '🏆',
      rarity: 'legendary',
      description: 'Awarded to early explorers.',
    },
    {
      id: '2',
      type: 'TOKEN' as const,
      name: 'MNT Token',
      amount: 250,
      image: '🪙',
      rarity: 'common',
      description: 'Native currency of Mantle.',
    },
    {
      id: '3',
      type: 'NFT' as const,
      name: 'Mystery Box',
      image: '🎁',
      rarity: 'epic',
      description: 'Contains a surprise reward.',
    },
    {
      id: '4',
      type: 'TOKEN' as const,
      name: 'XP Potion',
      amount: 1,
      image: '🧪',
      rarity: 'rare',
      description: 'Boosts your XP gain by 10%.',
    },
    {
      id: '5',
      type: 'NFT' as const,
      name: 'Golden Key',
      image: '🔑',
      rarity: 'rare',
      description: 'Unlocks special quests.'
    }
  ];

  const filteredInventory = filter === 'ALL'
    ? mockInventory
    : mockInventory.filter(item => item.type === filter);

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return ['#FFD700', '#FFA500'];
      case 'epic': return ['#D946EF', '#9333EA'];
      case 'rare': return ['#3B82F6', '#2563EB'];
      default: return ['#9CA3AF', '#4B5563'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a103c', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Stats */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.statText}>{userStats.xp} XP</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="flame" size={14} color="#EF4444" />
              <Text style={styles.statText}>{userStats.streak} Day Streak</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="trophy" size={14} color="#60A5FA" />
              <Text style={styles.statText}>Lvl {userStats.level}</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {['ALL', 'NFT', 'TOKEN'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.filterTab,
                filter === f && styles.filterTabActive,
              ]}
            >
              <Text style={[
                styles.filterText,
                filter === f && styles.filterTextActive
              ]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Inventory Grid */}
        <View style={styles.grid}>
          {filteredInventory.map((item) => {
            const colors = getRarityColors(item.rarity);
            return (
              <TouchableOpacity key={item.id} style={styles.cardContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.card}
                >
                  {/* Rarity Border Top */}
                  <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 2, width: '100%', opacity: 0.8 }}
                  />

                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, { shadowColor: colors[0] }]}>
                      <Text style={styles.itemEmoji}>{item.image}</Text>
                    </View>

                    <View style={styles.itemMeta}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemRarity}>{item.rarity.toUpperCase()}</Text>
                    </View>

                    {item.type === 'TOKEN' && (
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>x{item.amount}</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredInventory.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No items found</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: 'white',
    fontFamily: Theme.typography.fontFamily.header,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statText: {
    color: 'white',
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  filterTabActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'black',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: Theme.spacing.md,
  },
  cardContainer: {
    width: ITEM_SIZE,
    marginBottom: Theme.spacing.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    height: 180,
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemMeta: {
    alignItems: 'center',
  },
  itemName: {
    color: 'white',
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.semiBold,
    marginBottom: 4,
    textAlign: 'center',
  },
  itemRarity: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  amountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
});

