import React, { useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useHistoryStore, LoggedMeal, getDaySpending, getMealPrice } from '@/src/stores/historyStore';
import { useScanStore } from '@/src/stores/scanStore';

const HomeBackground = require('@/assets/botanicals/home-background.png');

interface MealSection {
  title: string;
  date: string;
  data: LoggedMeal[];
}

export default function HistoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { loggedMeals } = useHistoryStore();
  const { setSelectedItem } = useScanStore();

  const sections = useMemo((): MealSection[] => {
    const grouped: Record<string, LoggedMeal[]> = {};

    loggedMeals.forEach((meal) => {
      const dateKey = meal.loggedAt.split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(meal);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, meals]) => ({
        title: formatDateHeader(dateKey),
        date: dateKey,
        data: meals,
      }));
  }, [loggedMeals]);

  const totalSpending = useMemo(() => getDaySpending(loggedMeals), [loggedMeals]);

  const handleMealPress = (meal: LoggedMeal) => {
    Haptics.selectionAsync();
    setSelectedItem(meal.item);
    router.push('/item-detail');
  };

  const getTotalCalories = (meals: LoggedMeal[]) => {
    return meals.reduce((sum, meal) => sum + (meal.item.estimatedCalories || 0), 0);
  };

  const renderSectionHeader = ({ section }: { section: MealSection }) => {
    const daySpending = getDaySpending(section.data);
    const mealsWithPrices = section.data.filter((meal) => getMealPrice(meal) !== null).length;

    return (
      <View style={[styles.sectionHeader, { borderBottomColor: theme.colors.border }]}> 
        <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</AppText>
        <View style={styles.sectionMeta}>
          <AppText style={[styles.sectionCalories, { color: theme.colors.subtext }]}>
            {getTotalCalories(section.data)} cal
          </AppText>
          {daySpending > 0 && (
            <AppText style={[styles.sectionSpending, { color: theme.colors.accent }]}> 
              ${daySpending.toFixed(2)}{mealsWithPrices < section.data.length ? ' +' : ''}
            </AppText>
          )}
        </View>
      </View>
    );
  };

  const renderMeal = ({ item: meal }: { item: LoggedMeal }) => {
    const mealPrice = getMealPrice(meal);
    const time = new Date(meal.loggedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity onPress={() => handleMealPress(meal)} activeOpacity={0.75}>
        <Card style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleRow}>
              <View style={styles.mealTitleWrap}>
                <TrafficLightDot tone={meal.item.trafficLight} size={12} />
                <AppText style={[styles.mealName, { color: theme.colors.text }]} numberOfLines={1}>
                  {meal.item.name}
                </AppText>
              </View>

              <View style={styles.mealMetaTop}>
                <AppText style={[styles.mealPrice, { color: theme.colors.text }]}> 
                  {mealPrice !== null ? `$${mealPrice.toFixed(2)}` : '—'}
                </AppText>
                <AppText style={[styles.healthScore, { color: getScoreColor(meal.item.score, theme) }]}>
                  {Math.round(meal.item.score)}
                </AppText>
                <FontAwesome name="chevron-right" size={13} color={theme.colors.subtext} />
              </View>
            </View>

            <View style={styles.mealSubtitle}>
              <AppText style={[styles.restaurantName, { color: theme.colors.subtext }]} numberOfLines={1}>
                {meal.restaurantName || 'Restaurant'}
              </AppText>
              <AppText style={[styles.timeStamp, { color: theme.colors.subtext }]}>{time}</AppText>
            </View>
          </View>

          <View style={styles.macroRow}>
            <MacroPill label="Cal" value={meal.item.estimatedCalories} theme={theme} />
            <MacroPill label="P" value={meal.item.estimatedProtein} unit="g" theme={theme} />
            <MacroPill label="C" value={meal.item.estimatedCarbs} unit="g" theme={theme} />
            <MacroPill label="F" value={meal.item.estimatedFat} unit="g" theme={theme} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.headerSection, { backgroundColor: theme.colors.bg }]} edges={['top']}>
        <View style={styles.headerContent}>
          <AppText style={[styles.headerStats, { color: theme.colors.subtext }]}>
            {loggedMeals.length} meals logged · ${totalSpending.toFixed(0)} spent
          </AppText>
        </View>
      </SafeAreaView>

      <ImageBackground source={HomeBackground} style={styles.contentSection} resizeMode="cover">
        <View style={styles.contentOverlay}>
          {loggedMeals.length > 0 ? (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderMeal}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}> 
                <FontAwesome name="history" size={40} color={theme.colors.subtext} />
              </View>
              <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>No meals logged yet</AppText>
              <AppText style={[styles.emptyText, { color: theme.colors.subtext }]}> 
                Start scanning menus to see your dining history
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
        </View>
      </ImageBackground>
    </View>
  );
}

function MacroPill({
  label,
  value,
  unit = '',
  theme,
}: {
  label: string;
  value: number;
  unit?: string;
  theme: any;
}) {
  return (
    <View style={[styles.macroPill, { backgroundColor: theme.colors.bg }]}> 
      <AppText style={[styles.macroValue, { color: theme.colors.text }]}>{value}{unit}</AppText>
      <AppText style={[styles.macroLabel, { color: theme.colors.subtext }]}>{label}</AppText>
    </View>
  );
}

function getScoreColor(score: number, theme: any): string {
  if (score >= 70) return theme.colors.trafficGreen;
  if (score >= 40) return theme.colors.trafficAmber;
  return theme.colors.trafficRed;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
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
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 8,
  },
  headerStats: {
    fontSize: 16,
  },
  contentSection: { flex: 1 },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 245, 230, 0.85)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCalories: {
    fontSize: 13,
  },
  sectionSpending: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealCard: {
    marginTop: 10,
    marginBottom: 6,
    padding: 14,
  },
  mealHeader: {
    marginBottom: 8,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mealTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mealMetaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  mealPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  mealSubtitle: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  restaurantName: {
    fontSize: 13,
    flex: 1,
  },
  timeStamp: {
    fontSize: 13,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
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
