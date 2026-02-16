import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useHistoryStore, getMealPrice } from '@/src/stores/historyStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useSpendingStore } from '@/src/stores/spendingStore';
import { formatMoney } from '@/src/utils/currency';
import {
  getWeeklyScans,
  getWeeklyComparison,
  getCalorieTrend,
  getMacroAverages,
  getTopDishes,
  getWeeklyConsistency,
  getRestaurantBreakdown,
  getMichiRecapMessage,
  getWeeklySpending,
  getSpendingTrend,
  getRestaurantSpending,
  getVerificationAccuracyStats,
} from '@/src/utils/insightsCalculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Assets
const HomeBackground = require('@/assets/botanicals/home-background.png');
const MichiAvatar = require('@/assets/michi-avatar.png');

// ==========================================
// Component
// ==========================================

export default function InsightsScreen() {
  const theme = useAppTheme();
  const { loggedMeals, scans } = useHistoryStore();
  const { goal } = useOnboardingStore();
  const { currency: homeCurrency } = useSpendingStore();

  const [trendPeriod, setTrendPeriod] = useState<7 | 30>(7);

  // Memoized calculations
  const weeklyScans = useMemo(() => getWeeklyScans(scans, 0), [scans]);
  const weeklyComparison = useMemo(() => getWeeklyComparison(scans), [scans]);
  const calorieTrend = useMemo(() => getCalorieTrend(loggedMeals, trendPeriod), [loggedMeals, trendPeriod]);
  const macroAverages = useMemo(() => getMacroAverages(loggedMeals, trendPeriod), [loggedMeals, trendPeriod]);
  const topDishes = useMemo(() => getTopDishes(loggedMeals, 5), [loggedMeals]);
  const consistency = useMemo(() => getWeeklyConsistency(scans, 0), [scans]);
  const restaurants = useMemo(() => getRestaurantBreakdown(scans), [scans]);
  const weekSpending = useMemo(() => getWeeklySpending(loggedMeals, 0), [loggedMeals]);
  const spendingTrend = useMemo(() => getSpendingTrend(loggedMeals), [loggedMeals]);
  const restaurantSpending = useMemo(() => getRestaurantSpending(loggedMeals), [loggedMeals]);
  const accuracyStats = useMemo(() => getVerificationAccuracyStats(loggedMeals), [loggedMeals]);
  const michiRecap = useMemo(() => getMichiRecapMessage(loggedMeals, scans, goal), [loggedMeals, scans, goal]);

  const hasData = scans.length > 0 || loggedMeals.length > 0;
  const weekMeals = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    weekStart.setDate(weekStart.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return loggedMeals.filter((meal) => {
      const d = new Date(meal.loggedAt);
      return d >= weekStart && d <= weekEnd;
    });
  }, [loggedMeals]);

  const mealsWithPrices = useMemo(
    () => weekMeals.filter((meal) => getMealPrice(meal) !== null).length,
    [weekMeals]
  );

  const handleTogglePeriod = (period: 7 | 30) => {
    Haptics.selectionAsync();
    setTrendPeriod(period);
  };

  const handleShareAccuracy = async () => {
    if (accuracyStats.verifiedCount === 0) return;
    Haptics.selectionAsync();
    await Share.share({
      message: `My Michi accuracy score is ${accuracyStats.score}/100 based on ${accuracyStats.verifiedCount} verified meals 📸🍽️`,
    });
  };

  return (
    <ImageBackground source={HomeBackground} style={styles.container} resizeMode="cover">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* 1. Michi's Weekly Recap */}
          <MichiRecapCard theme={theme} recap={michiRecap} />

          {/* 2. Michi Accuracy Score */}
          <VerificationAccuracyCard
            theme={theme}
            stats={accuracyStats}
            onShare={handleShareAccuracy}
          />

          {/* 3. Weekly Scan Summary */}
          <WeeklyScanCard
            theme={theme}
            weeklyScans={weeklyScans}
            comparison={weeklyComparison}
            hasData={hasData}
          />

          {/* 3. Weekly Spending */}
          <WeeklySpendingCard
            theme={theme}
            weekSpending={weekSpending}
            spendingTrend={spendingTrend}
            weekMeals={weekMeals.length}
            mealsWithPrices={mealsWithPrices}
            hasData={loggedMeals.length > 0}
            currency={homeCurrency}
          />

          {/* 4. Cost Breakdown */}
          <CostBreakdownCard
            theme={theme}
            restaurantSpending={restaurantSpending}
            hasData={restaurantSpending.length > 0}
            currency={homeCurrency}
          />

          {/* 5. Calorie & Macro Trends */}
          <NutritionTrendsCard
            theme={theme}
            calorieTrend={calorieTrend}
            macroAverages={macroAverages}
            period={trendPeriod}
            onTogglePeriod={handleTogglePeriod}
            goal={goal}
            hasData={loggedMeals.length > 0}
          />

          {/* 6. Top Choices */}
          <TopChoicesCard theme={theme} dishes={topDishes} hasData={topDishes.length > 0} />

          {/* 5. Weekly Consistency */}
          <ConsistencyCard theme={theme} consistency={consistency} hasData={hasData} />

          {/* 6. Restaurant Breakdown */}
          <RestaurantCard theme={theme} restaurants={restaurants} hasData={restaurants.length > 0} />

          {/* 7. Meal Timing (PRO - Locked) */}
          <ProLockedCard
            theme={theme}
            title="When You Eat"
            previewContent={<MealTimingPreview theme={theme} />}
          />

          {/* 8. Nutrient Deep Dive (PRO - Locked) */}
          <ProLockedCard
            theme={theme}
            title="Nutrient Breakdown"
            previewContent={<NutrientPreview theme={theme} />}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ==========================================
// Card Components
// ==========================================

interface CardProps {
  theme: ReturnType<typeof useAppTheme>;
}

// 1. Michi Recap Card
function MichiRecapCard({ theme, recap }: CardProps & { recap: ReturnType<typeof getMichiRecapMessage> }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardPeach }]}>
      <View style={styles.michiHeader}>
        {/* Dynamic Michi state based on mood */}
        <Image source={recap.michiImage} style={styles.michiAvatar} />
        <AppText style={[styles.michiLabel, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Michi says:
        </AppText>
      </View>
      <AppText style={[styles.michiMessage, { fontFamily: theme.fonts.body.regular, color: theme.colors.text }]}>
        {recap.message}
      </AppText>
    </View>
  );
}

