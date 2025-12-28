import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

interface MapScreenProps {
  navigation: any;
}

const mockMarkers = [
  {
    id: '1',
    coordinate: { latitude: 37.78825, longitude: -122.4324 },
    title: 'Downtown Explorer',
    rarity: 'rare',
  },
  {
    id: '2',
    coordinate: { latitude: 37.79025, longitude: -122.4344 },
    title: 'Mystery NFT Drop',
    rarity: 'epic',
  },
  {
    id: '3',
    coordinate: { latitude: 37.78625, longitude: -122.4304 },
    title: 'Community Quest',
    rarity: 'common',
  },
];

export default function MapScreen({ navigation }: MapScreenProps) {
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9333EA';
      case 'rare': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const handleMarkerPress = (quest: any) => {
    setSelectedQuest(quest);
  };

  const handleScanQR = () => {
    navigation.navigate('Scan');
    setSelectedQuest(null);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={darkMapStyle}
        data-testid="map-view"
      >
        {mockMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)}
            pinColor={getRarityColor(marker.rarity)}
          >
            <View style={[styles.marker, { backgroundColor: getRarityColor(marker.rarity) }]}>
              <Text style={styles.markerText}>🎯</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedQuest && (
        <View style={styles.questModal}>
          <LinearGradient
            colors={['#181121', '#1a0f28']}
            style={styles.questModalGradient}
          >
            <View style={styles.questModalHeader}>
              <Text style={styles.questModalTitle}>{selectedQuest.title}</Text>
              <TouchableOpacity
                onPress={() => setSelectedQuest(null)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: getRarityColor(selectedQuest.rarity) },
              ]}
            >
              <Text style={styles.rarityText}>{selectedQuest.rarity.toUpperCase()}</Text>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanQR}
              data-testid="quest-scan-qr-button"
            >
              <LinearGradient
                colors={Theme.gradients.primary}
                style={styles.scanButtonGradient}
              >
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#181121' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1E1E1E' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a0514' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerText: {
    fontSize: 20,
  },
  questModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
  },
  questModalGradient: {
    padding: Theme.spacing.xl,
  },
  questModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  questModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily.header,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Theme.colors.text,
    fontSize: 16,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: Theme.spacing.lg,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  scanButton: {
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  scanButtonGradient: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  scanButtonText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Theme.typography.fontFamily.header,
  },
});
