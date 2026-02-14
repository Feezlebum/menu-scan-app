import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import MichiMoji from '@/src/components/MichiMoji';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function PlanRevealScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { dailyCalorieTarget, goal, goalDate, dietType, macroPriority } = useOnboardingStore();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleContinue = () => {
    router.push('/onboarding/social-proof');
  };

  const getGoalLabel = () => {
    switch (goal) {
      case 'lose': return 'Weight Loss';
      case 'gain': return 'Muscle Building';
      case 'maintain': return 'Maintenance';
      case 'health': return 'Healthy Eating';
      default: return 'Your Plan';
    }
  };

  const getDietLabel = () => {
    switch (dietType) {
      case 'keto': return 'Keto';
      case 'vegan': return 'Vegan';
      case 'lowcarb': return 'Low Carb';
      case 'mediterranean': return 'Mediterranean';
      case 'cico': return 'Flexible';
      default: return 'Balanced';
    }
  };

  const getMacroLabel = () => {
    switch (macroPriority) {
      case 'lowcal': return 'Low Calorie Focus';
      case 'highprotein': return 'High Protein Focus';
      case 'lowcarb': return 'Low Carb Focus';
      default: return 'Balanced Macros';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <AppText style={[styles.header, { color: theme.colors.brand }]}>
            Your personalized plan is ready!
          </AppText>
        </Animated.View>

        {/* Calorie Card */}
        <Animated.View
          entering={FadeInUp.delay(400)}
          style={[styles.calorieCard, { backgroundColor: theme.colors.brand }]}
        >
          <AppText style={styles.calorieLabel}>Daily Calorie Target</AppText>
          <AppText style={styles.calorieValue}>{dailyCalorieTarget}</AppText>
          <AppText style={styles.calorieUnit}>calories</AppText>
        </Animated.View>

        {/* Plan Details */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.details}>
          <PlanItem
            label="Goal"
            value={getGoalLabel()}
            emoji="🎯"
            theme={theme}
          />
          <PlanItem
            label="Diet Style"
            value={getDietLabel()}
            emoji="🍽️"
            theme={theme}
          />
          <PlanItem
            label="Priority"
            value={getMacroLabel()}
            emoji="⚡"
            theme={theme}
          />
          {goalDate && goalDate !== 'Ongoing' && (
            <PlanItem
              label="Target Date"
              value={new Date(goalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              emoji="📅"
              theme={theme}
            />
          )}
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeIn.delay(1000)} style={styles.footer}>
          <PrimaryButton label="Continue" onPress={handleContinue} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function PlanItem({ label, value, emoji, theme }: { label: string; value: string; emoji: string; theme: any }) {
  return (
    <View style={[styles.planItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
      <MichiMoji emoji={emoji} size={22} style={styles.planEmojiImage} />
      <View style={styles.planContent}>
        <AppText style={[styles.planLabel, { color: theme.colors.subtext }]}>{label}</AppText>
        <AppText style={[styles.planValue, { color: theme.colors.text }]}>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  calorieCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  calorieValue: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '800',
  },
  calorieUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  details: {
    gap: 12,
    flex: 1,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  planEmojiImage: {
    marginRight: 16,
  },
  planContent: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  planValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 16,
  },
});
