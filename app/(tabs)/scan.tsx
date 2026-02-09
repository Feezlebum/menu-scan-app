import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { ScanFrame } from '@/src/components/scan/ScanFrame';
import { CaptureButton } from '@/src/components/scan/CaptureButton';
import { compressImage } from '@/src/utils/imageUtils';

type ScanState = 'ready' | 'capturing' | 'processing' | 'error';

export default function ScanScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [facing, setFacing] = useState<CameraType>('back');

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
      
      // TODO: Upload to Supabase Storage and call Edge Function
      // For now, navigate to results with mock data
      console.log('Captured and compressed:', compressedUri);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to results (to be implemented)
      Alert.alert(
        'Scan Complete',
        'Menu captured successfully! AI analysis coming soon.',
        [{ text: 'OK', onPress: () => setScanState('ready') }]
      );

    } catch (error) {
      console.error('Capture error:', error);
      setScanState('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.', [
        { text: 'OK', onPress: () => setScanState('ready') }
      ]);
    }
  };

  const toggleCameraFacing = () => {
    Haptics.selectionAsync();
    setFacing(current => (current === 'back' ? 'front' : 'back'));
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
        facing={facing}
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
          {/* Flip camera button */}
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
            <AppText style={styles.flipIcon}>🔄</AppText>
          </TouchableOpacity>

          {/* Capture button */}
          <CaptureButton
            onPress={handleCapture}
            disabled={scanState !== 'ready'}
            isProcessing={scanState === 'processing'}
          />

          {/* Placeholder for symmetry */}
          <View style={styles.flipButton} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  flipButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {
    fontSize: 28,
  },
});
