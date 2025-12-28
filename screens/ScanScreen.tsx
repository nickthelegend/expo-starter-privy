import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { verifyQRCode } from '@/services/api';

interface ScanScreenProps {
  navigation: any;
}

export default function ScanScreen({ navigation }: ScanScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#181121']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera access is required</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            data-testid="camera-permission-button"
          >
            <LinearGradient
              colors={Theme.gradients.primary}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned) return;
    
    setScanned(true);
    setLoading(true);

    try {
      // Mock QR verification for now
      // const result = await verifyQRCode(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoading(false);
      navigation.navigate('Claim', {
        questId: data,
        reward: 'Mystery NFT',
        rewardType: 'NFT',
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Invalid QR code or quest not found');
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.instructionText}>Scan QR code to claim rewards</Text>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
              <Text style={styles.loadingText}>Verifying...</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            data-testid="scan-cancel-button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 300,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scanFrame: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Theme.colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  instructionText: {
    color: Theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  loadingText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginTop: Theme.spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: Theme.spacing.lg,
  },
  cancelButtonText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  permissionText: {
    color: Theme.colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  permissionButton: {
    width: '100%',
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
