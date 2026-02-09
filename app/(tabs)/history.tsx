import React, { useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useHistoryStore, LoggedMeal } from '@/src/stores/historyStore';
import { useScanStore } from '@/src/stores/scanStore';

interface MealSection {
  title: string;
  date: string;
  data: LoggedMeal[];
}

export default function HistoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { loggedMeals, scans, getScanById } = useHistoryStore();
  const { setSelectedItem } = useScanStore();

  // Group meals by date
  const sections = useMemo((): MealSection[] => {
    const grouped: Record<string, LoggedMeal[]> = {};
    
    loggedMeals.forEach((meal) => {
      const dateKey = meal.loggedAt.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meal);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
      .map(([dateKey, meals]) => ({
        title: formatDateHeader(dateKey),
        date: dateKey,
        data: meals,
      }));
  }, [loggedMeals]);

  const handleMealPress = (meal: LoggedMeal) => {
    Haptics.selectionAsync();
    setSelectedItem(meal.item);
    router.push('/item-detail');
  };

  // Calculate totals for a date
  const getDayTotals = (meals: LoggedMeal[]) => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.item.estimatedCalories,
        protein: acc.protein + meal.item.estimatedProtein,
        carbs: acc.carbs + meal.item.estimatedCarbs,
        fat: acc.fat + meal.item.estimatedFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const renderSectionHeader = ({ section }: { section: MealSection }) => {
    const totals = getDayTotals(section.data);
    
    return (
      <View style={[styles.sectionHeader, { backgroundColor: theme.colors.bg }]}>
        <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {section.title}
        </AppText>
        <View style={styles.sectionTotals}>
          <AppText style={[styles.totalText, { color: theme.colors.subtext }]}>
            {totals.calories} cal · {totals.protein}g P · {totals.carbs}g C · {totals.fat}g F
          </AppText>
        </View>
      </View>
    );
  };

  const renderMeal = ({ item: meal }: { item: LoggedMeal }) => {
    const time = new Date(meal.loggedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity 
        onPress={() => handleMealPress(meal)}
        activeOpacity={0.7}
      >
        <Card style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealLeft}>
              <TrafficLightDot tone={meal.item.trafficLight} size={12} />
              <View style={styles.mealInfo}>
                <AppText style={[styles.mealName, { color: theme.colors.text }]} numberOfLines={1}>
                  {meal.item.name}
                </AppText>
                <AppText style={[styles.mealMeta, { color: theme.colors.subtext }]}>
                  {meal.restaurantName || 'Restaurant'} · {time}
                </AppText>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color={theme.colors.subtext} />
          </View>
          
          <View style={styles.macroRow}>
            <MacroPill label="Cal" value={meal.item.estimatedCalories} theme={theme} />
            <MacroPill label="P" value={meal.item.estimatedProtein} unit="g" theme={theme} />
            <MacroPill label="C" value={meal.item.estimatedCarbs} unit="g" theme={theme} />
            <MacroPill label="F" value={meal.item.estimatedFat} unit="g" theme={theme} />
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(meal.item.score, theme) + '20' }]}>
              <AppText style={[styles.scoreText, { color: getScoreColor(meal.item.score, theme) }]}>
                {meal.item.score}
              </AppText>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={[styles.title, { color: theme.colors.text }]}>History</AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>
          {loggedMeals.length} meals logged
        </AppText>
      </View>

      {loggedMeals.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderMeal}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}>
            <FontAwesome name="history" size={40} color={theme.colors.subtext} />
          </View>
          <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No meals logged yet
          </AppText>
          <AppText style={[styles.emptyText, { color: theme.colors.subtext }]}>
            Scan a menu and tap "Log This Meal"{'\n'}to start tracking your dining choices.
          </AppText>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: theme.colors.brand }]}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <FontAwesome name="camera" size={16} color="#fff" />
            <AppText style={styles.scanButtonText}>Scan a Menu</AppText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function MacroPill({ label, value, unit = '', theme }: { 
  label: string; 
  value: number; 
  unit?: string; 
  theme: any;
}) {
  return (
    <View style={[styles.macroPill, { backgroundColor: theme.colors.bg }]}>
      <AppText style={[styles.macroValue, { color: theme.colors.text }]}>
        {value}{unit}
      </AppText>
      <AppText style={[styles.macroLabel, { color: theme.colors.subtext }]}>
        {label}
      </AppText>
    </View>
  );
}

function getScoreColor(score: number, theme: any): string {
  if (score >= 70) return theme.colors.trafficGreen;
  if (score >= 40) return theme.colors.trafficAmber;
  return theme.colors.trafficRed;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sectionTotals: {
    marginTop: 4,
  },
  totalText: {
    fontSize: 13,
  },
  mealCard: {
    marginBottom: 10,
    padding: 14,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  macroPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 10,
  },
  scoreBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
