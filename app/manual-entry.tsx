import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';

import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { Card } from '@/src/components/ui/Card';
import { estimateNutrition, parsePrice, type MenuItem } from '@/src/lib/scanService';
import { detectCurrencyFromPriceText, inferCurrencyFromCuisine } from '@/src/utils/currency';
import { convertWithFx } from '@/src/lib/fxService';
import type { CurrencyCode } from '@/src/types/spending';
import { NutritionEditModal } from '@/src/components/modals/NutritionEditModal';
import { useHistoryStore } from '@/src/stores/historyStore';
import { useSpendingStore } from '@/src/stores/spendingStore';
import { useStreakStore } from '@/src/stores/streakStore';

const CUISINE_TYPES = [
  { key: 'american', label: 'American', emoji: '🇺🇸' },
  { key: 'italian', label: 'Italian', emoji: '🇮🇹' },
  { key: 'mexican', label: 'Mexican', emoji: '🇲🇽' },
  { key: 'chinese', label: 'Chinese', emoji: '🇨🇳' },
  { key: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
  { key: 'thai', label: 'Thai', emoji: '🇹🇭' },
  { key: 'indian', label: 'Indian', emoji: '🇮🇳' },
  { key: 'mediterranean', label: 'Mediterranean', emoji: '🇬🇷' },
  { key: 'french', label: 'French', emoji: '🇫🇷' },
  { key: 'other', label: 'Other', emoji: '🌍' },
] as const;

type Step = 1 | 2 | 3;

export default function ManualEntryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { saveScan, logMeal, scans } = useHistoryStore();
  const { currency: homeCurrency, recordSpending } = useSpendingStore();
  const { recordMealDecision } = useStreakStore();

  const [step, setStep] = useState<Step>(1);
  const [itemName, setItemName] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<(typeof CUISINE_TYPES)[number] | null>(null);
  const [nutrition, setNutrition] = useState<Awaited<ReturnType<typeof estimateNutrition>> | null>(null);
  const [nutritionModalVisible, setNutritionModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const canContinue =
    step === 1 ? itemName.trim().length > 2 : step === 2 ? !!selectedCuisine : !!nutrition;

  const headerSubtitle =
    step === 1
      ? 'Tell me about your meal.'
      : step === 2
      ? 'What type of cuisine is this?'
      : 'Review estimated nutrition before saving.';

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => (s - 1) as Step);
  };

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2 && selectedCuisine) {
      const estimate = await estimateNutrition(itemName.trim(), selectedCuisine.key);
      setNutrition(estimate);
      setStep(3);
      return;
    }

    if (step === 3 && nutrition) {
      if (saving) return;
      setSaving(true);
      try {
        const restaurantName = restaurant.trim() || 'Manual Entry';
        const parsedPrice = parsePrice(price.trim() || null);
        const symbolDetection = detectCurrencyFromPriceText(price.trim(), homeCurrency);
        const cuisineDetection = inferCurrencyFromCuisine(selectedCuisine?.key, homeCurrency);
        const detectedCurrency: CurrencyCode =
          symbolDetection.confidence >= cuisineDetection.confidence ? symbolDetection.currency : cuisineDetection.currency;

        const manualItem: MenuItem = {
          name: itemName.trim(),
          description: `Manual entry • ${selectedCuisine?.label ?? 'Other cuisine'}`,
          price: parsedPrice ? parsedPrice.toFixed(2) : null,
          section: 'Manual Entry',
          estimatedCalories: nutrition.estimatedCalories,
          estimatedProtein: nutrition.estimatedProtein,
          estimatedCarbs: nutrition.estimatedCarbs,
          estimatedFat: nutrition.estimatedFat,
          ingredients: [],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          allergenWarning: null,
          modificationTips: ['Estimated values from cuisine + item name.'],
          score: nutrition.score,
          scoreReasons: [nutrition.healthReason],
          trafficLight: nutrition.trafficLight,
          matchLabel: nutrition.matchLabel,
        };

        const existingScan = scans.find(
          (s) => s.restaurantName === restaurantName && new Date(s.scannedAt).getTime() > Date.now() - 30 * 60 * 1000
        );

        const scanId =
          existingScan?.id ??
          saveScan({
            success: true,
            restaurantName,
            restaurantType: 'independent',
            items: [manualItem],
            topPicks: [],
            totalItems: 1,
          });

        const mealId = logMeal(scanId, manualItem, restaurantName, {
          userPrice: parsedPrice ?? undefined,
          userCurrency: detectedCurrency,
          healthyOverride: null,
        });

        if (parsedPrice && parsedPrice > 0) {
          const fx = await convertWithFx(parsedPrice, detectedCurrency, homeCurrency);
          const homePrice = fx?.converted ?? parsedPrice;
          const fxRate = detectedCurrency !== homeCurrency ? Number((fx?.rate ?? (homePrice / parsedPrice)).toFixed(6)) : undefined;

          recordSpending({
            amount: homePrice,
            currency: homeCurrency,
            originalAmount: parsedPrice,
            originalCurrency: detectedCurrency,
            fxRate,
            fxTimestamp: fx?.timestamp ?? new Date().toISOString(),
            currencyConfidence: Math.max(symbolDetection.confidence, cuisineDetection.confidence),
            currencySignals: [symbolDetection.reason, cuisineDetection.reason],
            restaurant: restaurantName,
            mealName: manualItem.name,
            extractionMethod: 'manual',
          });
        }

        recordMealDecision({
          mealId,
          mealName: manualItem.name,
          loggedAt: new Date().toISOString(),
          isHealthy: nutrition.health !== 'indulgent',
          healthyOverride: null,
          overrideUsed: false,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)/history');
      } finally {
        setSaving(false);
      }
    }
  };

  const cuisineSummary = useMemo(() => {
    if (!selectedCuisine) return 'Not selected';
    return `${selectedCuisine.emoji} ${selectedCuisine.label}`;
  }, [selectedCuisine]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={16} color={theme.colors.subtext} />
          <AppText style={[styles.backText, { color: theme.colors.subtext }]}>Back</AppText>
        </TouchableOpacity>
        <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Add Item Manually</AppText>
        <View style={styles.backButton} />
      </View>

      <View style={styles.stepWrap}>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>{headerSubtitle}</AppText>
        <AppText style={[styles.stepText, { color: theme.colors.caption }]}>Step {step} of 3</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.form}>
            <Field label="Item Name *">
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder="e.g., Chicken Caesar Salad"
                placeholderTextColor={theme.colors.caption}
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              />
            </Field>

            <Field label="Restaurant/Location (optional)">
              <TextInput
                value={restaurant}
                onChangeText={setRestaurant}
                placeholder="e.g., Olive Garden"
                placeholderTextColor={theme.colors.caption}
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              />
            </Field>

            <Field label="Price (optional)">
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="e.g., 12.99"
                placeholderTextColor={theme.colors.caption}
                keyboardType="decimal-pad"
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              />
            </Field>
          </View>
        )}

        {step === 2 && (
          <View>
            {CUISINE_TYPES.map((cuisine) => (
              <OptionCard
                key={cuisine.key}
                label={cuisine.label}
                emoji={cuisine.emoji}
                selected={selectedCuisine?.key === cuisine.key}
                onPress={() => setSelectedCuisine(cuisine)}
              />
            ))}
          </View>
        )}

        {step === 3 && nutrition && (
          <Card style={styles.reviewCard}>
            <AppText style={[styles.itemTitle, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>{itemName.trim()}</AppText>
            <AppText style={[styles.detailLine, { color: theme.colors.subtext }]}>{restaurant.trim() || 'Manual Entry'}</AppText>
            <AppText style={[styles.detailLine, { color: theme.colors.subtext }]}>{cuisineSummary}</AppText>

            <View style={styles.nutritionHeaderRow}>
              <AppText style={[styles.detailLine, { color: theme.colors.subtext }]}>Estimated Nutrition</AppText>
              <TouchableOpacity onPress={() => setNutritionModalVisible(true)} style={styles.nutritionEditButton}>
                <FontAwesome name="pencil" size={14} color={theme.colors.brand} />
                <AppText style={[styles.nutritionEditText, { color: theme.colors.brand }]}>Edit</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.nutritionRow}>
              <Metric label="Cal" value={`${nutrition.estimatedCalories}`} />
              <Metric label="P" value={`${nutrition.estimatedProtein}g`} />
              <Metric label="C" value={`${nutrition.estimatedCarbs}g`} />
              <Metric label="F" value={`${nutrition.estimatedFat}g`} />
            </View>

            <AppText style={[styles.reasonText, { color: theme.colors.subtext }]}>{nutrition.healthReason}</AppText>
          </Card>
        )}
      </ScrollView>

      {nutrition ? (
        <NutritionEditModal
          visible={nutritionModalVisible}
          initialValues={{
            estimatedCalories: nutrition.estimatedCalories,
            estimatedProtein: nutrition.estimatedProtein,
            estimatedCarbs: nutrition.estimatedCarbs,
            estimatedFat: nutrition.estimatedFat,
          }}
          onClose={() => setNutritionModalVisible(false)}
          onSave={(values) =>
            setNutrition((prev) =>
              prev
                ? {
                    ...prev,
                    estimatedCalories: values.estimatedCalories,
                    estimatedProtein: values.estimatedProtein,
                    estimatedCarbs: values.estimatedCarbs,
                    estimatedFat: values.estimatedFat,
                  }
                : prev
            )
          }
        />
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={step === 3 ? (saving ? 'Saving...' : 'Add to History') : 'Continue'}
          onPress={handleContinue}
          disabled={!canContinue || saving}
        />
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={styles.field}>
      <AppText style={[styles.fieldLabel, { color: theme.colors.subtext }]}>{label}</AppText>
      {children}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.colors.cardCream }]}> 
      <AppText style={[styles.metricValue, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>{value}</AppText>
      <AppText style={[styles.metricLabel, { color: theme.colors.subtext }]}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: { fontSize: 14 },
  title: { fontSize: 24 },
  stepWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  subtitle: { fontSize: 15, marginBottom: 4 },
  stepText: { fontSize: 12 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  form: { gap: 14 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13 },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  reviewCard: { padding: 16 },
  itemTitle: { fontSize: 20, marginBottom: 6 },
  detailLine: { fontSize: 14, marginBottom: 4 },
  nutritionHeaderRow: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nutritionEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  nutritionEditText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nutritionRow: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  metric: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  metricValue: { fontSize: 16 },
  metricLabel: { fontSize: 12, marginTop: 2 },
  reasonText: { fontSize: 14, lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
});