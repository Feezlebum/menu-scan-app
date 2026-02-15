import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const BUDGET_OPTIONS: Array<{ label: string; value: number | null; emoji: string }> = [
  { label: 'under $25', value: 25, emoji: '💸' },
  { label: '$25 - $50', value: 50, emoji: '💵' },
  { label: '$50 - $100', value: 100, emoji: '💰' },
  { label: '$100 - $200', value: 200, emoji: '🧾' },
  { label: '$200+', value: 250, emoji: '💳' },
  { label: "i don't track this", value: null, emoji: '🤷' },
];

export default function WeeklyBudgetScreen() {
  const router = useRouter();
  const { weeklyDiningBudget, setWeeklyDiningBudget } = useOnboardingStore();
  const [selected, setSelected] = useState<number | null | 'unset'>(
    weeklyDiningBudget === null ? 'unset' : weeklyDiningBudget
  );

  const canContinue = selected !== 'unset';

  const choose = (value: number | null) => {
    setSelected(value);
    setWeeklyDiningBudget(value);
  };

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingMoney}
      dialogueText="Let's talk money! 💰 How much do you usually spend eating out each week?"
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/age-gender' as never)}
      buttonText="Continue"
    >
      <View style={styles.wrap}>
        {BUDGET_OPTIONS.map((option) => (
          <OptionCard
            key={option.label}
            label={option.label}
            emoji={option.emoji}
            selected={selected !== 'unset' && selected === option.value}
            onPress={() => choose(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
});
