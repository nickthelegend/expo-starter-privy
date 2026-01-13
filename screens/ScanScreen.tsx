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

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

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
              colors={Theme.gradients.primary as any}
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
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      console.log(`Scanned: ${data}`);

      // Handle deep link format or raw UUID
      let questId = data;
      if (data.includes('kyraquest://quest/')) {
        questId = data.split('kyraquest://quest/')[1];
      }

      // Basic UUID regex check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(questId)) {
        throw new Error("Invalid Quest QR Code");
      }

      // Fetch quest details
      const { supabase } = await import('@/lib/supabase');
      const { data: questData, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (error || !questData) {
        throw new Error("Quest not found");
      }

      setLoading(false);
      // Navigate to QuestDetail
      navigation.navigate('Quests', {
        screen: 'QuestDetail',
        params: { quest: questData }
      });

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Scan Failed', error.message || 'Invalid QR code');
      // Delay before resetting scan to allow user to move camera away
      setTimeout(() => setScanned(false), 2000);
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
    fontFamily: Theme.typography.fontFamily.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  loadingText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginTop: Theme.spacing.sm,
    fontFamily: Theme.typography.fontFamily.regular,
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
    fontFamily: Theme.typography.fontFamily.medium,
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
    fontFamily: Theme.typography.fontFamily.regular,
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
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
});
