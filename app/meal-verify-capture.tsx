import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { useHistoryStore } from '@/src/stores/historyStore';

export default function MealVerifyCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealId?: string }>();
  const mealId = params.mealId;
  const meal = useHistoryStore((s) => (mealId ? s.getMealById(mealId) : undefined));
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);

  if (!mealId || !meal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#111' }]}>
        <View style={styles.centered}>
          <AppText style={styles.text}>Meal not found.</AppText>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/history')}>
            <AppText style={styles.link}>Back to history</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return <SafeAreaView style={[styles.container, { backgroundColor: '#111' }]} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#111' }]}>
        <View style={styles.centered}>
          <AppText style={styles.text}>Camera permission is needed to verify your plate.</AppText>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
            <AppText style={styles.permissionText}>Grant Camera Access</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, shutterSound: false });
      if (!photo?.uri) throw new Error('Capture failed');
      router.replace({ pathname: '/meal-verify-results' as any, params: { mealId, photoUri: photo.uri } });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <SafeAreaView style={styles.top}>
          <AppText style={styles.title}>Take a photo of your plate</AppText>
          <AppText style={styles.subtitle}>Michi will compare it to {meal.item.name}</AppText>
        </SafeAreaView>

        <SafeAreaView style={styles.bottom}>
          <TouchableOpacity style={styles.capture} onPress={handleCapture} disabled={capturing} />
          <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
            <FontAwesome name="close" size={18} color="#fff" />
            <AppText style={styles.cancelText}>Cancel</AppText>
          </TouchableOpacity>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  top: { padding: 20, alignItems: 'center' },
  bottom: { alignItems: 'center', paddingBottom: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginTop: 6 },
  capture: { width: 76, height: 76, borderRadius: 38, borderWidth: 6, borderColor: '#fff', backgroundColor: '#eee' },
  cancel: { marginTop: 16, flexDirection: 'row', gap: 8, alignItems: 'center' },
  cancelText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: '#fff', textAlign: 'center', fontSize: 16 },
  link: { color: '#8fd', marginTop: 12, fontSize: 15 },
  permissionBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E86B50' },
  permissionText: { color: '#fff', fontWeight: '600' },
});
