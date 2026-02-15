import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, ActivityLevel } from '@/src/stores/onboardingStore';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; emoji: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', emoji: '🪑', description: 'Little or no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', emoji: '🚶', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', emoji: '🏃', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Very Active', emoji: '🏋️', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Extra Active', emoji: '🔥', description: 'Very hard exercise, physical job' },
];

export default function ActivityScreen() {
  const router = useRouter();
  const { activityLevel, setActivityLevel } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/diet-type');
  };

  return (
    <OnboardingScreen
      title="How active are you?"
      subtitle="This helps me figure out your perfect calorie range! Be honest~ :3"
      canContinue={!!activityLevel}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {ACTIVITY_LEVELS.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            description={item.description}
            selected={activityLevel === item.value}
            onPress={() => setActivityLevel(item.value)}
          />
        ))}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});
