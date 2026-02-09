import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useHistoryStore } from '@/src/stores/historyStore';

// Michi's contextual messages based on time/state
const getMichiMessage = (hasHistory: boolean, goal: string | null) => {
  const hour = new Date().getHours();
  
  if (!hasHistory) {
    return "Hi! I'm Michi 🐱 Ready to help you make smarter choices when eating out. Scan your first menu!";
  }
  
  if (hour < 11) {
    return "Good morning! Planning brunch? I'll help you find something delicious that fits your goals.";
  } else if (hour < 14) {
    return "Lunch time! Remember: protein-rich dishes keep you full longer. Let's find a good one.";
  } else if (hour < 17) {
    return "Afternoon snack? Look for options under 300 cal to stay on track until dinner.";
  } else if (hour < 21) {
    return "Dinner time! Take your time choosing — I'll highlight the best options for you.";
  } else {
    return "Late night craving? No judgment! Let's find something satisfying but reasonable.";
  }
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goal, macroPriority, dietType } = useOnboardingStore();
  const { loggedMeals, scans } = useHistoryStore();

  const hasHistory = loggedMeals.length > 0;
  const lastMeal = loggedMeals[0];
  const lastScan = scans[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleScan = () => {
    router.push('/(tabs)/scan');
  };

  const getGoalMessage = () => {
    switch (goal) {
      case 'lose': return "Let's find lighter options";
      case 'gain': return "Time to fuel those gains";
      case 'maintain': return "Balance is the goal";
      default: return "Ready to eat smart?";
    }
  };

  // Build unique tags (no duplicates)
  const buildTags = () => {
    const tags: { label: string; key: string }[] = [];
    
    if (goal) {
      const goalLabels: Record<string, string> = {
        lose: 'Weight Loss',
        gain: 'Build Muscle',
        maintain: 'Maintain',
        health: 'Healthier Eating',
      };
      tags.push({ label: goalLabels[goal] || goal, key: 'goal' });
    }
    
    if (macroPriority && macroPriority !== 'balanced') {
      const macroLabels: Record<string, string> = {
        highprotein: 'High Protein',
        lowcarb: 'Low Carb',
        lowcal: 'Low Cal',
      };
      // Only add if not duplicate of diet type
      const macroLabel = macroLabels[macroPriority];
      if (macroLabel && !(dietType === 'lowcarb' && macroPriority === 'lowcarb')) {
        tags.push({ label: macroLabel, key: 'macro' });
      }
    }
    
    if (dietType && dietType !== 'none' && dietType !== 'cico') {
      const dietLabels: Record<string, string> = {
        keto: 'Keto',
        vegan: 'Vegan',
        vegetarian: 'Vegetarian',
        lowcarb: 'Low Carb',
        mediterranean: 'Mediterranean',
        paleo: 'Paleo',
      };
      tags.push({ label: dietLabels[dietType] || dietType, key: 'diet' });
    }
    
    return tags;
  };

  const tags = buildTags();

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Greeting Header */}
        <View style={styles.header}>
          <AppText style={[styles.greeting, { color: theme.colors.subtext }]}>
            {getGreeting()} 👋
          </AppText>
          <AppText style={[styles.title, { color: theme.colors.text }]}>
            {getGoalMessage()}
          </AppText>
        </View>

        {/* Scan Now Hero Card */}
        <Card style={[styles.scanCard, { borderColor: theme.colors.brand, borderWidth: 2 }]}>
          <View style={styles.scanContent}>
            <View style={[styles.scanIcon, { backgroundColor: theme.colors.secondary }]}>
              <AppText style={styles.scanEmoji}>📸</AppText>
            </View>
            <View style={styles.scanText}>
              <AppText style={[styles.scanTitle, { color: theme.colors.text }]}>
                Scan a Menu
              </AppText>
              <AppText style={[styles.scanSubtitle, { color: theme.colors.subtext }]}>
                Get personalized recommendations
              </AppText>
            </View>
          </View>
          <PrimaryButton label="Scan Now" onPress={handleScan} />
        </Card>

        {/* Michi Mascot Card */}
        <Card style={styles.michiCard}>
          <View style={styles.michiContent}>
            <View style={[styles.michiImageContainer, { backgroundColor: theme.colors.secondary }]}>
              {/* Placeholder for Michi image */}
              <AppText style={styles.michiPlaceholder}>🐱</AppText>
            </View>
            <View style={styles.michiTextContainer}>
              <AppText style={[styles.michiName, { color: theme.colors.brand }]}>Michi</AppText>
              <AppText style={[styles.michiMessage, { color: theme.colors.text }]}>
                {getMichiMessage(hasHistory, goal)}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Your Focus Tags */}
        {tags.length > 0 && (
          <View style={styles.focusSection}>
            <AppText style={[styles.focusLabel, { color: theme.colors.subtext }]}>
              🎯 Your Focus
            </AppText>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View 
                  key={tag.key} 
                  style={[styles.tag, { backgroundColor: theme.colors.secondary }]}
                >
                  <AppText style={[styles.tagText, { color: theme.colors.brand }]}>
                    {tag.label}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Last Scan Preview */}
        {lastMeal && (
          <Card style={styles.lastScanCard}>
            <View style={styles.lastScanHeader}>
              <AppText style={[styles.lastScanLabel, { color: theme.colors.subtext }]}>
                📋 Last Logged
              </AppText>
              <AppText style={[styles.lastScanTime, { color: theme.colors.subtext }]}>
                {formatTimeAgo(lastMeal.loggedAt)}
              </AppText>
            </View>
            <View style={styles.lastScanContent}>
              <TrafficLightDot tone={lastMeal.item.trafficLight} size={12} />
              <View style={styles.lastScanInfo}>
                <AppText style={[styles.lastScanName, { color: theme.colors.text }]} numberOfLines={1}>
                  {lastMeal.item.name}
                </AppText>
                <AppText style={[styles.lastScanMacros, { color: theme.colors.subtext }]}>
                  {lastMeal.item.estimatedCalories} cal · {lastMeal.item.estimatedProtein}g P · {lastMeal.item.estimatedCarbs}g C
                </AppText>
              </View>
              <View style={[styles.scorePill, { backgroundColor: getScoreColor(lastMeal.item.score, theme) + '20' }]}>
                <AppText style={[styles.scoreText, { color: getScoreColor(lastMeal.item.score, theme) }]}>
                  {lastMeal.item.score}
                </AppText>
              </View>
            </View>
            {lastMeal.restaurantName && (
              <AppText style={[styles.restaurantName, { color: theme.colors.subtext }]}>
                {lastMeal.restaurantName}
              </AppText>
            )}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function getScoreColor(score: number, theme: any): string {
  if (score >= 70) return theme.colors.trafficGreen;
  if (score >= 40) return theme.colors.trafficAmber;
  return theme.colors.trafficRed;
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
  content: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  scanCard: {
    padding: 20,
    marginBottom: 16,
  },
  scanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scanEmoji: {
    fontSize: 28,
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scanSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  michiCard: {
    padding: 16,
    marginBottom: 16,
  },
  michiContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  michiImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  michiPlaceholder: {
    fontSize: 32,
  },
  michiTextContainer: {
    flex: 1,
  },
  michiName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  michiMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  focusSection: {
    marginBottom: 16,
  },
  focusLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastScanCard: {
    padding: 14,
  },
  lastScanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lastScanLabel: {
    fontSize: 13,
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '600',
  },
  lastScanMacros: {
    fontSize: 13,
    marginTop: 2,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  restaurantName: {
    fontSize: 12,
    marginTop: 8,
  },
});
