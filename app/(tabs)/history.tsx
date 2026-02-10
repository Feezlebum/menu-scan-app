import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { Calendar, DateData } from 'react-native-calendars';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useHistoryStore, LoggedMeal, getMealPrice } from '@/src/stores/historyStore';
import { useScanStore } from '@/src/stores/scanStore';

const HomeBackground = require('@/assets/botanicals/home-background.png');
const MichiHistoryAvatar = require('@/assets/michi-avatar.png');

type TimeRange = 'today' | 'week' | 'month' | 'all';
const ITEMS_PER_PAGE = 50;

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

  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalMeals = loggedMeals.length;
  const totalDays = new Set(loggedMeals.map((meal) => meal.loggedAt.split('T')[0])).size;
  const totalSpending = loggedMeals.reduce((sum, meal) => sum + (getMealPrice(meal) || 0), 0);
  const totalCalories = loggedMeals.reduce((sum, meal) => sum + (meal.item.estimatedCalories || 0), 0);

  const filteredMeals = useMemo(() => {
    let filtered = [...loggedMeals];

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    if (timeRange === 'today') {
      const todayStr = now.toDateString();
      filtered = filtered.filter((meal) => new Date(meal.loggedAt).toDateString() === todayStr);
    } else if (timeRange === 'week') {
      const weekAgo = new Date(todayStart);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((meal) => new Date(meal.loggedAt) >= weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(todayStart);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((meal) => new Date(meal.loggedAt) >= monthAgo);
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (meal) =>
          meal.item.name.toLowerCase().includes(query) ||
          meal.restaurantName?.toLowerCase().includes(query)
      );
    }

    if (selectedDate) {
      const target = selectedDate.toDateString();
      filtered = filtered.filter((meal) => new Date(meal.loggedAt).toDateString() === target);
    }

    return filtered;
  }, [loggedMeals, timeRange, searchText, selectedDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange, searchText, selectedDate]);

  const paginatedMeals = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return filteredMeals.slice(0, endIndex);
  }, [filteredMeals, currentPage]);

  const showLoadMore = paginatedMeals.length < filteredMeals.length;

  const sections = useMemo((): MealSection[] => {
    const grouped: Record<string, LoggedMeal[]> = {};

    paginatedMeals.forEach((meal) => {
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
  }, [paginatedMeals]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    loggedMeals.forEach((meal) => {
      const dateKey = meal.loggedAt.split('T')[0];
      marks[dateKey] = { marked: true, dotColor: theme.colors.brand };
    });
    return marks;
  }, [loggedMeals, theme.colors.brand]);

  const handleMealPress = (meal: LoggedMeal) => {
    Haptics.selectionAsync();
    setSelectedItem(meal.item);
    router.push('/item-detail');
  };

  const clearSelectedDate = () => setSelectedDate(null);

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

      <View style={[styles.navControls, { borderBottomColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((range) => {
            const active = timeRange === range.id;
            return (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.filterPill,
                  { borderColor: theme.colors.border },
                  active && { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTimeRange(range.id as TimeRange);
                }}
              >
                <AppText
                  style={[
                    styles.filterText,
                    { color: theme.colors.subtext, fontFamily: theme.fonts.body.semiBold },
                    active && { color: '#FFFFFF' },
                  ]}
                >
                  {range.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.actionRow}>
          {selectedDate && (
            <TouchableOpacity
              style={[styles.dateChip, { backgroundColor: theme.colors.cardCream, borderColor: theme.colors.border }]}
              onPress={clearSelectedDate}
            >
              <AppText style={[styles.dateChipText, { color: theme.colors.text }]}>
                {formatFullDate(selectedDate.toISOString().split('T')[0])} ×
              </AppText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.border }]}
            onPress={() => setSearchVisible((v) => !v)}
          >
            <FontAwesome name="search" size={16} color={theme.colors.subtext} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.border }]}
            onPress={() => setCalendarVisible(true)}
          >
            <FontAwesome name="calendar" size={16} color={theme.colors.subtext} />
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <View style={styles.searchRow}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body.regular,
                },
              ]}
              placeholder="Search meals or restaurants..."
              placeholderTextColor={theme.colors.caption}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>
        )}
      </View>

      <ImageBackground source={HomeBackground} style={styles.contentSection} resizeMode="cover">
        <View style={styles.contentOverlay}>
          {paginatedMeals.length > 0 ? (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MealCard meal={item} onPress={() => handleMealPress(item)} />}
              renderSectionHeader={({ section }) => <DayHeader section={section} />}
              ListFooterComponent={showLoadMore ? <LoadMoreButton onPress={() => setCurrentPage((p) => p + 1)} /> : null}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={false}
            />
          ) : (
            <EmptyFilterState
              timeRange={timeRange}
              searchText={searchText}
              onScan={() => router.push('/(tabs)/scan')}
            />
          )}
        </View>
      </ImageBackground>

      <Modal visible={calendarVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.calendarContainer}>
          <View style={[styles.calendarHeader, { borderBottomColor: theme.colors.border }]}> 
            <TouchableOpacity onPress={() => setCalendarVisible(false)}>
              <AppText style={[styles.calendarCancel, { color: theme.colors.brand }]}>Cancel</AppText>
            </TouchableOpacity>
            <AppText style={[styles.calendarTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}> 
              Jump to Date
            </AppText>
            <View style={{ width: 60 }} />
          </View>

          <Calendar
            onDayPress={(day: DateData) => {
              setSelectedDate(new Date(`${day.dateString}T12:00:00`));
              setCalendarVisible(false);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#FFF5E6',
              calendarBackground: '#FFF5E6',
              textSectionTitleColor: theme.colors.subtext,
              selectedDayBackgroundColor: theme.colors.brand,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.brand,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.caption,
              monthTextColor: theme.colors.text,
              arrowColor: theme.colors.brand,
            }}
          />

          <AppText style={[styles.calendarHint, { color: theme.colors.subtext }]}>• Days with meals are marked</AppText>
        </SafeAreaView>
      </Modal>
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

const LoadMoreButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity style={[styles.loadMoreButton, { borderColor: theme.colors.border }]} onPress={onPress}>
      <AppText style={[styles.loadMoreText, { color: theme.colors.subtext }]}>Load More Meals</AppText>
      <FontAwesome name="chevron-down" size={12} color={theme.colors.subtext} />
    </TouchableOpacity>
  );
};

