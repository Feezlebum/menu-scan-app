import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, Goal } from '@/src/stores/onboardingStore';

const GOALS: { value: Goal; label: string; emoji: string; description: string }[] = [
  { value: 'lose', label: 'Lose Weight', emoji: '🔥', description: 'Reduce body fat and get leaner' },
  { value: 'maintain', label: 'Maintain Weight', emoji: '👍', description: 'Keep your current weight' },
  { value: 'gain', label: 'Build Muscle', emoji: '💪', description: 'Gain muscle and strength' },
  { value: 'health', label: 'Eat Healthier', emoji: '👨‍🍳', description: 'Focus on nutritious choices' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { goal, setGoal } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/age-gender');
  };

  return (
    <OnboardingScreen
      title="What's your goal?"
      subtitle="This helps us personalize your menu recommendations."
      canContinue={!!goal}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {GOALS.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            description={item.description}
            selected={goal === item.value}
            onPress={() => setGoal(item.value)}
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
