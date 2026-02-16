import { getMealPrice } from '@/src/stores/historyStore';
import type { LoggedMeal, ScanHistoryEntry } from '@/src/stores/historyStore';
import type { Goal } from '@/src/stores/onboardingStore';
import { MichiAssets } from '@/src/utils/michiAssets';

// ==========================================
// Date Helpers
// ==========================================

/**
 * Get start of week (Monday) for a given date
 */
function getWeekStart(date: Date, weekOffset: number = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff + weekOffset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get array of dates for a week (Mon-Sun)
 */
function getWeekDates(weekOffset: number = 0): Date[] {
  const start = getWeekStart(new Date(), weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * Check if two dates are the same day
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get date N days ago
 */
function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ==========================================
// Weekly Scan Stats
// ==========================================

export interface DailyScanCount {
  dayLabel: string; // 'Mon', 'Tue', etc.
  count: number;
  date: Date;
}

/**
 * Get scan counts for each day of a week
 */
export function getWeeklyScans(
  scans: ScanHistoryEntry[],
  weekOffset: number = 0
): DailyScanCount[] {
  const weekDates = getWeekDates(weekOffset);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return weekDates.map((date, i) => {
    const count = scans.filter((scan) => {
      const scanDate = new Date(scan.scannedAt);
      return isSameDay(scanDate, date);
    }).length;

    return {
      dayLabel: dayLabels[i],
      count,
      date,
    };
  });
}

/**
 * Get total scans for a week
 */
export function getTotalWeeklyScans(scans: ScanHistoryEntry[], weekOffset: number = 0): number {
  return getWeeklyScans(scans, weekOffset).reduce((sum, day) => sum + day.count, 0);
}

// ==========================================
// Calorie & Macro Trends
// ==========================================

export interface DailyCalories {
  date: Date;
  avgCalories: number;
  mealCount: number;
}

/**
 * Get daily average calories for a period
 */
export function getCalorieTrend(meals: LoggedMeal[], days: number): DailyCalories[] {
  const result: DailyCalories[] = [];
  const startDate = getDaysAgo(days - 1);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.loggedAt);
      return isSameDay(mealDate, date);
    });

    const totalCalories = dayMeals.reduce(
      (sum, meal) => sum + (meal.item.estimatedCalories || 0),
      0
    );

    result.push({
      date,
      avgCalories: dayMeals.length > 0 ? Math.round(totalCalories / dayMeals.length) : 0,
      mealCount: dayMeals.length,
    });
  }

  return result;
}

export interface MacroAverages {
  protein: number;
  carbs: number;
  fat: number;
  totalMeals: number;
}

/**
 * Get average macros for a period
 */
