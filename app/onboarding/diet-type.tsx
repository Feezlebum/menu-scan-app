import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, DietType } from '@/src/stores/onboardingStore';

const DIET_TYPES: { value: DietType; label: string; emoji: string; description: string }[] = [
  { value: 'cico', label: 'Calorie Counting', emoji: '🔢', description: 'Focus on calories in vs out' },
  { value: 'keto', label: 'Keto / Low Carb', emoji: '🥑', description: 'High fat, very low carbs' },
  { value: 'vegan', label: 'Vegan', emoji: '👨‍🍳', description: 'No animal products' },
  { value: 'lowcarb', label: 'Low Carb', emoji: '🥩', description: 'Reduced carbohydrate intake' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒', description: 'Whole foods, healthy fats' },
  { value: 'none', label: 'No Specific Diet', emoji: '👨‍🍳', description: 'Just eating healthier' },
];

export default function DietTypeScreen() {
  const router = useRouter();
  const { dietType, setDietType } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/macro-priority');
  };

  return (
    <OnboardingScreen
      title="Your eating style"
      subtitle="Got it! Are you following any specific diet? No judgment — I just want to give you the best picks! 💚"
      canContinue={!!dietType}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {DIET_TYPES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            description={item.description}
            selected={dietType === item.value}
            onPress={() => setDietType(item.value)}
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
