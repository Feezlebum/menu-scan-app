import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, Animated, Easing } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { ScanFrame } from '@/src/components/scan/ScanFrame';
import { CaptureButton } from '@/src/components/scan/CaptureButton';
import { compressImage } from '@/src/utils/imageUtils';
import { uploadMenuImage, parseMenu } from '@/src/lib/scanService';
import { translateMenu } from '@/src/lib/translationService';
import { useScanStore } from '@/src/stores/scanStore';
import { useTranslationStore } from '@/src/stores/translationStore';
import { getScanMichi } from '@/src/utils/michiAssets';
import { BrandedDialog } from '@/src/components/dialogs/BrandedDialog';

type ScanState = 'ready' | 'capturing' | 'processing' | 'error';

const MichiProcessing = require('@/assets/michi-magnifying-glass.png');

export default function ScanScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const processingPulse = useRef(new Animated.Value(1)).current;
  const processingRotate = useRef(new Animated.Value(0)).current;
  const { setScanResult, setScanError } = useScanStore();
  const { setTranslating, setTranslationResult, setTranslationError, clearTranslation } = useTranslationStore();

  // Request permission on mount if not determined
  useEffect(() => {
    if (!permission?.granted && !permission?.canAskAgain === false) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (scanState === 'processing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(processingPulse, { toValue: 1.08, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(processingPulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

      const spin = Animated.loop(
        Animated.timing(processingRotate, { toValue: 1, duration: 2800, easing: Easing.linear, useNativeDriver: true })
      );

      pulse.start();
      spin.start();

      return () => {
        pulse.stop();
        spin.stop();
        processingPulse.setValue(1);
        processingRotate.setValue(0);
      };
    }
  }, [scanState, processingPulse, processingRotate]);

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

      setScanState('ready');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to loading screen immediately
      router.push('/menu-analysis-loading');

      // Process in background
      try {
        // Compress image
        const compressedUri = await compressImage(photo.uri);
        console.log('Captured and compressed:', compressedUri);

        const imageUrl = await uploadMenuImage(compressedUri);

        // Attempt translation first (for non-English menus)
        setTranslating();
        const translationResult = await translateMenu(imageUrl, 'en');

        if (translationResult.success && translationResult.languageCode !== 'en' && translationResult.translatedItems.length > 0) {
          clearTranslation();
          setTranslationResult(translationResult);
          router.replace({
            pathname: '/translation-results' as any,
            params: { translationData: JSON.stringify(translationResult) },
          });
          return;
        }

        clearTranslation();

        // Fallback to standard nutrition scan flow
        const result = await parseMenu(imageUrl);

        if (!result.success) {
          throw new Error(result.error || 'Failed to parse menu');
        }

        // Store results for the loading screen to pick up
        setScanResult(result);

      } catch (backgroundError) {
        console.error('Background processing error:', backgroundError);
        setTranslationError(backgroundError instanceof Error ? backgroundError.message : 'Unknown error');
        setScanError(backgroundError instanceof Error ? backgroundError.message : 'Unknown error');
        // Loading screen will handle showing the error
      }

    } catch (error) {
      console.error('Capture error:', error);
      setScanState('error');
      setScanError(error instanceof Error ? error.message : 'Unknown error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorDialogMessage(error instanceof Error ? error.message : 'Failed to capture photo. Please try again.');
      setErrorDialogVisible(true);
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
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <AppText style={styles.headerTitle}>Scan Menu</AppText>
              <AppText style={styles.headerSubtitle}>
                {scanState === 'ready' && 'Position the menu within the frame'}
                {scanState === 'capturing' && 'Capturing...'}
                {scanState === 'processing' && 'Analyzing menu...'}
                {scanState === 'error' && 'Something went wrong'}
              </AppText>
            </View>
            <Image source={getScanMichi(scanState)} style={styles.michiIndicator} />
          </View>
        </SafeAreaView>

        {/* Scan frame overlay */}
        <View style={styles.frameContainer}>
          <ScanFrame isScanning={scanState === 'processing'} />
          {scanState === 'processing' && (
            <Animated.View
              style={[
                styles.processingMichiWrap,
                {
                  transform: [
                    { scale: processingPulse },
                    {
                      rotate: processingRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={MichiProcessing} style={styles.processingMichi} resizeMode="contain" />
            </Animated.View>
          )}
        </View>

        {/* Controls */}
        <SafeAreaView style={styles.controls}>
          <CaptureButton
            onPress={handleCapture}
            disabled={scanState !== 'ready'}
            isProcessing={scanState === 'processing'}
          />
          <TouchableOpacity
            style={[styles.manualEntryButton, { borderColor: 'rgba(255,255,255,0.55)' }]}
            onPress={() => router.push('/manual-entry' as any)}
            activeOpacity={0.85}
          >
            <FontAwesome name="edit" size={16} color="#FFFFFF" />
            <AppText style={styles.manualEntryText}>Add Item Manually</AppText>
          </TouchableOpacity>
        </SafeAreaView>
      </CameraView>

      <BrandedDialog
        visible={errorDialogVisible}
        title="Scan Error"
        message={errorDialogMessage}
        michiState="worried"
        onClose={() => {
          setErrorDialogVisible(false);
          setScanState('ready');
        }}
        actions={[
          {
            text: 'OK',
            variant: 'primary',
            onPress: () => {
              setErrorDialogVisible(false);
              setScanState('ready');
            },
          },
        ]}
      />
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
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
  michiIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingMichiWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingMichi: {
    width: 120,
    height: 120,
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  manualEntryButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  manualEntryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
