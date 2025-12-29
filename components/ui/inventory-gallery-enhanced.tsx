import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface GalleryItem {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

interface InventoryItem {
  id: string;
  type: 'NFT' | 'TOKEN';
  name: string;
  rarity: string;
  description: string;
  contractAddress: string;
  amount?: number;
}

interface InventoryGalleryEnhancedProps {
  items: GalleryItem[];
  inventoryItems: InventoryItem[];
  columns?: number;
  spacing?: number;
  borderRadius?: number;
  aspectRatio?: number;
  showPages?: boolean;
  showTitles?: boolean;
  showDescriptions?: boolean;
  enableFullscreen?: boolean;
  enableZoom?: boolean;
  enableShare?: boolean;
  onShare?: (item: GalleryItem) => void;
  renderCustomOverlay?: (item: GalleryItem, index: number, inventoryItem: InventoryItem) => React.ReactNode;
}

export function InventoryGalleryEnhanced({
  items,
  inventoryItems,
  columns = 2,
  spacing = 8,
  borderRadius = 12,
  aspectRatio = 1,
  showPages = false,
  showTitles = true,
  showDescriptions = true,
  enableFullscreen = true,
  enableZoom = true,
  enableShare = false,
  onShare,
  renderCustomOverlay,
}: InventoryGalleryEnhancedProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  const fullscreenFlatListRef = useRef<FlatList>(null);
  const thumbnailFlatListRef = useRef<FlatList>(null);

  const itemWidth = (containerWidth - spacing * (columns - 1) - 24) / columns; // 24 for padding

  const openFullscreen = useCallback((index: number) => {
    if (!enableFullscreen) return;
    setSelectedIndex(index);
    setIsModalVisible(true);

    setTimeout(() => {
      fullscreenFlatListRef.current?.scrollToIndex({
        index,
        animated: false,
      });
      thumbnailFlatListRef.current?.scrollToIndex({
        index,
        animated: false,
        viewPosition: 0.5,
      });
    }, 100);
  }, [enableFullscreen]);

  const closeFullscreen = useCallback(() => {
    setIsModalVisible(false);
    setSelectedIndex(-1);
  }, []);

  const handleItemPress = useCallback((item: GalleryItem, index: number) => {
    if (enableFullscreen) {
      openFullscreen(index);
    }
  }, [enableFullscreen, openFullscreen]);

  const handleThumbnailPress = useCallback((index: number) => {
    setSelectedIndex(index);
    fullscreenFlatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== selectedIndex && newIndex !== null && newIndex !== undefined) {
          setSelectedIndex(newIndex);
          setTimeout(() => {
            thumbnailFlatListRef.current?.scrollToIndex({
              index: newIndex,
              animated: true,
              viewPosition: 0.5,
            });
          }, 100);
        }
      }
    },
    [selectedIndex]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const getCurrentItem = useCallback(() => {
    return selectedIndex >= 0 && selectedIndex < items.length ? items[selectedIndex] : null;
  }, [selectedIndex, items]);

  const getCurrentInventoryItem = useCallback(() => {
    return selectedIndex >= 0 && selectedIndex < inventoryItems.length ? inventoryItems[selectedIndex] : null;
  }, [selectedIndex, inventoryItems]);

  const handleShare = useCallback(() => {
    const currentItem = getCurrentItem();
    if (currentItem && onShare) {
      onShare(currentItem);
    }
  }, [getCurrentItem, onShare]);

  const handleExplorer = useCallback(() => {
    const currentInventoryItem = getCurrentInventoryItem();
    if (currentInventoryItem?.contractAddress) {
      const explorerUrl = `https://sepolia.mantlescan.xyz/address/${currentInventoryItem.contractAddress}`;
      
      Alert.alert(
        'View in Explorer',
        `Open ${currentInventoryItem.name} contract in Mantle Explorer?\n\nContract: ${currentInventoryItem.contractAddress}`,
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
  }, [getCurrentInventoryItem]);

  const renderGalleryItem = useCallback(
    ({ item, index }: { item: GalleryItem; index: number }) => (
      <Pressable
        key={item.id}
        style={[
          {
            width: itemWidth,
            height: itemWidth * aspectRatio,
            borderRadius,
            marginBottom: spacing,
          },
        ]}
        onPress={() => handleItemPress(item, index)}
      >
        <Image
          source={{ uri: item.thumbnail || item.uri }}
          style={[styles.gridImage, { borderRadius }]}
          contentFit="cover"
          transition={200}
        />

        {renderCustomOverlay && renderCustomOverlay(item, index, inventoryItems[index])}

        {(showTitles || showDescriptions) && (
          <View style={styles.itemInfo}>
            {showTitles && item.title && (
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
            )}
            {showDescriptions && item.description && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    ),
    [itemWidth, aspectRatio, borderRadius, spacing, handleItemPress, renderCustomOverlay, inventoryItems, showTitles, showDescriptions]
  );

  const renderFullscreenItem = useCallback(
    ({ item }: { item: GalleryItem }) => (
      <View style={styles.fullscreenImageContainer}>
        <Image
          source={{ uri: item.uri }}
          style={styles.fullscreenImage}
          contentFit="contain"
        />
      </View>
    ),
    []
  );

  const renderFullscreenControls = () => {
    const currentItem = getCurrentItem();
    const currentInventoryItem = getCurrentInventoryItem();

    return (
      <View style={styles.fullscreenControls} pointerEvents="box-none">
        {/* Top controls */}
        <View style={styles.topControls}>
          <View style={styles.topLeftControls}>
            {enableShare && onShare && (
              <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            {currentInventoryItem?.contractAddress && (
              <TouchableOpacity style={styles.controlButton} onPress={handleExplorer}>
                <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Explorer</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.controlButton} onPress={closeFullscreen}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          {showPages && (
            <Text style={styles.pageIndicator}>
              {selectedIndex + 1} of {items.length}
            </Text>
          )}

          {currentItem?.title && (
            <Text style={styles.modalTitle} numberOfLines={1}>
              {currentItem.title}
            </Text>
          )}

          {currentItem?.description && (
            <Text style={styles.modalDescription} numberOfLines={3}>
              {currentItem.description}
            </Text>
          )}

          {/* Thumbnails */}
          <FlatList
            ref={thumbnailFlatListRef}
            data={items}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.thumbnailItem,
                  selectedIndex === index && styles.thumbnailItemSelected,
                ]}
                onPress={() => handleThumbnailPress(index)}
              >
                <Image
                  source={{ uri: item.thumbnail || item.uri }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailContainer}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            getItemLayout={(data, index) => ({
              length: 48,
              offset: 56 * index,
              index,
            })}
          />
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No images to display</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.grid, { gap: spacing }]}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setContainerWidth(width);
        }}
      >
        {items.map((item, index) => renderGalleryItem({ item, index }))}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <View style={styles.modalContainer}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <FlatList
              ref={fullscreenFlatListRef}
              data={items}
              renderItem={renderFullscreenItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={21}
            />
          </GestureHandlerRootView>
          {renderFullscreenControls()}
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridImage: {
    flex: 1,
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  fullscreenControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topLeftControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pageIndicator: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.semiBold,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  thumbnailItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailItemSelected: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});