const EmptyFilterState: React.FC<{
  timeRange: TimeRange;
  searchText: string;
  onScan: () => void;
}> = ({ timeRange, searchText, onScan }) => {
  const theme = useAppTheme();

  const getEmptyMessage = () => {
    if (searchText.trim()) return `No meals found for "${searchText.trim()}"`;
    if (timeRange === 'today') return 'No meals logged today';
    if (timeRange === 'week') return 'No meals logged this week';
    if (timeRange === 'month') return 'No meals logged this month';
    return 'No meals found';
  };

  const getEmptyAction = () => {
    if (searchText.trim()) return 'Try a different search term';
    if (timeRange === 'today') return 'Scan a menu to get started!';
    return 'Try expanding your time range';
  };

  return (
    <View style={styles.emptyFilterState}>
      <Image source={MichiHistoryAvatar} style={styles.michiMedium} />
      <AppText style={[styles.emptyFilterTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}> 
        {getEmptyMessage()}
      </AppText>
      <AppText style={[styles.emptyFilterText, { color: theme.colors.subtext }]}>{getEmptyAction()}</AppText>

      {timeRange === 'today' && !searchText.trim() && (
        <TouchableOpacity style={[styles.emptyCTA, { backgroundColor: theme.colors.brand }]} onPress={onScan}>
          <FontAwesome name="camera" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <AppText style={[styles.emptyCTAText, { fontFamily: theme.fonts.body.semiBold }]}>Scan Menu</AppText>
        </TouchableOpacity>
      )}
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

  navControls: {
    backgroundColor: '#FFF5E6',
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 'auto',
  },
  dateChipText: {
    fontSize: 12,
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
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

  loadMoreButton: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  loadMoreText: {
    fontSize: 14,
  },

  calendarContainer: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  calendarTitle: {
    fontSize: 18,
  },
  calendarCancel: {
    fontSize: 16,
  },
  calendarHint: {
    textAlign: 'center',
    fontSize: 14,
    padding: 20,
  },

  emptyFilterState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  michiMedium: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  emptyFilterTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyFilterText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyCTAText: {
    fontSize: 15,
    color: '#FFFFFF',
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
