import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, MacroPriority } from '@/src/stores/onboardingStore';

const MACRO_PRIORITIES: { value: MacroPriority; label: string; emoji: string; description: string }[] = [
  { value: 'lowcal', label: 'Low Calorie', emoji: '🪶', description: 'Prioritize fewer calories per meal' },
  { value: 'highprotein', label: 'High Protein', emoji: '🥚', description: 'Maximize protein for satiety & muscle' },
  { value: 'lowcarb', label: 'Low Carb', emoji: '🥬', description: 'Minimize carbohydrate intake' },
  { value: 'balanced', label: 'Balanced', emoji: '⚖️', description: 'Good mix of all macros' },
];

export default function MacroPriorityScreen() {
  const router = useRouter();
  const { macroPriority, setMacroPriority } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/weekly-budget');
  };

  return (
    <OnboardingScreen
      title="What matters most?"
      subtitle="We'll rank menu items based on this priority."
      canContinue={!!macroPriority}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MACRO_PRIORITIES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            description={item.description}
            selected={macroPriority === item.value}
            onPress={() => setMacroPriority(item.value)}
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
