import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, DietType } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const DIET_TYPES: { value: DietType; label: string; emoji: string; description: string }[] = [
  { value: 'cico', label: 'calorie counting (cico)', emoji: '🔥', description: 'I can help you stay right on target.' },
  { value: 'keto', label: 'keto / low carb', emoji: '🥑', description: 'I will prioritize lower-carb picks.' },
  { value: 'vegan', label: 'vegan / plant-based', emoji: '🌱', description: 'I will flag fully plant-based dishes.' },
  { value: 'mediterranean', label: 'mediterranean', emoji: '🫒', description: 'Whole foods and balanced choices first.' },
  { value: 'lowcarb', label: 'balanced / no specific diet', emoji: '🥗', description: 'I will keep recommendations flexible.' },
  { value: 'none', label: 'other', emoji: '✏️', description: 'You can refine this in preferences next.' },
];

export default function DietTypeScreen() {
  const router = useRouter();
  const { dietType, setDietType } = useOnboardingStore();

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingClipboard}
      dialogueText="Got it! Now, are you following any specific diet? No judgment — I just want to give you the best recommendations!"
      canContinue={!!dietType}
      onContinue={() => router.push('/onboarding/weekly-budget' as never)}
      buttonText="Continue"
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