// 2. Verification Accuracy Card
function VerificationAccuracyCard({
  theme,
  stats,
  onShare,
}: CardProps & {
  stats: ReturnType<typeof getVerificationAccuracyStats>;
  onShare: () => void;
}) {
  if (stats.verifiedCount === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}> 
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>Michi Accuracy Score</AppText>
        <EmptyState theme={theme} message="Verify a meal photo to unlock your accuracy score" />
      </View>
    );
  }

  const scoreColor = stats.score >= 85 ? '#2D6A4F' : stats.score >= 70 ? '#8B5E00' : '#B23A48';
  const scoreBg = stats.score >= 85 ? '#E8F5E2' : stats.score >= 70 ? '#FFF5CC' : '#FFE4E8';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}> 
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>Michi Accuracy Score</AppText>

      <View style={styles.accuracyTopRow}>
        <View style={[styles.accuracyScoreBubble, { backgroundColor: scoreBg }]}> 
          <AppText style={[styles.accuracyScoreText, { color: scoreColor }]}>{stats.score}</AppText>
          <AppText style={[styles.accuracyOutOf, { color: scoreColor }]}>/100</AppText>
        </View>

        <View style={styles.accuracyMeta}>
          <AppText style={[styles.accuracyMetaText, { color: theme.colors.text }]}>Based on {stats.verifiedCount} verified meals</AppText>
          <AppText style={[styles.accuracyMetaSub, { color: theme.colors.subtext }]}>Avg calorie difference: ±{stats.avgAbsCalorieDelta} kcal</AppText>
          <AppText style={[styles.accuracyMetaSub, { color: theme.colors.subtext }]}>Avg macro difference: ±{stats.avgAbsMacroDelta} g</AppText>
        </View>
      </View>

      <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.colors.brand }]} onPress={onShare}>
        <FontAwesome name="share-alt" size={14} color="#fff" />
        <AppText style={styles.shareButtonText}>Share my Michi score</AppText>
      </TouchableOpacity>
    </View>
  );
}

