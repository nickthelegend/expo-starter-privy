import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface SimpleGalleryItem {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

interface SimpleGalleryProps {
  items: SimpleGalleryItem[];
  columns?: number;
  spacing?: number;
  borderRadius?: number;
  aspectRatio?: number;
  showTitles?: boolean;
  showDescriptions?: boolean;
  onItemPress?: (item: SimpleGalleryItem, index: number) => void;
}

export function SimpleGallery({
  items,
  columns = 2,
  spacing = 16,
  borderRadius = 12,
  aspectRatio = 1,
  showTitles = true,
  showDescriptions = true,
  onItemPress,
}: SimpleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  const itemWidth = (containerWidth - spacing * (columns - 1) - 48) / columns; // 48 for padding

  const openFullscreen = (index: number) => {
    setSelectedIndex(index);
    setIsModalVisible(true);
  };

  const closeFullscreen = () => {
    setIsModalVisible(false);
    setSelectedIndex(-1);
  };

  const handleItemPress = (item: SimpleGalleryItem, index: number) => {
    if (onItemPress) {
      onItemPress(item, index);
    } else {
      openFullscreen(index);
    }
  };

  const renderGalleryItem = (item: SimpleGalleryItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.gridItem,
        {
          width: itemWidth,
          height: itemWidth * aspectRatio,
          borderRadius,
          marginBottom: spacing,
        },
      ]}
      onPress={() => handleItemPress(item, index)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnail || item.uri }}
        style={[styles.gridImage, { borderRadius }]}
        contentFit="cover"
        transition={200}
      />
      
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
    </TouchableOpacity>
  );

  const getCurrentItem = () => {
    return selectedIndex >= 0 && selectedIndex < items.length
      ? items[selectedIndex]
      : null;
  };

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No images to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setContainerWidth(width);
        }}
      >
        <View style={[styles.grid, { gap: spacing }]}>
          {items.map((item, index) => renderGalleryItem(item, index))}
        </View>
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeFullscreen} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            {getCurrentItem() && (
              <Image
                source={{ uri: getCurrentItem()!.uri }}
                style={styles.fullscreenImage}
                contentFit="contain"
              />
            )}
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={goToPrevious}
              style={[styles.navButton, selectedIndex === 0 && styles.navButtonDisabled]}
              disabled={selectedIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={selectedIndex === 0 ? "rgba(255,255,255,0.3)" : "white"} 
              />
            </TouchableOpacity>

            <View style={styles.imageInfo}>
              <Text style={styles.pageIndicator}>
                {selectedIndex + 1} of {items.length}
              </Text>
              {getCurrentItem()?.title && (
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {getCurrentItem()!.title}
                </Text>
              )}
              {getCurrentItem()?.description && (
                <Text style={styles.modalDescription} numberOfLines={3}>
                  {getCurrentItem()!.description}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={goToNext}
              style={[styles.navButton, selectedIndex === items.length - 1 && styles.navButtonDisabled]}
              disabled={selectedIndex === items.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={selectedIndex === items.length - 1 ? "rgba(255,255,255,0.3)" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenHeight * 0.6,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  navButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  imageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageIndicator: {
    fontSize: 14,
    color: Theme.colors.textMuted,
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
  },
});