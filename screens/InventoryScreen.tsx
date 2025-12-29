import React, { useState, useMemo } from 'react';
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
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { GalleryItem } from '@/components/ui/gallery';
import { InventoryGalleryEnhanced } from '@/components/ui/inventory-gallery-enhanced';

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
      description: 'Awarded to early explorers who discovered the first hidden quests.',
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    },
    {
      id: '2',
      type: 'TOKEN' as const,
      name: 'KYRA Token',
      amount: 250,
      image: '🪙',
      rarity: 'common',
      description: 'Native currency of KyraQuest. Use to unlock premium features.',
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    },
    {
      id: '3',
      type: 'NFT' as const,
      name: 'Mystery Box',
      image: '🎁',
      rarity: 'epic',
      description: 'Contains a surprise reward. Open to discover rare items and bonuses.',
      contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
    },
    {
      id: '4',
      type: 'TOKEN' as const,
      name: 'XP Potion',
      amount: 1,
      image: '🧪',
      rarity: 'rare',
      description: 'Boosts your XP gain by 10% for the next 24 hours.',
      contractAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
    },
    {
      id: '5',
      type: 'NFT' as const,
      name: 'Golden Key',
      image: '🔑',
      rarity: 'rare',
      description: 'Unlocks special legendary quests with exclusive rewards.',
      contractAddress: '0x1111222233334444555566667777888899990000',
    },
    {
      id: '6',
      type: 'NFT' as const,
      name: 'Dragon Egg',
      image: '🥚',
      rarity: 'legendary',
      description: 'A mysterious egg that may hatch into something extraordinary.',
      contractAddress: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
    },
    {
      id: '7',
      type: 'TOKEN' as const,
      name: 'Energy Crystal',
      amount: 5,
      image: '💎',
      rarity: 'epic',
      description: 'Restores quest energy instantly. Perfect for marathon quest sessions.',
      contractAddress: '0x5555eeee4444dddd3333cccc2222bbbb1111aaaa',
    },
    {
      id: '8',
      type: 'NFT' as const,
      name: 'Explorer Badge',
      image: '🗺️',
      rarity: 'common',
      description: 'Shows your dedication to exploration and discovery.',
      contractAddress: '0x0000999988887777666655554444333322221111',
    }
  ];

  const filteredInventory = filter === 'ALL'
    ? mockInventory
    : mockInventory.filter(item => item.type === filter);

  // Transform inventory items to gallery items
  const galleryItems: GalleryItem[] = useMemo(() => {
    return filteredInventory.map((item, index) => ({
      id: item.id,
      uri: `https://api.dicebear.com/7.x/shapes/png?seed=${item.name}&backgroundColor=6241E8,795CEB,9333EA&size=400`,
      title: item.name,
      description: `${item.rarity.toUpperCase()} • ${item.description}${item.type === 'TOKEN' ? ` • Quantity: ${item.amount}` : ''} • Contract: ${item.contractAddress}`,
      thumbnail: `https://api.dicebear.com/7.x/shapes/png?seed=${item.name}&backgroundColor=6241E8,795CEB,9333EA&size=200`
    }));
  }, [filteredInventory]);

  // Share handler
  const handleShare = (galleryItem: GalleryItem) => {
    const index = galleryItems.findIndex(item => item.id === galleryItem.id);
    const inventoryItem = filteredInventory[index];
    
    if (inventoryItem) {
      Alert.alert(
        'Share Item',
        `Share ${inventoryItem.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share', 
            onPress: () => {
              // Here you would implement actual sharing logic
              console.log('Sharing:', inventoryItem.name);
              Alert.alert('Shared!', `${inventoryItem.name} has been shared successfully.`);
            }
          }
        ]
      );
    }
  };

  // Explorer handler (using download button in fullscreen)
  const handleExplorer = (galleryItem: GalleryItem) => {
    const index = galleryItems.findIndex(item => item.id === galleryItem.id);
    const inventoryItem = filteredInventory[index];
    
    if (inventoryItem?.contractAddress) {
      const explorerUrl = `https://sepolia.mantlescan.xyz/address/${inventoryItem.contractAddress}`;
      
      Alert.alert(
        'View in Explorer',
        `Open ${inventoryItem.name} contract in Mantle Explorer?\n\nContract: ${inventoryItem.contractAddress}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Explorer', 
            onPress: () => {
              Linking.openURL(explorerUrl).catch(() => {
                Alert.alert('Error', 'Could not open explorer link');
              });
            }
          }
        ]
      );
    }
  };

  // Helper function to get rarity colors
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9333EA';
      case 'rare': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  // Custom overlay renderer for inventory items
  const renderItemOverlay = (item: GalleryItem, index: number, inventoryItem: any) => {
    if (!inventoryItem) return null;

    return (
      <View style={styles.itemOverlay}>
        {/* Rarity Badge */}
        <View style={[
          styles.rarityBadge,
          { backgroundColor: getRarityColor(inventoryItem.rarity) }
        ]}>
          <Text style={styles.rarityText}>
            {inventoryItem.rarity.toUpperCase()}
          </Text>
        </View>

        {/* Token Amount Badge */}
        {inventoryItem.type === 'TOKEN' && (
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>x{inventoryItem.amount}</Text>
          </View>
        )}

        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{inventoryItem.type}</Text>
        </View>
      </View>
    );
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

        {/* Gallery */}
        <View style={styles.galleryContainer}>
          {galleryItems.length > 0 ? (
            <InventoryGalleryEnhanced
              items={galleryItems}
              inventoryItems={filteredInventory}
              columns={2}
              spacing={6}
              aspectRatio={1.2}
              borderRadius={Theme.borderRadius.lg}
              showTitles={true}
              showDescriptions={false}
              showPages={true}
              enableFullscreen={true}
              enableZoom={true}
              enableShare={true}
              onShare={handleShare}
              renderCustomOverlay={renderItemOverlay}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
                Complete quests to earn rewards and build your collection
              </Text>
            </View>
          )}
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
  galleryContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: Theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    opacity: 0.5,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyText: {
    color: 'white',
    marginTop: 16,
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Overlay styles
  itemOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 8,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontWeight: 'bold',
  },
  typeBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: Theme.typography.fontFamily.medium,
    fontWeight: '600',
  },
});