// 3. Weekly Scan Card
function WeeklyScanCard({
  theme,
  weeklyScans,
  comparison,
  hasData,
}: CardProps & {
  weeklyScans: ReturnType<typeof getWeeklyScans>;
  comparison: ReturnType<typeof getWeeklyComparison>;
  hasData: boolean;
}) {
  const maxCount = Math.max(...weeklyScans.map((d) => d.count), 1);

  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          This Week
        </AppText>
        <EmptyState theme={theme} message="Scan your first menu to see your weekly stats!" />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
        This Week
      </AppText>

      {/* Bar Chart */}
      <View style={styles.barChart}>
        {weeklyScans.map((day, i) => (
          <View key={i} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: day.count > 0 ? (day.count / maxCount) * 80 : 8,
                    backgroundColor: day.count > 0 ? theme.colors.brand : theme.colors.border,
                  },
                ]}
              />
            </View>
            <AppText style={[styles.barLabel, { color: theme.colors.caption }]}>{day.dayLabel}</AppText>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.scanSummary}>
        <AppText style={[styles.scanCount, { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }]}>
          {comparison.current} scans this week
        </AppText>
        {comparison.previous > 0 && (
          <AppText
            style={[
              styles.scanDiff,
              { color: comparison.isUp ? theme.colors.secondary : theme.colors.brand },
            ]}
          >
            {comparison.isUp ? '↑' : '↓'} {Math.abs(comparison.diff)} {comparison.isUp ? 'more' : 'fewer'} than last week
          </AppText>
        )}
      </View>
    </View>
  );
}

// 3. Weekly Spending Card
function WeeklySpendingCard({
  theme,
  weekSpending,
  spendingTrend,
  weekMeals,
  mealsWithPrices,
  hasData,
  currency,
}: CardProps & {
  weekSpending: number;
  spendingTrend: number;
  weekMeals: number;
  mealsWithPrices: number;
  hasData: boolean;
  currency: import('@/src/types/spending').CurrencyCode;
}) {
  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Weekly Spending
        </AppText>
        <EmptyState theme={theme} message="Scan menus with prices to track spending" />
      </View>
    );
  }

  const avgPerMeal = weekMeals > 0 ? weekSpending / weekMeals : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>Weekly Spending</AppText>
      <View style={styles.spendingRow}>
        <AppText style={[styles.spendingAmount, { color: theme.colors.text }]}>{formatMoney(weekSpending, currency)}</AppText>
        <View style={styles.spendingTrend}>
          {spendingTrend > 0 ? (
            <AppText style={styles.trendUp}>↑ {formatMoney(Math.abs(spendingTrend), currency)} vs last week</AppText>
          ) : spendingTrend < 0 ? (
            <AppText style={styles.trendDown}>↓ {formatMoney(Math.abs(spendingTrend), currency)} vs last week</AppText>
          ) : (
            <AppText style={[styles.trendFlat, { color: theme.colors.subtext }]}>Same as last week</AppText>
          )}
        </View>
      </View>
      <AppText style={[styles.spendingDetail, { color: theme.colors.subtext }]}>
        {formatMoney(avgPerMeal, currency)} per meal · {mealsWithPrices}/{weekMeals} priced
      </AppText>
    </View>
  );
}

