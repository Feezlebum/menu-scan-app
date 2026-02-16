import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useHistoryStore } from '@/src/stores/historyStore';
import { verifyMealPhoto, MealVerificationResult } from '@/src/lib/mealVerificationService';

export default function MealVerifyResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealId?: string; photoUri?: string }>();
  const mealId = params.mealId;
  const photoUri = params.photoUri;
  const meal = useHistoryStore((s) => (mealId ? s.getMealById(mealId) : undefined));
  const updateMealVerification = useHistoryStore((s) => s.updateMealVerification);
  const updateMealOverrides = useHistoryStore((s) => s.updateMealOverrides);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealVerificationResult | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!meal || !photoUri) {
        setError('Missing meal or photo.');
        setLoading(false);
        return;
      }
      try {
        const r = await verifyMealPhoto(meal, photoUri);
        if (!mounted) return;
        setResult(r);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Verification failed');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [meal?.id, photoUri]);

  const deltas = useMemo(() => {
    if (!meal || !result) return null;
    return {
      calories: result.revisedCalories - meal.item.estimatedCalories,
      protein: result.revisedProtein - meal.item.estimatedProtein,
      carbs: result.revisedCarbs - meal.item.estimatedCarbs,
      fat: result.revisedFat - meal.item.estimatedFat,
    };
  }, [meal?.id, result]);

  if (!mealId || !meal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <AppText>Meal not found.</AppText>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/history')}>
            <AppText style={styles.link}>Back</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const applyUpdate = () => {
    if (!result || !photoUri) return;
    updateMealOverrides(meal.id, {
      item: {
        estimatedCalories: result.revisedCalories,
        estimatedProtein: result.revisedProtein,
        estimatedCarbs: result.revisedCarbs,
        estimatedFat: result.revisedFat,
      },
    });
    updateMealVerification(meal.id, {
      photoUri,
      verifiedAt: new Date().toISOString(),
      revisedCalories: result.revisedCalories,
      revisedProtein: result.revisedProtein,
      revisedCarbs: result.revisedCarbs,
      revisedFat: result.revisedFat,
      confidence: result.confidence,
      notes: result.notes,
      portionAssessment: result.portionAssessment,
      accepted: true,
    });
    router.replace('/(tabs)/history');
  };

  const keepOriginal = () => {
    if (result && photoUri) {
      updateMealVerification(meal.id, {
        photoUri,
        verifiedAt: new Date().toISOString(),
        revisedCalories: result.revisedCalories,
        revisedProtein: result.revisedProtein,
        revisedCarbs: result.revisedCarbs,
        revisedFat: result.revisedFat,
        confidence: result.confidence,
        notes: result.notes,
        portionAssessment: result.portionAssessment,
        accepted: false,
      });
    }
    router.replace('/(tabs)/history');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF5E6' }]} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <AppText style={styles.title}>{meal.item.name}</AppText>
        {!!meal.restaurantName && <AppText style={styles.subtitle}>{meal.restaurantName}</AppText>}

        {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}

        {loading ? (
          <View style={styles.center}><ActivityIndicator /><AppText>Analyzing your plate…</AppText></View>
        ) : error ? (
          <View style={styles.center}><AppText>{error}</AppText></View>
        ) : result && deltas ? (
          <View style={styles.card}>
            <Row label="Calories" before={meal.item.estimatedCalories} after={result.revisedCalories} />
            <Row label="Protein" before={meal.item.estimatedProtein} after={result.revisedProtein} suffix="g" />
            <Row label="Carbs" before={meal.item.estimatedCarbs} after={result.revisedCarbs} suffix="g" />
            <Row label="Fat" before={meal.item.estimatedFat} after={result.revisedFat} suffix="g" />
            <AppText style={styles.note}>{result.notes}</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Update my log" onPress={applyUpdate} disabled={!result || !!error || loading} />
        <TouchableOpacity onPress={keepOriginal} style={styles.keepBtn}>
          <AppText style={styles.keepText}>Keep original estimate</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, before, after, suffix = '' }: { label: string; before: number; after: number; suffix?: string }) {
  const delta = after - before;
  const deltaText = `${delta > 0 ? '+' : ''}${Math.round(delta)}${suffix}`;
  return (
    <View style={styles.row}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText style={styles.value}>{Math.round(before)}{suffix} → {Math.round(after)}{suffix} ({deltaText})</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#6B5B4E' },
  photo: { width: '100%', height: 180, borderRadius: 14, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { fontWeight: '700' },
  value: { fontSize: 14 },
  note: { marginTop: 10, fontSize: 13, color: '#6B5B4E' },
  footer: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  keepBtn: { alignItems: 'center' },
  keepText: { color: '#6B5B4E', fontSize: 14 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  link: { color: '#2a7', marginTop: 10 },
});
