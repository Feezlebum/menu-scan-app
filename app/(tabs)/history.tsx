import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useHistoryStore, LoggedMeal, getMealPrice } from '@/src/stores/historyStore';
import { useScanStore } from '@/src/stores/scanStore';

const HomeBackground = require('@/assets/botanicals/home-background.png');
const MichiHistoryAvatar = require('@/assets/michi-avatar.png');

interface MealSection {
  title: string;
  date: string;
  data: LoggedMeal[];
}

interface DayHeaderProps {
  section: MealSection;
}

interface MealCardProps {
  meal: LoggedMeal;
  onPress: () => void;
}

export default function HistoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { loggedMeals } = useHistoryStore();
  const { setSelectedItem } = useScanStore();

  const totalMeals = loggedMeals.length;
  const totalDays = new Set(loggedMeals.map((meal) => meal.loggedAt.split('T')[0])).size;
  const totalSpending = loggedMeals.reduce((sum, meal) => sum + (getMealPrice(meal) || 0), 0);
  const totalCalories = loggedMeals.reduce((sum, meal) => sum + (meal.item.estimatedCalories || 0), 0);

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
        title: formatDayName(dateKey),
        date: dateKey,
        data: meals,
      }));
  }, [loggedMeals]);

  const handleMealPress = (meal: LoggedMeal) => {
    Haptics.selectionAsync();
    setSelectedItem(meal.item);
    router.push('/item-detail');
  };

  if (loggedMeals.length === 0) {
    return <EmptyHistoryState />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.heroSection, { borderBottomColor: theme.colors.border }]} edges={['top']}>
        <View style={styles.heroContent}>
          <Image source={MichiHistoryAvatar} style={styles.michiAvatar} />
          <View style={styles.heroText}>
            <AppText style={[styles.heroTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>
              Your Food Journey
            </AppText>
            <AppText style={[styles.heroStats, { color: theme.colors.subtext }]}> 
              {totalMeals} meals • {totalDays} days • {totalCalories.toLocaleString()} cal
              {totalSpending > 0 ? ` • $${totalSpending.toFixed(0)} spent` : ''}
            </AppText>
          </View>
        </View>
      </SafeAreaView>

      <ImageBackground source={HomeBackground} style={styles.contentSection} resizeMode="cover">
        <View style={styles.contentOverlay}>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MealCard meal={item} onPress={() => handleMealPress(item)} />
            )}
            renderSectionHeader={({ section }) => <DayHeader section={section} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const DayHeader: React.FC<DayHeaderProps> = ({ section }) => {
  const theme = useAppTheme();

  const dayCalories = section.data.reduce((sum, meal) => sum + (meal.item.estimatedCalories || 0), 0);
  const daySpending = section.data.reduce((sum, meal) => sum + (getMealPrice(meal) || 0), 0);
  const mealsCount = section.data.length;

  return (
    <Card style={[styles.dayCard, { backgroundColor: theme.colors.cardSage }]}> 
      <View style={styles.dayContent}>
        <View style={styles.dayInfo}>
          <AppText style={[styles.dayTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>
            {formatDayName(section.date)}
          </AppText>
          <AppText style={[styles.dayDate, { color: theme.colors.subtext }]}>{formatFullDate(section.date)}</AppText>
        </View>

        <View style={styles.dayStats}>
          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>
              {dayCalories.toLocaleString()}
            </AppText>
            <AppText style={[styles.statLabel, { color: theme.colors.subtext }]}>cal</AppText>
          </View>

          {daySpending > 0 && (
            <View style={styles.statItem}>
              <AppText style={[styles.statNumber, { color: theme.colors.accent, fontFamily: theme.fonts.body.semiBold }]}>
                ${daySpending.toFixed(0)}
              </AppText>
              <AppText style={[styles.statLabel, { color: theme.colors.subtext }]}>spent</AppText>
            </View>
          )}

          <View style={styles.statItem}>
            <AppText style={[styles.statNumber, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>
              {mealsCount}
            </AppText>
            <AppText style={[styles.statLabel, { color: theme.colors.subtext }]}>
              {mealsCount === 1 ? 'meal' : 'meals'}
            </AppText>
          </View>
        </View>
      </View>
    </Card>
  );
};

const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
  const theme = useAppTheme();
  const price = getMealPrice(meal);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <TrafficLightDot tone={meal.item.trafficLight} size={14} />
            <AppText
              style={[styles.mealName, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}
              numberOfLines={1}
            >
              {meal.item.name}
            </AppText>

            <View style={styles.mealMetaBadges}>
              {price !== null && (
                <View style={[styles.priceBadge, { backgroundColor: theme.colors.cardCream }]}> 
                  <AppText style={[styles.badgeText, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>
                    ${price.toFixed(2)}
                  </AppText>
                </View>
              )}

              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(meal.item.score, theme) }]}>
                <AppText style={[styles.scoreText, { fontFamily: theme.fonts.body.semiBold }]}> 
                  {Math.round(meal.item.score)}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.mealSubtitle}>
            <AppText style={[styles.restaurantName, { color: theme.colors.subtext }]} numberOfLines={1}>
              {meal.restaurantName || 'Unknown Restaurant'}
            </AppText>
            <AppText style={[styles.timestamp, { color: theme.colors.caption }]}>{formatTime(meal.loggedAt)}</AppText>
          </View>
        </View>

        <View style={styles.macroRow}>
          <MacroBadge label="Cal" value={meal.item.estimatedCalories} />
          <MacroBadge label="P" value={`${meal.item.estimatedProtein}g`} />
          <MacroBadge label="C" value={`${meal.item.estimatedCarbs}g`} />
          <MacroBadge label="F" value={`${meal.item.estimatedFat}g`} />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const MacroBadge: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.macroBadge, { backgroundColor: theme.colors.cardCream }]}> 
      <AppText style={[styles.macroValue, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>
        {value}
      </AppText>
      <AppText style={[styles.macroLabel, { color: theme.colors.subtext }]}>{label}</AppText>
    </View>
  );
};

const EmptyHistoryState: React.FC = () => {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.emptyContainer} edges={['top']}>
        <View style={styles.emptyContent}>
          <Image source={MichiHistoryAvatar} style={styles.michiLarge} />
          <AppText style={[styles.emptyTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>
            No meals yet!
          </AppText>
          <AppText style={[styles.emptyText, { color: theme.colors.subtext }]}> 
            Scan your first menu and I'll start tracking your food journey.
          </AppText>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.colors.brand }]}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.8}
          >
            <FontAwesome name="camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <AppText style={[styles.emptyButtonText, { fontFamily: theme.fonts.body.semiBold }]}>Scan a Menu</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