// 4. Cost Breakdown Card
function CostBreakdownCard({
  theme,
  restaurantSpending,
  hasData,
  currency,
}: CardProps & {
  restaurantSpending: ReturnType<typeof getRestaurantSpending>;
  hasData: boolean;
  currency: import('@/src/types/spending').CurrencyCode;
}) {
  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Cost Breakdown
        </AppText>
        <EmptyState theme={theme} message="No priced meals yet" />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>Cost Breakdown</AppText>
      {restaurantSpending.slice(0, 3).map(({ restaurant, amount, meals }) => (
        <View key={restaurant} style={styles.breakdownRow}>
          <AppText style={[styles.breakdownRestaurantName, { color: theme.colors.text }]} numberOfLines={1}>
            {restaurant}
          </AppText>
          <View style={styles.breakdownMeta}>
            <AppText style={[styles.breakdownAmount, { color: theme.colors.text }]}>{formatMoney(amount, currency)}</AppText>
            <AppText style={[styles.breakdownMeals, { color: theme.colors.subtext }]}>{meals} meals</AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

// 5. Nutrition Trends Card
function NutritionTrendsCard({
  theme,
  calorieTrend,
  macroAverages,
  period,
  onTogglePeriod,
  goal,
  hasData,
}: CardProps & {
  calorieTrend: ReturnType<typeof getCalorieTrend>;
  macroAverages: ReturnType<typeof getMacroAverages>;
  period: 7 | 30;
  onTogglePeriod: (p: 7 | 30) => void;
  goal: string | null;
  hasData: boolean;
}) {
  const trendingDown = useMemo(() => {
    const withData = calorieTrend.filter((d) => d.mealCount > 0);
    if (withData.length < 3) return false;
    const firstHalf = withData.slice(0, Math.floor(withData.length / 2));
    const secondHalf = withData.slice(Math.floor(withData.length / 2));
    const firstAvg = firstHalf.reduce((s, d) => s + d.avgCalories, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.avgCalories, 0) / secondHalf.length;
    return secondAvg < firstAvg * 0.95;
  }, [calorieTrend]);

  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Nutrition Trends
        </AppText>
        <EmptyState theme={theme} message="Log some meals to see your nutrition trends!" />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.trendHeader}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Nutrition Trends
        </AppText>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => onTogglePeriod(7)}
            style={[
              styles.togglePill,
              period === 7 && { backgroundColor: theme.colors.brand },
              period !== 7 && { borderColor: theme.colors.border, borderWidth: 1 },
            ]}
          >
            <AppText style={[styles.toggleText, { color: period === 7 ? '#fff' : theme.colors.text }]}>7 days</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onTogglePeriod(30)}
            style={[
              styles.togglePill,
              period === 30 && { backgroundColor: theme.colors.brand },
              period !== 30 && { borderColor: theme.colors.border, borderWidth: 1 },
            ]}
          >
            <AppText style={[styles.toggleText, { color: period === 30 ? '#fff' : theme.colors.text }]}>30 days</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sparkline (simple bar representation) */}
      <View style={styles.sparkline}>
        {calorieTrend.slice(-7).map((day, i) => (
          <View
            key={i}
            style={[
              styles.sparkDot,
              {
                height: day.mealCount > 0 ? Math.max(8, (day.avgCalories / 800) * 40) : 4,
                backgroundColor: day.mealCount > 0 ? theme.colors.brand : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      {trendingDown && goal === 'lose' && (
        <View style={[styles.trendBadge, { backgroundColor: theme.colors.cardSage }]}>
          <AppText style={[styles.trendBadgeText, { color: theme.colors.secondary }]}>↓ trending lighter</AppText>
        </View>
      )}

      {/* Macro Pills */}
      <View style={styles.macroPills}>
        <View style={[styles.macroPill, { backgroundColor: theme.colors.cardSage }]}>
          <AppText style={[styles.macroPillText, { color: theme.colors.secondary }]}>
            {macroAverages.protein}g avg protein
          </AppText>
        </View>
        <View style={[styles.macroPill, { backgroundColor: '#FFF5E0' }]}>
          <AppText style={[styles.macroPillText, { color: theme.colors.accent }]}>
            {macroAverages.carbs}g avg carbs
          </AppText>
        </View>
        <View style={[styles.macroPill, { backgroundColor: '#FFE8E0' }]}>
          <AppText style={[styles.macroPillText, { color: theme.colors.brand }]}>
            {macroAverages.fat}g avg fat
          </AppText>
        </View>
      </View>
    </View>
  );
}

// 4. Top Choices Card
function TopChoicesCard({
  theme,
  dishes,
  hasData,
}: CardProps & { dishes: ReturnType<typeof getTopDishes>; hasData: boolean }) {
  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Your Favorites
        </AppText>
        <EmptyState theme={theme} message="Log some meals to see your favorites!" />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
        Your Favorites
      </AppText>

      {dishes.map((dish, i) => (
        <View key={i} style={styles.dishRow}>
          <AppText style={[styles.dishRank, { color: theme.colors.brand }]}>{i + 1}</AppText>
          <View style={styles.dishInfo}>
            <View style={styles.dishNameRow}>
              <AppText
                style={[styles.dishName, { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }]}
                numberOfLines={1}
              >
                {dish.name}
              </AppText>
              <TrafficLightDot tone={dish.trafficLight} size={10} />
            </View>
            <AppText style={[styles.dishMeta, { color: theme.colors.caption }]}>
              {dish.count}x · {dish.restaurantName || 'Various'}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

// 5. Consistency Card
function ConsistencyCard({
  theme,
  consistency,
  hasData,
}: CardProps & { consistency: ReturnType<typeof getWeeklyConsistency>; hasData: boolean }) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getMessage = () => {
    if (consistency.activeDays >= 5) return { text: 'Crushing it!', mood: 'celebrating' };
    if (consistency.activeDays >= 3) return { text: "Solid week!", mood: 'encouraging' };
    return { text: "Let's get back on track!", mood: 'encouraging' };
  };

  const message = getMessage();

  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Consistency
        </AppText>
        <EmptyState theme={theme} message="Start scanning to track your consistency!" />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardSage }]}>
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
        Consistency
      </AppText>

      <View style={styles.consistencyDots}>
        {consistency.days.map((active, i) => (
          <View key={i} style={styles.consistencyDay}>
            <View
              style={[
                styles.consistencyDot,
                {
                  backgroundColor: active ? theme.colors.secondary : 'transparent',
                  borderColor: theme.colors.secondary,
                  borderWidth: active ? 0 : 2,
                },
              ]}
            />
            <AppText style={[styles.consistencyLabel, { color: theme.colors.text }]}>{dayLabels[i]}</AppText>
          </View>
        ))}
      </View>

      <AppText style={[styles.consistencyCount, { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }]}>
        {consistency.activeDays} out of 7 days active
      </AppText>

      <View style={styles.consistencyMessage}>
        {/* TODO: Rive celebrating/encouraging */}
        <Image source={MichiAvatar} style={styles.michiSmall} />
        <AppText style={[styles.consistencyText, { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }]}>
          {message.text}
        </AppText>
      </View>
    </View>
  );
}

// 6. Restaurant Card
function RestaurantCard({
  theme,
  restaurants,
  hasData,
}: CardProps & { restaurants: ReturnType<typeof getRestaurantBreakdown>; hasData: boolean }) {
  const total = restaurants.reduce((s, r) => s + r.visits, 0);

  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardCream }]}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          Where You Eat
        </AppText>
        <EmptyState theme={theme} message="Scan menus at different places to see your breakdown!" />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
        Where You Eat
      </AppText>

      {/* Stacked Bar */}
      <View style={styles.stackedBar}>
        {restaurants.map((r, i) => (
          <View
            key={i}
            style={[
              styles.stackedSegment,
              {
                flex: r.visits / total,
                backgroundColor: r.color,
                borderTopLeftRadius: i === 0 ? 8 : 0,
                borderBottomLeftRadius: i === 0 ? 8 : 0,
                borderTopRightRadius: i === restaurants.length - 1 ? 8 : 0,
                borderBottomRightRadius: i === restaurants.length - 1 ? 8 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Legend */}
      <View style={styles.restaurantLegend}>
        {restaurants.map((r, i) => (
          <View key={i} style={styles.restaurantRow}>
            <View style={[styles.legendDot, { backgroundColor: r.color }]} />
            <AppText style={[styles.restaurantName, { color: theme.colors.text }]} numberOfLines={1}>
              {r.name}
            </AppText>
            <AppText style={[styles.restaurantVisits, { color: theme.colors.caption }]}>{r.visits} visits</AppText>
          </View>
        ))}
      </View>

      {restaurants.length === 1 && (
        <AppText style={[styles.loyalCustomer, { color: theme.colors.caption }]}> 
          Loyal customer! Try scanning somewhere new.
        </AppText>
      )}
    </View>
  );
}

// PRO Locked Card
function ProLockedCard({
  theme,
  title,
  previewContent,
}: CardProps & { title: string; previewContent: React.ReactNode }) {
  const router = useRouter();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.proHeader}>
        <AppText style={[styles.sectionHeader, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
          {title}
        </AppText>
        <View style={[styles.proBadge, { backgroundColor: theme.colors.brand }]}>
          <FontAwesome name="lock" size={10} color="#fff" />
          <AppText style={styles.proBadgeText}>PRO</AppText>
        </View>
      </View>

      <View style={styles.proPreview}>
        {previewContent}
        <View style={styles.proOverlay}>
          <View style={[styles.proLockContainer, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <FontAwesome name="lock" size={24} color={theme.colors.brand} />
            <TouchableOpacity
              style={[styles.proUnlockButton, { backgroundColor: theme.colors.brand }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/paywall-upgrade' as any);
              }}
            >
              <AppText style={styles.proUnlockText}>Unlock with Pro</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// Meal Timing Preview (blurred placeholder)
function MealTimingPreview({ theme }: CardProps) {
  const slots = ['Morning', 'Lunch', 'Afternoon', 'Evening'];
  return (
    <View style={styles.timingPreview}>
      {slots.map((slot, i) => (
        <View key={i} style={styles.timingRow}>
          <AppText style={[styles.timingLabel, { color: theme.colors.caption }]}>{slot}</AppText>
          <View style={[styles.timingBar, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.timingFill, { width: `${30 + i * 15}%`, backgroundColor: theme.colors.brand, opacity: 0.3 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Nutrient Preview (blurred placeholder)
function NutrientPreview({ theme }: CardProps) {
  const nutrients = ['Fiber', 'Sodium', 'Sugar'];
  return (
    <View style={styles.nutrientPreview}>
      {nutrients.map((n, i) => (
        <View key={i} style={styles.nutrientRow}>
          <AppText style={[styles.nutrientLabel, { color: theme.colors.caption }]}>{n}</AppText>
          <View style={[styles.nutrientBar, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.nutrientFill, { width: `${40 + i * 20}%`, backgroundColor: theme.colors.secondary, opacity: 0.3 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Empty State
function EmptyState({ theme, message }: CardProps & { message: string }) {
  return (
    <View style={styles.emptyState}>
      <Image source={MichiAvatar} style={styles.michiEmpty} />
      <AppText style={[styles.emptyText, { fontFamily: theme.fonts.body.regular, color: theme.colors.subtext }]}>
        {message}
      </AppText>
    </View>
  );
}

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },

  // Card base
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },

  // Section headers
  sectionHeader: {
    fontSize: 17,
    marginBottom: 12,
  },

  // Michi Recap
  michiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  michiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  michiLabel: {
    fontSize: 15,
  },
  michiMessage: {
    fontSize: 15,
    lineHeight: 22,
  },

  accuracyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  accuracyScoreBubble: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyScoreText: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  accuracyOutOf: {
    fontSize: 12,
    fontWeight: '700',
  },
  accuracyMeta: {
    flex: 1,
    gap: 3,
  },
  accuracyMetaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  accuracyMetaSub: {
    fontSize: 12,
  },
  shareButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Bar Chart
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 12,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 6,
  },

  // Scan Summary
  scanSummary: {
    alignItems: 'center',
    gap: 4,
  },
  scanCount: {
    fontSize: 15,
  },
  scanDiff: {
    fontSize: 13,
  },

  // Spending
  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  spendingAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  spendingTrend: {
    alignItems: 'flex-end',
  },
  trendUp: {
    color: '#E86B50',
    fontSize: 13,
    fontWeight: '600',
  },
  trendDown: {
    color: '#6BAF7A',
    fontSize: 13,
    fontWeight: '600',
  },
  trendFlat: {
    fontSize: 13,
    fontWeight: '500',
  },
  spendingDetail: {
    fontSize: 13,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D6',
  },
  breakdownRestaurantName: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  breakdownMeta: {
    alignItems: 'flex-end',
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  breakdownMeals: {
    fontSize: 12,
    marginTop: 2,
  },

  // Trend Header
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 12,
  },

  // Sparkline
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
    marginBottom: 12,
  },
  sparkDot: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 3,
  },

  // Trend Badge
  trendBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  trendBadgeText: {
    fontSize: 12,
  },

  // Macro Pills
  macroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  macroPillText: {
    fontSize: 12,
  },

  // Dish Row
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D6',
  },
  dishRank: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
  },
  dishInfo: {
    flex: 1,
  },
  dishNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishName: {
    fontSize: 14,
    flex: 1,
  },
  dishMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Consistency
  consistencyDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  consistencyDay: {
    alignItems: 'center',
    gap: 6,
  },
  consistencyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  consistencyLabel: {
    fontSize: 11,
  },
  consistencyCount: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  consistencyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  michiSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  consistencyText: {
    fontSize: 14,
  },

  // Restaurant
  stackedBar: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  stackedSegment: {
    height: '100%',
  },
  restaurantLegend: {
    gap: 8,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  restaurantName: {
    flex: 1,
    fontSize: 13,
  },
  restaurantVisits: {
    fontSize: 12,
  },
  loyalCustomer: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
  },

  // PRO
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  proPreview: {
    position: 'relative',
    minHeight: 120,
  },
  proOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  proLockContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  proUnlockButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  proUnlockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Timing Preview
  timingPreview: {
    gap: 10,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timingLabel: {
    width: 70,
    fontSize: 12,
  },
  timingBar: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timingFill: {
    height: '100%',
    borderRadius: 8,
  },

  // Nutrient Preview
  nutrientPreview: {
    gap: 10,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nutrientLabel: {
    width: 60,
    fontSize: 12,
  },
  nutrientBar: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  nutrientFill: {
    height: '100%',
    borderRadius: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  michiEmpty: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
