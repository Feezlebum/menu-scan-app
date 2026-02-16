import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useHistoryStore } from '@/src/stores/historyStore';
import { verifyMealPhoto, MealVerificationResult } from '@/src/lib/mealVerificationService';
import { useAppTheme } from '@/src/theme/theme';
import MichiMoji from '@/src/components/MichiMoji';

export default function MealVerifyResultsScreen() {
  const theme = useAppTheme();
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

  const confidenceMeta = useMemo(() => {
    if (!result) return null;
    if (result.confidence === 'high') return { label: 'High confidence', color: '#2D6A4F', bg: '#E8F5E2' };
    if (result.confidence === 'low') return { label: 'Low confidence', color: '#8B5E00', bg: '#FFF5CC' };
    return { label: 'Medium confidence', color: '#7A4E00', bg: '#FFE9C8' };
  }, [result]);

  const michiCommentary = useMemo(() => {
    if (!result || !deltas) return '';

    const calorieDelta = Math.round(deltas.calories);
    const absCalorieDelta = Math.abs(calorieDelta);

    if (result.portionAssessment === 'as_expected' || absCalorieDelta <= 40) {
      return 'Pretty spot on! Your menu estimate was great 💪';
    }
    if (calorieDelta > 0) {
      if (result.portionAssessment === 'much_larger' || absCalorieDelta >= 180) {
        return `Whoa, that plate looks way bigger than expected — about +${absCalorieDelta} calories 🔍`;
      }
      return `Ooh, generous portion! Looks like about +${absCalorieDelta} calories 🍝`;
    }
    if (result.portionAssessment === 'smaller' || calorieDelta < 0) {
      return `Smaller than expected — around ${absCalorieDelta} fewer calories. Nice budget win ✨`;
    }

    return 'That plate came out pretty differently than the menu estimate — worth updating.';
  }, [result, deltas]);

  if (!mealId || !meal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <AppText>Meal not found.</AppText>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/history')}>
            <AppText style={[styles.link, { color: theme.colors.brand }]}>Back</AppText>
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
      originalCalories: meal.item.estimatedCalories,
      originalProtein: meal.item.estimatedProtein,
      originalCarbs: meal.item.estimatedCarbs,
      originalFat: meal.item.estimatedFat,
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
        originalCalories: meal.item.estimatedCalories,
        originalProtein: meal.item.estimatedProtein,
        originalCarbs: meal.item.estimatedCarbs,
        originalFat: meal.item.estimatedFat,
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
        <AppText style={[styles.title, { color: theme.colors.text }]}>{meal.item.name}</AppText>
        {!!meal.restaurantName && <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>{meal.restaurantName}</AppText>}

        {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}

        {loading ? (
          <View style={styles.center}><ActivityIndicator /><AppText>Analyzing your plate…</AppText></View>
        ) : error ? (
          <View style={styles.center}><AppText>{error}</AppText></View>
        ) : result && deltas ? (
          <View style={styles.card}>
            {confidenceMeta ? (
              <View style={[styles.confidenceBadge, { backgroundColor: confidenceMeta.bg }]}> 
                <AppText style={[styles.confidenceText, { color: confidenceMeta.color }]}>{confidenceMeta.label}</AppText>
              </View>
            ) : null}

            <Row label="Calories" before={meal.item.estimatedCalories} after={result.revisedCalories} />
            <Row label="Protein" before={meal.item.estimatedProtein} after={result.revisedProtein} suffix="g" />
            <Row label="Carbs" before={meal.item.estimatedCarbs} after={result.revisedCarbs} suffix="g" />
            <Row label="Fat" before={meal.item.estimatedFat} after={result.revisedFat} suffix="g" />

            <View style={styles.commentaryRow}>
              <MichiMoji name="sparkle" size={14} />
              <AppText style={styles.commentaryText}>{michiCommentary}</AppText>
            </View>

            <AppText style={styles.note}>{result.notes}</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Update my log" onPress={applyUpdate} disabled={!result || !!error || loading} />
        <TouchableOpacity onPress={keepOriginal} style={styles.keepBtn}>
          <AppText style={[styles.keepText, { color: theme.colors.subtext }]}>Keep original estimate</AppText>
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
  confidenceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { fontWeight: '700' },
  value: { fontSize: 14 },
  commentaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
  },
  commentaryText: {
    flex: 1,
    fontSize: 14,
    color: '#3F332C',
    fontWeight: '600',
  },
  note: { marginTop: 2, fontSize: 13, color: '#6B5B4E' },
  footer: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  keepBtn: { alignItems: 'center' },
  keepText: { color: '#6B5B4E', fontSize: 14 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  link: { color: '#2a7', marginTop: 10 },
});