function getScoreColor(score: number, theme: any): string {
  if (score >= 80) return theme.colors.trafficGreen;
  if (score >= 60) return theme.colors.trafficAmber;
  return theme.colors.trafficRed;
}

function formatDayName(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatFullDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  const currentYear = new Date().getFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== currentYear ? { year: 'numeric' as const } : {}),
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  heroSection: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  michiAvatar: {
    width: 52,
    height: 52,
    marginRight: 16,
    borderRadius: 26,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 26,
    marginBottom: 4,
  },
  heroStats: {
    fontSize: 15,
    lineHeight: 20,
  },

  contentSection: {
    flex: 1,
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 245, 230, 0.93)',
  },
  listContent: {
    paddingBottom: 20,
  },

  dayCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dayInfo: {
    flex: 1,
    marginRight: 8,
  },
  dayTitle: {
    fontSize: 20,
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 14,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  mealCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  mealHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealName: {
    flex: 1,
    fontSize: 17,
    marginLeft: 10,
  },
  mealMetaBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
  },
  scoreText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  mealSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 14,
    flex: 1,
  },
  timestamp: {
    fontSize: 13,
    marginLeft: 8,
  },

  macroRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  macroBadge: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    lineHeight: 20,
  },
  macroLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF5E6',
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  michiLarge: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  emptyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
