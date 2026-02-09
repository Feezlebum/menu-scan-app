import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

const CUISINES = [
  { value: 'american', label: 'American', emoji: '🍔' },
  { value: 'italian', label: 'Italian', emoji: '🍝' },
  { value: 'mexican', label: 'Mexican', emoji: '🌮' },
  { value: 'chinese', label: 'Chinese', emoji: '🥡' },
  { value: 'japanese', label: 'Japanese', emoji: '🍣' },
  { value: 'thai', label: 'Thai', emoji: '🍜' },
  { value: 'indian', label: 'Indian', emoji: '🍛' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🥙' },
  { value: 'korean', label: 'Korean', emoji: '🍲' },
  { value: 'vietnamese', label: 'Vietnamese', emoji: '🍲' },
];

export default function CuisinesScreen() {
  const router = useRouter();
  const { favoriteCuisines, toggleCuisine } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/frequency');
  };

  return (
    <OnboardingScreen
      title="Favorite cuisines?"
      subtitle="Help us understand your dining preferences. Select all you enjoy."
      canContinue={true}
      onContinue={handleContinue}
      buttonText={favoriteCuisines.length > 0 ? 'Continue' : 'I like variety!'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {CUISINES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            selected={favoriteCuisines.includes(item.value)}
            onPress={() => toggleCuisine(item.value)}
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
