import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, DiningChallenge } from '@/src/stores/onboardingStore';

const CHALLENGES: { value: DiningChallenge; label: string; emoji: string; description: string }[] = [
  { value: 'calories', label: 'Calorie Uncertainty', emoji: '🤷', description: "Not knowing what's healthy" },
  { value: 'social', label: 'Social Pressure', emoji: '👥', description: 'Others influencing my choices' },
  { value: 'willpower', label: 'Willpower', emoji: '😢', description: 'Cravings and temptation' },
  { value: 'overwhelm', label: 'Menu Overwhelm', emoji: '🤔', description: 'Too many options to choose from' },
];

export default function ChallengeScreen() {
  const router = useRouter();
  const { diningChallenge, setDiningChallenge } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/processing');
  };

  return (
    <OnboardingScreen
      title="Your biggest challenge?"
      subtitle="When eating out, what makes it hardest to stay on track?"
      canContinue={!!diningChallenge}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {CHALLENGES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            description={item.description}
            selected={diningChallenge === item.value}
            onPress={() => setDiningChallenge(item.value)}
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
