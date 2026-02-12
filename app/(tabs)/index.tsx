import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useHistoryStore } from '@/src/stores/historyStore';
import { useStreakStore } from '@/src/stores/streakStore';
import { useSpendingStore } from '@/src/stores/spendingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Michi assets
const MichiHero = require('@/assets/michi-hero.png');
const MichiAvatar = require('@/assets/michi-avatar.png');
const MichiSpending = require('@/assets/michi-spending.png');
const MichiConfused = require('@/assets/michi-confused.png');

// Background with botanicals baked in
const HomeBackground = require('@/assets/botanicals/home-background.png');

// Michi's rotating tips
const MICHI_TIPS = [
  "Try swapping creamy dressings for vinaigrettes!",
  "Grilled > fried - same flavor, fewer calories!",
  "Ask for sauce on the side to control portions.",
  "Protein-rich dishes keep you full longer.",
  "Don't skip the veggies - they're your friends!",
  "Water before meals helps with portions.",
];

const getMichiTip = () => {
  const index = Math.floor(Date.now() / 60000) % MICHI_TIPS.length;
  return MICHI_TIPS[index];
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goal, macroPriority, dietType, intolerances } = useOnboardingStore();
  const { loggedMeals } = useHistoryStore();
  const { currentStreak, lastChoice } = useStreakStore();
  const { weeklyBudget, getCurrentWeekSpent } = useSpendingStore();

  const currentWeekSpent = getCurrentWeekSpent();
  const budgetPercent = weeklyBudget && weeklyBudget > 0 ? (currentWeekSpent / weeklyBudget) * 100 : 0;

  const lastMeal = loggedMeals[0];

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/scan');
  };

  const getGreetingText = () => {
    switch (goal) {
      case 'lose': return "What are we eating?";
      case 'gain': return "Time to fuel those gains";
      case 'maintain': return "Let's keep it balanced";
      default: return "Ready to eat smart?";
    }
  };

  // Build unique tags with icons
  const buildTags = () => {
    const tags: { label: string; icon: string; key: string }[] = [];

    if (goal === 'lose') {
      tags.push({ label: 'Lower Calorie', icon: '🔥', key: 'goal' });
    } else if (goal === 'gain') {
      tags.push({ label: 'Build Muscle', icon: '💪', key: 'goal' });
    } else if (goal === 'maintain') {
      tags.push({ label: 'Maintain', icon: '⚖️', key: 'goal' });
    }

    if (dietType === 'vegan') {
      tags.push({ label: 'Vegan', icon: '🌱', key: 'diet' });
    } else if (dietType === 'keto') {
      tags.push({ label: 'Keto', icon: '🥑', key: 'diet' });
    } else if (dietType === 'lowcarb' || macroPriority === 'lowcarb') {
      tags.push({ label: 'Low Carb', icon: '🥗', key: 'diet' });
    } else if (dietType === 'mediterranean') {
      tags.push({ label: 'Mediterranean', icon: '🫒', key: 'diet' });
    }

    if (intolerances?.includes('gluten') || intolerances?.includes('Gluten')) {
      tags.push({ label: 'Gluten-Free', icon: '🌾', key: 'gluten' });
    }

    return tags.slice(0, 3);
  };

  const tags = buildTags();

  return (
    <ImageBackground
      source={HomeBackground}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Michi Hero - NO card border, sits on background */}
          <View style={styles.michiHero}>
            <Image
              source={MichiHero}
              style={styles.michiHeroImage}
              resizeMode="contain"
            />
          </View>

          {/* Healthy Dining Streak */}
          {getStreakBackgroundConfig(currentStreak).gradient ? (
            <TouchableOpacity activeOpacity={0.9} onPress={handleScan}>
              <LinearGradient
                colors={getStreakBackgroundConfig(currentStreak).gradient as [string, string]}
                style={styles.streakCard}
              >
                <StreakContent currentStreak={currentStreak} lastChoice={lastChoice} />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.streakCard, { backgroundColor: getStreakBackgroundConfig(currentStreak).solid || '#E8F5E2' }]}
              activeOpacity={0.9}
              onPress={handleScan}
            >
              <StreakContent currentStreak={currentStreak} lastChoice={lastChoice} />
            </TouchableOpacity>
          )}

          {/* Weekly Spending Widget */}
          <View style={styles.spendingCard}>
            <View style={styles.spendingTopRow}>
              <View style={styles.spendingTitleBlock}>
                <AppText style={[styles.spendingTitle, { color: theme.colors.text }]}>💰 Weekly Spending</AppText>
                {weeklyBudget ? (
                  <AppText style={[styles.spendingAmount, { color: theme.colors.text }]}>${currentWeekSpent.toFixed(0)} / ${weeklyBudget.toFixed(0)}</AppText>
                ) : (
                  <AppText style={[styles.spendingUnset, { color: theme.colors.subtext }]}>Set a budget in onboarding/profile</AppText>
                )}
              </View>
              <Image source={weeklyBudget && budgetPercent >= 100 ? MichiConfused : MichiSpending} style={styles.spendingMichi} resizeMode="contain" />
            </View>

            {weeklyBudget ? (
              <>
                <View style={[styles.progressTrack, { backgroundColor: '#F0E6D6' }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, budgetPercent)}%`,
                        backgroundColor:
                          budgetPercent >= 100 ? '#E86B50' : budgetPercent >= 80 ? '#F4A261' : '#6BAF7A',
                      },
                    ]}
                  />
                </View>
                <AppText style={[styles.spendingSubtext, { color: theme.colors.subtext }]}>
                  {budgetPercent >= 100
                    ? 'Over budget this week'
                    : budgetPercent >= 80
                      ? 'Approaching budget'
                      : 'On track this week'}
                </AppText>
              </>
            ) : null}
          </View>

          {/* Scan a Menu CTA Button */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScan}
            activeOpacity={0.9}
          >
            <FontAwesome name="camera" size={20} color="#fff" style={styles.scanIcon} />
            <AppText
              style={[
                styles.scanButtonText,
                { fontFamily: theme.fonts.heading.semiBold }
              ]}
            >
              Scan a Menu
            </AppText>
          </TouchableOpacity>

          {/* Two-Column Card Row */}
          <View style={styles.cardRow}>
            {/* Left - Your Focus */}
            <View style={[styles.focusCard, { backgroundColor: '#E8F5E2' }]}>
              <AppText
                style={[
                  styles.cardTitle,
                  { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }
                ]}
              >
                Your Focus
              </AppText>
              <View style={styles.tagsContainer}>
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <View
                      key={tag.key}
                      style={[styles.tag, { backgroundColor: '#fff', borderColor: '#6BAF7A' }]}
                    >
                      <AppText style={styles.tagIcon}>{tag.icon}</AppText>
                      <AppText
                        style={[
                          styles.tagText,
                          { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }
                        ]}
                      >
                        {tag.label}
                      </AppText>
                    </View>
                  ))
                ) : (
                  <AppText style={[styles.noTags, { color: theme.colors.caption }]}>
                    Set in Profile
                  </AppText>
                )}
              </View>
            </View>

            {/* Right - Michi says */}
            <View style={[styles.michiCard, { backgroundColor: '#FFE8D6' }]}>
              <View style={styles.michiSaysHeader}>
                <Image source={MichiAvatar} style={styles.michiAvatar} />
                <AppText
                  style={[
                    styles.michiSaysLabel,
                    { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }
                  ]}
                >
                  Michi says:
                </AppText>
              </View>
              <AppText
                style={[
                  styles.michiSays,
                  { fontFamily: theme.fonts.body.regular, color: theme.colors.text }
                ]}
              >
                {getMichiTip()}
              </AppText>
            </View>
          </View>

          {/* Last Scan Preview - fills empty space */}
          {lastMeal ? (
            <View style={[styles.lastScanCard, { backgroundColor: '#fff', borderColor: theme.colors.border }]}>
              <View style={styles.lastScanHeader}>
                <AppText style={[styles.lastScanLabel, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
                  📋 Last Logged
                </AppText>
                <AppText style={[styles.lastScanTime, { color: theme.colors.caption }]}>
                  {formatTimeAgo(lastMeal.loggedAt)}
                </AppText>
              </View>
              <View style={styles.lastScanContent}>
                <TrafficLightDot tone={lastMeal.item.trafficLight} size={12} />
                <View style={styles.lastScanInfo}>
                  <AppText
                    style={[styles.lastScanName, { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {lastMeal.item.name}
                  </AppText>
                  <AppText style={[styles.lastScanMacros, { color: theme.colors.caption }]}>
                    {lastMeal.item.estimatedCalories} cal · {lastMeal.item.estimatedProtein}g P · {lastMeal.item.estimatedCarbs}g C
                  </AppText>
                </View>
              </View>
              {lastMeal.restaurantName && (
                <AppText style={[styles.restaurantName, { color: theme.colors.caption }]}>
                  {lastMeal.restaurantName}
                </AppText>
              )}
            </View>
          ) : (
            <View style={[styles.welcomeCard, { backgroundColor: '#FFF0D4' }]}>
              <AppText style={[styles.welcomeEmoji]}>👋</AppText>
              <AppText style={[styles.welcomeTitle, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
                Welcome to MenuScan!
              </AppText>
              <AppText style={[styles.welcomeText, { fontFamily: theme.fonts.body.regular, color: theme.colors.subtext }]}>
                Scan your first restaurant menu to get personalized healthy recommendations.
              </AppText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function getStreakBackgroundConfig(streak: number) {
  if (streak === 0) return { solid: '#FFF0D4', gradient: null as null | [string, string] };
  if (streak <= 2) return { solid: '#E8F5E2', gradient: null as null | [string, string] };
  if (streak <= 6) return { solid: null as null | string, gradient: ['#E8F5E2', '#D4EDDA'] as [string, string] };
  return { solid: null as null | string, gradient: ['#D4EDDA', '#C3E6CB'] as [string, string] };
}

function StreakContent({ currentStreak, lastChoice }: { currentStreak: number; lastChoice: any }) {
  const theme = useAppTheme();
  const milestone = [7, 14, 30].includes(currentStreak);

  return (
    <View style={styles.streakContainer}>
      <View style={styles.streakNumberContainer}>
        {milestone && <View style={[styles.progressRing, { borderColor: theme.colors.brand + '33' }]} />}
        <AppText style={[styles.streakNumber, { color: theme.colors.text }]}>{Math.max(0, currentStreak)}</AppText>
      </View>
      <AppText style={[styles.streakLabel, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Day Streak</AppText>
      <AppText style={[styles.streakExplanation, { color: theme.colors.subtext }]}>Keep making healthy choices to improve your streak!</AppText>
      {lastChoice ? (
        <AppText style={[styles.streakLastChoice, { color: theme.colors.subtext }]}>
          Last choice: {lastChoice.mealName} ({formatTimeAgo(lastChoice.loggedAt)})
        </AppText>
      ) : (
        <AppText style={[styles.streakLastChoice, { color: theme.colors.subtext }]}>No choices logged yet.</AppText>
      )}
    </View>
  );
}

function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  // Header
  header: {
    marginBottom: 8,
    zIndex: 1,
  },
  greeting: {
    fontSize: 32,
    lineHeight: 40,
  },
  // Michi Hero - larger, no card
  michiHero: {
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  michiHeroImage: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
  },
  streakCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    zIndex: 1,
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  streakNumberContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: 72,
    height: 72,
  },
  progressRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  streakLabel: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  streakExplanation: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  streakLastChoice: {
    fontSize: 13,
    textAlign: 'center',
  },
  spendingCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
    zIndex: 1,
  },
  spendingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  spendingTitleBlock: {
    flex: 1,
  },
  spendingMichi: {
    width: 64,
    height: 64,
  },
  spendingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  spendingAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  spendingUnset: {
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  spendingSubtext: {
    fontSize: 12,
    marginTop: 8,
  },
  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    backgroundColor: '#E86B50',
    shadowColor: '#E86B50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  scanIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  // Two-column row
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    zIndex: 1,
  },
  focusCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  tagsContainer: {
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  tagIcon: {
    fontSize: 12,
  },
  tagText: {
    fontSize: 12,
  },
  noTags: {
    fontSize: 13,
  },
  michiCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },
  michiSaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  michiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  michiSaysLabel: {
    fontSize: 14,
  },
  michiSays: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Last Scan Card
  lastScanCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    zIndex: 1,
  },
  lastScanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lastScanLabel: {
    fontSize: 15,
  },
  lastScanTime: {
    fontSize: 12,
  },
  lastScanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lastScanInfo: {
    flex: 1,
  },
  lastScanName: {
    fontSize: 15,
  },
  lastScanMacros: {
    fontSize: 12,
    marginTop: 2,
  },
  restaurantName: {
    fontSize: 12,
    marginTop: 8,
  },
  // Welcome Card (when no history)
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  welcomeEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
