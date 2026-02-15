import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

const DISLIKES = [
  { value: 'seafood', label: 'Seafood', emoji: '🦞' },
  { value: 'red_meat', label: 'Red Meat', emoji: '🥩' },
  { value: 'pork', label: 'Pork', emoji: '🐷' },
  { value: 'spicy', label: 'Spicy Food', emoji: '🌶️' },
  { value: 'mushrooms', label: 'Mushrooms', emoji: '🍄' },
  { value: 'onions', label: 'Onions', emoji: '🧅' },
  { value: 'olives', label: 'Olives', emoji: '🫒' },
  { value: 'avocado', label: 'Avocado', emoji: '🥑' },
  { value: 'tomato', label: 'Tomatoes', emoji: '🍅' },
  { value: 'cheese', label: 'Cheese', emoji: '🧀' },
];

export default function DislikesScreen() {
  const router = useRouter();
  const { dislikes, toggleDislike } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/cuisines');
  };

  return (
    <OnboardingScreen
      title="Any no-gos?"
      subtitle="Anything you just really don't like? I'll make sure to steer you away from those~ 🙅"
      canContinue={true}
      onContinue={handleContinue}
      buttonText={dislikes.length > 0 ? 'Continue' : "I'll eat anything!"}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {DISLIKES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            selected={dislikes.includes(item.value)}
            onPress={() => toggleDislike(item.value)}
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