export function getMacroAverages(meals: LoggedMeal[], days: number): MacroAverages {
  const startDate = getDaysAgo(days - 1);
  const relevantMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.loggedAt);
    return mealDate >= startDate;
  });

  if (relevantMeals.length === 0) {
    return { protein: 0, carbs: 0, fat: 0, totalMeals: 0 };
  }

  const totals = relevantMeals.reduce(
    (acc, meal) => ({
      protein: acc.protein + (meal.item.estimatedProtein || 0),
      carbs: acc.carbs + (meal.item.estimatedCarbs || 0),
      fat: acc.fat + (meal.item.estimatedFat || 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  return {
    protein: Math.round(totals.protein / relevantMeals.length),
    carbs: Math.round(totals.carbs / relevantMeals.length),
    fat: Math.round(totals.fat / relevantMeals.length),
    totalMeals: relevantMeals.length,
  };
}

/**
 * Check if calorie trend is going down
 */
export function isCalorieTrendDown(meals: LoggedMeal[], days: number): boolean {
  const trend = getCalorieTrend(meals, days);
  const mealsWithData = trend.filter((d) => d.mealCount > 0);
  
  if (mealsWithData.length < 3) return false;
  
  const firstHalf = mealsWithData.slice(0, Math.floor(mealsWithData.length / 2));
  const secondHalf = mealsWithData.slice(Math.floor(mealsWithData.length / 2));
  
  const firstAvg = firstHalf.reduce((s, d) => s + d.avgCalories, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, d) => s + d.avgCalories, 0) / secondHalf.length;
  
  return secondAvg < firstAvg * 0.95; // 5% decrease threshold
}

// ==========================================
// Spending
// ==========================================

export function getWeeklySpending(meals: LoggedMeal[], weekOffset: number = 0): number {
  const today = new Date();
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  weekStart.setDate(weekStart.getDate() + mondayOffset - (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return meals.reduce((total, meal) => {
    const mealDate = new Date(meal.loggedAt);
    if (mealDate < weekStart || mealDate > weekEnd) return total;
    const price = getMealPrice(meal);
    return total + (price || 0);
  }, 0);
}

export function getSpendingTrend(meals: LoggedMeal[]): number {
  const thisWeek = getWeeklySpending(meals, 0);
  const lastWeek = getWeeklySpending(meals, 1);
  return thisWeek - lastWeek;
}

export interface RestaurantSpending {
  restaurant: string;
  amount: number;
  meals: number;
}

export function getRestaurantSpending(meals: LoggedMeal[]): RestaurantSpending[] {
  const spending: Record<string, { amount: number; meals: number }> = {};

  meals.forEach((meal) => {
    const price = getMealPrice(meal);
    if (!price || !meal.restaurantName) return;

    if (!spending[meal.restaurantName]) {
      spending[meal.restaurantName] = { amount: 0, meals: 0 };
    }

    spending[meal.restaurantName].amount += price;
    spending[meal.restaurantName].meals += 1;
  });

  return Object.entries(spending)
    .map(([restaurant, data]) => ({ restaurant, ...data }))
    .sort((a, b) => b.amount - a.amount);
}

// ==========================================
// Top Dishes
// ==========================================

export interface TopDish {
  name: string;
  count: number;
  restaurantName: string | null;
  trafficLight: 'green' | 'amber' | 'red';
}

/**
 * Get most-logged dishes aggregated by name
 */
export function getTopDishes(meals: LoggedMeal[], limit: number = 5): TopDish[] {
  const dishMap = new Map<string, { count: number; restaurantName: string | null; trafficLight: 'green' | 'amber' | 'red' }>();

  meals.forEach((meal) => {
    const key = meal.item.name.toLowerCase().trim();
    const existing = dishMap.get(key);
    
    if (existing) {
      existing.count++;
    } else {
      dishMap.set(key, {
        count: 1,
        restaurantName: meal.restaurantName,
        trafficLight: meal.item.trafficLight,
      });
    }
  });

  return Array.from(dishMap.entries())
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      count: data.count,
      restaurantName: data.restaurantName,
      trafficLight: data.trafficLight,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ==========================================
// Weekly Consistency
// ==========================================

export interface WeeklyConsistency {
  days: boolean[]; // Mon-Sun, true if user scanned
  activeDays: number;
}

/**
 * Get which days of the week user was active
 */
export function getWeeklyConsistency(scans: ScanHistoryEntry[], weekOffset: number = 0): WeeklyConsistency {
  const dailyScans = getWeeklyScans(scans, weekOffset);
  const days = dailyScans.map((d) => d.count > 0);
  const activeDays = days.filter(Boolean).length;

  return { days, activeDays };
}

// ==========================================
// Restaurant Breakdown
// ==========================================

export interface RestaurantVisit {
  name: string;
  visits: number;
  avgHealthRating: number; // 0-100 based on traffic lights
  color: string; // For chart display
}

const RESTAURANT_COLORS = ['#E86B50', '#6BAF7A', '#F4A261', '#5ABAB7'];

/**
 * Get restaurant visit breakdown
 */
export function getRestaurantBreakdown(scans: ScanHistoryEntry[]): RestaurantVisit[] {
  const restaurantMap = new Map<string, { visits: number; healthScores: number[] }>();

  scans.forEach((scan) => {
    const name = scan.restaurantName || 'Unknown Restaurant';
    const existing = restaurantMap.get(name);
    
    // Calculate health score from top picks
    const healthScores = scan.topPicks.map((pick) => {
      if (pick.trafficLight === 'green') return 100;
      if (pick.trafficLight === 'amber') return 60;
      return 30;
    });
    const avgScore = healthScores.length > 0 
      ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length 
      : 50;

    if (existing) {
      existing.visits++;
      existing.healthScores.push(avgScore);
    } else {
      restaurantMap.set(name, { visits: 1, healthScores: [avgScore] });
    }
  });

  return Array.from(restaurantMap.entries())
    .map(([name, data], index) => ({
      name,
      visits: data.visits,
      avgHealthRating: Math.round(
        data.healthScores.reduce((a, b) => a + b, 0) / data.healthScores.length
      ),
      color: RESTAURANT_COLORS[index % RESTAURANT_COLORS.length],
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 4);
}

// ==========================================
// Michi Recap Message
// ==========================================

export interface MichiRecap {
  message: string;
  emoji: 'eyes' | 'sad' | 'fire' | 'workout' | 'celebrate' | 'sparkle';
  mood: 'celebrating' | 'encouraging' | 'concerned' | 'thinking';
  michiImage: any; // Require asset for the mood
}

/**
 * Generate Michi's weekly recap message based on data
 */
export function getMichiRecapMessage(
  meals: LoggedMeal[],
  scans: ScanHistoryEntry[],
  goal: Goal | null
): MichiRecap {
  const thisWeekScans = getTotalWeeklyScans(scans, 0);
  const lastWeekScans = getTotalWeeklyScans(scans, -1);
  
  const thisWeekMacros = getMacroAverages(meals, 7);
  const lastWeekMacros = getMacroAverages(meals.filter((m) => {
    const date = new Date(m.loggedAt);
    const weekAgo = getDaysAgo(14);
    const twoWeeksAgo = getDaysAgo(7);
    return date >= weekAgo && date < twoWeeksAgo;
  }), 7);

  // No data at all
  if (thisWeekScans === 0 && lastWeekScans === 0) {
    return {
      message: "Scan some menus and I'll start tracking your patterns!",
      emoji: 'eyes',
      mood: 'thinking',
      michiImage: MichiAssets.thinking,
    };
  }

  // Scanning less than last week
  if (thisWeekScans < lastWeekScans && lastWeekScans > 0) {
    return {
      message: "I miss you! Let's scan more this week.",
      emoji: 'sad',
      mood: 'concerned',
      michiImage: MichiAssets.concerned,
    };
  }

  // Calories trending down + goal is lose
  const caloriesTrendingDown = isCalorieTrendDown(meals, 7);
  if (caloriesTrendingDown && goal === 'lose') {
    return {
      message: "You're eating lighter this week — keep it up!",
      emoji: 'fire',
      mood: 'celebrating',
      michiImage: MichiAssets.celebrating,
    };
  }

  // Protein increasing
  if (thisWeekMacros.protein > lastWeekMacros.protein * 1.1 && lastWeekMacros.protein > 0) {
    return {
      message: "More protein this week — Michi approves.",
      emoji: 'workout',
      mood: 'celebrating',
      michiImage: MichiAssets.celebrating,
    };
  }

  // Scanning more consistently
  if (thisWeekScans >= lastWeekScans && thisWeekScans >= 3) {
    return {
      message: "You're staying on track! Consistency wins.",
      emoji: 'celebrate',
      mood: 'celebrating',
      michiImage: MichiAssets.celebrating,
    };
  }

  // Default encouraging message
  return {
    message: "Keep scanning and I'll find more patterns for you!",
    emoji: 'sparkle',
    mood: 'encouraging',
    michiImage: MichiAssets.encouraging,
  };
}

// ==========================================
// Period Comparison
// ==========================================

export interface PeriodComparison {
  current: number;
  previous: number;
  diff: number;
  isUp: boolean;
}

/**
 * Compare scans between this week and last week
 */
export function getWeeklyComparison(scans: ScanHistoryEntry[]): PeriodComparison {
  const current = getTotalWeeklyScans(scans, 0);
  const previous = getTotalWeeklyScans(scans, -1);
  const diff = current - previous;

  return {
    current,
    previous,
    diff,
    isUp: diff >= 0,
  };
}

// ==========================================
// Meal Verification Accuracy
// ==========================================

export interface VerificationAccuracyStats {
  score: number; // 0-100 (higher is closer to menu estimate)
  verifiedCount: number;
  avgAbsCalorieDelta: number;
  avgAbsMacroDelta: number;
}

function safePercentDelta(original: number, revised: number): number {
  const base = Math.max(1, Math.abs(original));
  return Math.abs(revised - original) / base;
}

export function getVerificationAccuracyStats(meals: LoggedMeal[]): VerificationAccuracyStats {
  const verified = meals.filter((meal) => meal.verification);

  if (verified.length === 0) {
    return {
      score: 0,
      verifiedCount: 0,
      avgAbsCalorieDelta: 0,
      avgAbsMacroDelta: 0,
    };
  }

  const totals = verified.reduce(
    (acc, meal) => {
      const v = meal.verification!;
      const originalCalories = v.originalCalories ?? meal.item.estimatedCalories;
      const originalProtein = v.originalProtein ?? meal.item.estimatedProtein;
      const originalCarbs = v.originalCarbs ?? meal.item.estimatedCarbs;
      const originalFat = v.originalFat ?? meal.item.estimatedFat;

      const calorieDelta = Math.abs(v.revisedCalories - originalCalories);
      const macroDelta =
        (Math.abs(v.revisedProtein - originalProtein) +
          Math.abs(v.revisedCarbs - originalCarbs) +
          Math.abs(v.revisedFat - originalFat)) /
        3;

      const relativeDelta =
        (safePercentDelta(originalCalories, v.revisedCalories) +
          safePercentDelta(originalProtein, v.revisedProtein) +
          safePercentDelta(originalCarbs, v.revisedCarbs) +
          safePercentDelta(originalFat, v.revisedFat)) /
        4;

      acc.calorieDelta += calorieDelta;
      acc.macroDelta += macroDelta;
      acc.relativeDelta += relativeDelta;
      return acc;
    },
    { calorieDelta: 0, macroDelta: 0, relativeDelta: 0 }
  );

  const avgRelativeDelta = totals.relativeDelta / verified.length;
  const score = Math.max(0, Math.round(100 - avgRelativeDelta * 100));

  return {
    score,
    verifiedCount: verified.length,
    avgAbsCalorieDelta: Math.round(totals.calorieDelta / verified.length),
    avgAbsMacroDelta: Math.round(totals.macroDelta / verified.length),
  };
}
