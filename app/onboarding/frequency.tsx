import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, EatingFrequency } from '@/src/stores/onboardingStore';

const FREQUENCIES: { value: EatingFrequency; label: string; emoji: string; description: string }[] = [
  { value: '1-2x', label: '1-2 times/week', emoji: '👀', description: 'Occasional dining out' },
  { value: '3-4x', label: '3-4 times/week', emoji: '✨', description: 'Regular restaurant meals' },
  { value: '5+', label: '5+ times/week', emoji: '🔥', description: 'Most meals eating out' },
];

export default function FrequencyScreen() {
  const router = useRouter();
  const { eatingFrequency, setEatingFrequency } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/challenge');
  };

  return (
    <OnboardingScreen
      title="How often do you eat out?"
      subtitle="This helps us tailor the app experience for you."
      canContinue={!!eatingFrequency}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {FREQUENCIES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            description={item.description}
            selected={eatingFrequency === item.value}
            onPress={() => setEatingFrequency(item.value)}
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
