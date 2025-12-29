import React from 'react';
import { View, TouchableOpacity, Alert, Linking } from 'react-native';
import { Gallery, GalleryItem } from '@/components/ui/gallery';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/Theme';

interface InventoryItem {
  id: string;
  type: 'NFT' | 'TOKEN';
  name: string;
  rarity: string;
  description: string;
  contractAddress: string;
  amount?: number;
}

interface InventoryGalleryProps {
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
  enableDownload?: boolean;
  enableShare?: boolean;
  onDownload?: (item: GalleryItem) => void;
  onShare?: (item: GalleryItem) => void;
  onExplorer?: (item: InventoryItem) => void;
  renderCustomOverlay?: (item: GalleryItem, index: number, inventoryItem: InventoryItem) => React.ReactNode;
}

export function InventoryGallery({
  items,
  inventoryItems,
  onExplorer,
  renderCustomOverlay,
  ...galleryProps
}: InventoryGalleryProps) {
  
  const handleExplorer = (galleryItem: GalleryItem) => {
    const index = items.findIndex(item => item.id === galleryItem.id);
    const inventoryItem = inventoryItems[index];
    
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
              if (onExplorer) {
                onExplorer(inventoryItem);
              } else {
                Linking.openURL(explorerUrl).catch(() => {
                  Alert.alert('Error', 'Could not open explorer link');
                });
              }
            }
          }
        ]
      );
    }
  };

  // Enhanced overlay that only includes the original custom overlay (no Explorer button)
  const enhancedRenderCustomOverlay = (item: GalleryItem, index: number) => {
    const inventoryItem = inventoryItems[index];
    
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* Original custom overlay only */}
        {renderCustomOverlay && renderCustomOverlay(item, index, inventoryItem)}
      </View>
    );
  };

  return (
    <Gallery
      items={items}
      {...galleryProps}
      renderCustomOverlay={enhancedRenderCustomOverlay}
    />
  );
}