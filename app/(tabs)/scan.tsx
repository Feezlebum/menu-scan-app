import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { ScanFrame } from '@/src/components/scan/ScanFrame';
import { CaptureButton } from '@/src/components/scan/CaptureButton';
import { compressImage } from '@/src/utils/imageUtils';
import { scanMenu } from '@/src/lib/scanService';
import { useScanStore } from '@/src/stores/scanStore';

type ScanState = 'ready' | 'capturing' | 'processing' | 'error';

export default function ScanScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('ready');
  const { setScanResult, setScanError } = useScanStore();

  // Request permission on mount if not determined
  useEffect(() => {
    if (!permission?.granted && !permission?.canAskAgain === false) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current || scanState !== 'ready') return;

    try {
      setScanState('capturing');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      setScanState('processing');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Compress image
      const compressedUri = await compressImage(photo.uri);
      console.log('Captured and compressed:', compressedUri);
      
      // Upload to Supabase Storage and call Edge Function
      const result = await scanMenu(compressedUri);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to parse menu');
      }
      
      // Store results and navigate
      setScanResult(result);
      setScanState('ready');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/results');

    } catch (error) {
      console.error('Capture error:', error);
      setScanState('error');
      setScanError(error instanceof Error ? error.message : 'Unknown error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to capture photo. Please try again.', [
        { text: 'OK', onPress: () => setScanState('ready') }
      ]);
    }
  };

  // Permission not yet determined
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <View style={styles.centered}>
          <AppText style={styles.permissionText}>Checking camera access...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centered}>
          <AppText style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Camera Access Required
          </AppText>
          <AppText style={[styles.permissionText, { color: theme.colors.subtext }]}>
            MenuScan needs camera access to scan restaurant menus and provide personalized recommendations.
          </AppText>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: theme.colors.brand }]}
            onPress={requestPermission}
          >
            <AppText style={styles.permissionButtonText}>Grant Access</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <AppText style={styles.headerTitle}>Scan Menu</AppText>
          <AppText style={styles.headerSubtitle}>
            {scanState === 'ready' && 'Position the menu within the frame'}
            {scanState === 'capturing' && 'Capturing...'}
            {scanState === 'processing' && 'Analyzing menu...'}
            {scanState === 'error' && 'Something went wrong'}
          </AppText>
        </SafeAreaView>

        {/* Scan frame overlay */}
        <View style={styles.frameContainer}>
          <ScanFrame isScanning={scanState === 'processing'} />
        </View>

        {/* Controls */}
        <SafeAreaView style={styles.controls}>
          <CaptureButton
            onPress={handleCapture}
            disabled={scanState !== 'ready'}
            isProcessing={scanState === 'processing'}
          />
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
});
