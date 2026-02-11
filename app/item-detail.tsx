import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import { useScanStore } from '@/src/stores/scanStore';
import { useHistoryStore } from '@/src/stores/historyStore';
import { BrandedDialog } from '@/src/components/dialogs/BrandedDialog';
import { useTrackerExport } from '@/src/hooks/useTrackerExport';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useStreakStore } from '@/src/stores/streakStore';
import { useSpendingStore } from '@/src/stores/spendingStore';
import { evaluateHealthyChoice } from '@/src/utils/healthyCriteria';
import { isDuplicateMealToday } from '@/src/utils/duplicateDetection';
import { parsePrice } from '@/src/lib/scanService';

export default function ItemDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { selectedItem, setSelectedItem, currentResult } = useScanStore();
  const { saveScan, logMeal, scans, loggedMeals } = useHistoryStore();
  const { exportToTrackers, hasEnabledTrackers } = useTrackerExport();
  const { dailyCalorieTarget, dietType, intolerances, dislikes } = useOnboardingStore();
  const { currentStreak, recordMealDecision } = useStreakStore();
  const { weeklyBudget, getCurrentWeekSpent, recordSpending } = useSpendingStore();
  const [isLogging, setIsLogging] = useState(false);
  const [streakDialogVisible, setStreakDialogVisible] = useState(false);
  const [budgetDialogVisible, setBudgetDialogVisible] = useState(false);
  const [duplicateDialogVisible, setDuplicateDialogVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogPrice, setConfirmDialogPrice] = useState<number | undefined>(undefined);
  const [dialogMessage, setDialogMessage] = useState('');
  const [pendingLogArgs, setPendingLogArgs] = useState<{
    overrideHealthyChoice?: boolean;
    skipStreakWarning?: boolean;
    skipBudgetWarning?: boolean;
    manualPriceOverride?: number;
    skipDuplicateWarning?: boolean;
  } | null>(null);

  if (!selectedItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centered}>
          <AppText style={{ color: theme.colors.text }}>No item selected</AppText>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText style={{ color: theme.colors.brand, marginTop: 16 }}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const item = selectedItem;

  const getScoreColor = (score: number) => {
    if (score >= 70) return theme.colors.trafficGreen;
    if (score >= 40) return theme.colors.trafficAmber;
    return theme.colors.trafficRed;
  };

  const handleClose = () => {
    setSelectedItem(null);
    router.back();
  };

  const generateOrderScript = () => {
    const mods = item.modificationTips || [];
    if (mods.length === 0) {
      return `"Hi, I'd like the ${item.name}, please."`;
    }
    const modText = mods.slice(0, 2).map(m => {
      if (m.toLowerCase().includes('sauce on the side')) return 'with the sauce on the side';
      if (m.toLowerCase().includes('dressing on the side')) return 'with dressing on the side';
      if (m.toLowerCase().includes('no bread')) return 'without the bread';
      if (m.toLowerCase().includes('sub') && m.toLowerCase().includes('salad')) return 'with a side salad instead of fries';
      if (m.toLowerCase().includes('grilled')) return 'grilled instead of fried';
      return m.toLowerCase().replace('ask for ', '').replace('request ', '');
    }).join(', and ');

    return `"Hi, I'd like the ${item.name}, ${modText}, please."`;
  };

  const orderScript = generateOrderScript();


  const shareItem = async () => {
    try {
      await Share.share({
        message: `${item.name} - ${item.estimatedCalories} cal | Score: ${item.score}/100 | ${item.matchLabel}`,
      });
    } catch (e) {
      console.log('Share failed:', e);
    }
  };

  const handleLogMeal = async (
    overrideHealthyChoice: boolean = false,
    skipStreakWarning: boolean = false,
    skipBudgetWarning: boolean = false,
    manualPriceOverride?: number,
    skipDuplicateWarning: boolean = false
  ) => {
    if (isLogging) return;

    const evaluation = evaluateHealthyChoice(item, {
      dailyCalorieGoal: dailyCalorieTarget,
      dietType,
      restrictedFoods: [...(intolerances || []), ...(dislikes || [])],
    });

    const detectedPrice = manualPriceOverride ?? parsePrice(item.price);
    const currentWeekSpent = getCurrentWeekSpent();
    const projectedWeekSpent = currentWeekSpent + (detectedPrice || 0);

    if (!skipBudgetWarning && weeklyBudget && detectedPrice && projectedWeekSpent >= weeklyBudget * 0.9) {
      setDialogMessage(
        `This order will put you at ${Math.round((projectedWeekSpent / weeklyBudget) * 100)}% of your weekly budget\n\nCurrent: $${currentWeekSpent.toFixed(0)} / $${weeklyBudget.toFixed(0)}\nAfter this meal: $${projectedWeekSpent.toFixed(0)} / $${weeklyBudget.toFixed(0)}`
      );
      setPendingLogArgs({ overrideHealthyChoice, skipStreakWarning, skipBudgetWarning: true, manualPriceOverride: detectedPrice, skipDuplicateWarning });
      setBudgetDialogVisible(true);
      return;
    }

    if (!skipStreakWarning && !overrideHealthyChoice && !evaluation.isHealthy && currentStreak > 0) {
      setDialogMessage(`This choice will break your ${currentStreak}-choice streak\n\n• ${evaluation.reasons.join('\n• ')}`);
      setPendingLogArgs({ overrideHealthyChoice: false, skipStreakWarning: true, skipBudgetWarning, manualPriceOverride, skipDuplicateWarning });
      setStreakDialogVisible(true);
      return;
    }

    const restaurantName = currentResult?.restaurantName || null;
    if (!skipDuplicateWarning && isDuplicateMealToday(loggedMeals, item, restaurantName)) {
      setDialogMessage(`You've already logged a similar meal from ${restaurantName || 'this restaurant'} today.`);
      setPendingLogArgs({ overrideHealthyChoice: false, skipStreakWarning: true, skipBudgetWarning: true, manualPriceOverride, skipDuplicateWarning: true });
      setDuplicateDialogVisible(true);
      return;
    }

    setIsLogging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let scanId: string;

      const existingScan = scans.find(
        (s) => s.restaurantName === restaurantName &&
               new Date(s.scannedAt).getTime() > Date.now() - 30 * 60 * 1000
      );

      if (existingScan) {
        scanId = existingScan.id;
      } else if (currentResult) {
        scanId = saveScan(currentResult);
      } else {
        scanId = saveScan({
          success: true,
          restaurantName,
          restaurantType: 'independent',
          items: [item],
          topPicks: [],
          totalItems: 1,
        });
      }

      const mealId = logMeal(scanId, item, restaurantName);

      if (detectedPrice && detectedPrice > 0) {
        recordSpending({
          amount: detectedPrice,
          restaurant: restaurantName || 'Restaurant',
          mealName: item.name,
          extractionMethod: manualPriceOverride !== undefined ? 'manual' : 'ocr',
        });
      }

      const finalHealthy = overrideHealthyChoice || evaluation.isHealthy;
      const nextStreak = finalHealthy ? currentStreak + 1 : 0;
      recordMealDecision({
        mealId,
        mealName: item.name,
        loggedAt: new Date().toISOString(),
        isHealthy: finalHealthy,
        overrideUsed: overrideHealthyChoice,
      });

      if (hasEnabledTrackers) {
        await exportToTrackers({
          foodName: item.name,
          calories: item.estimatedCalories,
          protein: item.estimatedProtein,
          carbs: item.estimatedCarbs,
          fat: item.estimatedFat,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const message = finalHealthy
        ? `🔥 Streak extended to ${nextStreak}! Great choice.`
        : currentStreak > 0
          ? `Streak reset. You made it ${currentStreak} choices - start fresh!`
          : `${item.name} has been saved to your history.`;

      Alert.alert('Meal Logged! ✓', message, [{ text: 'OK', onPress: handleClose }]);
    } catch (error) {
      console.error('Error logging meal:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleConfirmOrder = () => {
    const detectedPrice = parsePrice(item.price);

    const confirmWithPrice = (price: number | undefined) => {
      const currentWeekSpent = getCurrentWeekSpent();
      const projected = currentWeekSpent + (price || 0);

      const message = `${item.name}\nNutrition: ${item.estimatedCalories} cal, ${item.estimatedProtein}g protein\n${price ? `Price: $${price.toFixed(2)}` : 'Price: Not detected'}${weeklyBudget && price ? `\nBudget impact: $${currentWeekSpent.toFixed(0)} → $${projected.toFixed(0)} / $${weeklyBudget.toFixed(0)}` : ''}`;

      setConfirmDialogPrice(price);
      setConfirmDialogMessage(message);
      setConfirmDialogVisible(true);
    };

    if (detectedPrice) {
      confirmWithPrice(detectedPrice);
      return;
    }

    if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
      Alert.prompt(
        'Add Meal Price',
        "We couldn't detect a price. Enter the amount paid:",
        [
          { text: 'Skip', style: 'cancel', onPress: () => confirmWithPrice(undefined) },
          {
            text: 'Use Price',
            onPress: (value?: string) => {
              const parsed = value ? Number.parseFloat(value.replace(/[^0-9.]/g, '')) : NaN;
              confirmWithPrice(Number.isFinite(parsed) ? parsed : undefined);
            },
          },
        ],
        'plain-text'
      );
      return;
    }

    Alert.alert(
      'Price Not Detected',
      'Use a quick estimate for this meal?',
      [
        { text: 'Skip', style: 'cancel', onPress: () => confirmWithPrice(undefined) },
        { text: '$10', onPress: () => confirmWithPrice(10) },
        { text: '$15', onPress: () => confirmWithPrice(15) },
        { text: '$20', onPress: () => confirmWithPrice(20) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <FontAwesome name="chevron-down" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={shareItem} style={styles.shareButton}>
          <FontAwesome name="share" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Score Circle */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(item.score) }]}>
            <AppText style={[styles.scoreNumber, { color: getScoreColor(item.score) }]}>
              {item.score}
            </AppText>
            <AppText style={[styles.scoreLabel, { color: theme.colors.subtext }]}>
              /100
            </AppText>
          </View>
          <AppText style={[styles.matchLabel, { color: getScoreColor(item.score) }]}>
            {item.matchLabel || 'Match'}
          </AppText>
        </View>

        {/* Item Name & Description */}
        <View style={styles.titleSection}>
          <AppText style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name}
          </AppText>
          {item.price && (
            <AppText style={[styles.price, { color: theme.colors.brand }]}>
              {item.price}
            </AppText>
          )}
          {item.description && (
            <AppText style={[styles.description, { color: theme.colors.subtext }]}>
              {item.description}
            </AppText>
          )}
        </View>

        {/* Allergen Warning */}
        {item.allergenWarning && (
          <Card style={[styles.allergenCard, { backgroundColor: theme.colors.trafficRed + '15', borderColor: theme.colors.trafficRed }]}>
            <View style={styles.allergenRow}>
              <FontAwesome name="exclamation-triangle" size={18} color={theme.colors.trafficRed} />
              <AppText style={[styles.allergenText, { color: theme.colors.trafficRed }]}>
                {item.allergenWarning}
              </AppText>
            </View>
            <AppText style={[styles.allergenDisclaimer, { color: theme.colors.trafficRed }]}>
              ⚠️ Always confirm allergens with restaurant staff
            </AppText>
          </Card>
        )}

        {/* Score Reasons */}
        {item.scoreReasons && item.scoreReasons.length > 0 && (
          <Card style={styles.reasonsCard}>
            <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
              Why this score?
            </AppText>
            {item.scoreReasons.map((reason, i) => (
              <View key={i} style={styles.reasonRow}>
                <FontAwesome
                  name={item.score >= 50 ? 'check-circle' : 'info-circle'}
                  size={16}
                  color={item.score >= 50 ? theme.colors.trafficGreen : theme.colors.trafficAmber}
                />
                <AppText style={[styles.reasonText, { color: theme.colors.text }]}>
                  {reason}
                </AppText>
              </View>
            ))}
          </Card>
        )}

        {/* Nutrition */}
        <Card style={styles.nutritionCard}>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
            Estimated Nutrition
          </AppText>
          <View style={styles.nutritionGrid}>
            <NutritionBox
              label="Calories"
              value={item.estimatedCalories}
              unit=""
              theme={theme}
              highlight
            />
            <NutritionBox
              label="Protein"
              value={item.estimatedProtein}
              unit="g"
              theme={theme}
            />
            <NutritionBox
              label="Carbs"
              value={item.estimatedCarbs}
              unit="g"
              theme={theme}
            />
            <NutritionBox
              label="Fat"
              value={item.estimatedFat}
              unit="g"
              theme={theme}
            />
          </View>
          <AppText style={[styles.disclaimer, { color: theme.colors.subtext }]}>
            Nutrition values are estimates and may vary.
          </AppText>
        </Card>

        {/* Dietary Tags */}
        <View style={styles.tagsRow}>
          {item.isVegetarian && (
            <View style={[styles.tag, { backgroundColor: theme.colors.trafficGreen + '20' }]}>
              <AppText style={[styles.tagText, { color: theme.colors.trafficGreen }]}>🥬 Vegetarian</AppText>
            </View>
          )}
          {item.isVegan && (
            <View style={[styles.tag, { backgroundColor: theme.colors.trafficGreen + '20' }]}>
              <AppText style={[styles.tagText, { color: theme.colors.trafficGreen }]}>🌱 Vegan</AppText>
            </View>
          )}
          {item.isGlutenFree && (
            <View style={[styles.tag, { backgroundColor: theme.colors.trafficAmber + '20' }]}>
              <AppText style={[styles.tagText, { color: theme.colors.trafficAmber }]}>🌾 Gluten-Free</AppText>
            </View>
          )}
        </View>

        {/* Modification Tips */}
        {item.modificationTips && item.modificationTips.length > 0 && (
          <Card style={styles.modsCard}>
            <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
              💡 Make it Healthier
            </AppText>
            {item.modificationTips.map((tip, i) => (
              <View key={i} style={styles.modRow}>
                <View style={[styles.modBullet, { backgroundColor: theme.colors.brand }]} />
                <AppText style={[styles.modText, { color: theme.colors.text }]}>
                  {tip}
                </AppText>
              </View>
            ))}
          </Card>
        )}

        {/* What to Say */}
        <Card style={[styles.scriptCard, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.brand }]}>
          <View style={styles.scriptHeader}>
            <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
              🗣️ What to Say
            </AppText>
          </View>
          <AppText style={[styles.scriptText, { color: theme.colors.text }]}>
            {orderScript}
          </AppText>
        </Card>

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <AppText style={[styles.smallTitle, { color: theme.colors.subtext }]}>
              Likely Ingredients
            </AppText>
            <AppText style={[styles.ingredientsList, { color: theme.colors.text }]}>
              {item.ingredients.join(' · ')}
            </AppText>
          </View>
        )}

        {/* Log Button */}
        <TouchableOpacity
          style={[
            styles.logButton,
            { backgroundColor: theme.colors.brand },
            isLogging && { opacity: 0.7 }
          ]}
          onPress={handleConfirmOrder}
          disabled={isLogging}
        >
          <FontAwesome name={isLogging ? 'spinner' : 'plus'} size={18} color="#fff" />
          <AppText style={styles.logButtonText}>
            {isLogging ? 'Logging...' : 'Log This Meal'}
          </AppText>
        </TouchableOpacity>

        {hasEnabledTrackers && (
          <AppText style={[styles.trackerHint, { color: theme.colors.subtext }]}> 
            Will also log to your connected trackers
          </AppText>
        )}
      </ScrollView>

      <BrandedDialog
        visible={streakDialogVisible}
        title="⚠️ Streak Impact"
        message={dialogMessage}
        michiState="worried"
        onClose={() => setStreakDialogVisible(false)}
        actions={[
          { text: 'Pick Something Else', variant: 'secondary', onPress: () => setStreakDialogVisible(false) },
          {
            text: 'Mark Healthy Choice',
            variant: 'primary',
            onPress: () => {
              setStreakDialogVisible(false);
              handleLogMeal(
                true,
                true,
                pendingLogArgs?.skipBudgetWarning,
                pendingLogArgs?.manualPriceOverride,
                pendingLogArgs?.skipDuplicateWarning
              );
            },
          },
          {
            text: 'Confirm Anyway',
            variant: 'danger',
            onPress: () => {
              setStreakDialogVisible(false);
              handleLogMeal(
                false,
                true,
                pendingLogArgs?.skipBudgetWarning,
                pendingLogArgs?.manualPriceOverride,
                pendingLogArgs?.skipDuplicateWarning
              );
            },
          },
        ]}
      />

      <BrandedDialog
        visible={budgetDialogVisible}
        title="💰 Budget Alert"
        message={dialogMessage}
        michiState="thinking"
        onClose={() => setBudgetDialogVisible(false)}
        actions={[
          { text: 'Pick Cheaper Option', variant: 'secondary', onPress: () => setBudgetDialogVisible(false) },
          {
            text: 'Confirm Anyway',
            variant: 'primary',
            onPress: () => {
              setBudgetDialogVisible(false);
              handleLogMeal(
                pendingLogArgs?.overrideHealthyChoice,
                pendingLogArgs?.skipStreakWarning,
                true,
                pendingLogArgs?.manualPriceOverride,
                pendingLogArgs?.skipDuplicateWarning
              );
            },
          },
        ]}
      />

      <BrandedDialog
        visible={duplicateDialogVisible}
        title="Already Logged Today"
        message={dialogMessage}
        michiState="thinking"
        onClose={() => setDuplicateDialogVisible(false)}
        actions={[
          { text: 'Cancel', variant: 'secondary', onPress: () => setDuplicateDialogVisible(false) },
          {
            text: 'Log Anyway',
            variant: 'primary',
            onPress: () => {
              setDuplicateDialogVisible(false);
              handleLogMeal(false, true, true, pendingLogArgs?.manualPriceOverride, true);
            },
          },
        ]}
      />

      <BrandedDialog
        visible={confirmDialogVisible}
        title="Confirm Your Order"
        message={confirmDialogMessage}
        michiState="excited"
        onClose={() => setConfirmDialogVisible(false)}
        actions={[
          { text: 'Back', variant: 'secondary', onPress: () => setConfirmDialogVisible(false) },
          {
            text: 'Confirm Order',
            variant: 'primary',
            onPress: () => {
              setConfirmDialogVisible(false);
              handleLogMeal(false, false, false, confirmDialogPrice, false);
            },
          },
        ]}
      />
    </SafeAreaView>
  );
}

function NutritionBox({ label, value, unit, theme, highlight = false }: {
  label: string;
  value: number;
  unit: string;
  theme: any;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.nutritionBox, highlight && { backgroundColor: theme.colors.secondary }]}>
      <AppText style={[styles.nutritionValue, { color: theme.colors.text }]}>
        {value}{unit}
      </AppText>
      <AppText style={[styles.nutritionLabel, { color: theme.colors.subtext }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 18,
    marginTop: -4,
  },
  matchLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  allergenCard: {
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allergenText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  allergenDisclaimer: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  reasonsCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    flex: 1,
  },
  nutritionCard: {
    padding: 16,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionBox: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    flex: 1,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modsCard: {
    padding: 16,
    marginBottom: 16,
  },
  modRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  modBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  modText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  scriptCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scriptText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  smallTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  ingredientsList: {
    fontSize: 14,
    lineHeight: 20,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  trackerHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
