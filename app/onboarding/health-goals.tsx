import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, HealthGoalV2 } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const OPTIONS: Array<{ key: HealthGoalV2; label: string; emoji: string }> = [
  { key: 'lose_weight', label: 'lose weight', emoji: '🏋️' },
  { key: 'build_muscle', label: 'build muscle', emoji: '💪' },
  { key: 'maintain_weight', label: 'maintain my weight', emoji: '⚖️' },
  { key: 'eat_healthier', label: 'just eat healthier', emoji: '🥗' },
  { key: 'athletic_performance', label: 'athletic performance', emoji: '🏃' },
  { key: 'manage_health_conditions', label: 'manage a health condition', emoji: '🏥' },
];

export default function HealthGoalsScreen() {
  const router = useRouter();
  const { healthGoalV2, setHealthGoalV2, setGoal } = useOnboardingStore();
  const [selected, setSelected] = useState<HealthGoalV2 | null>(healthGoalV2);

  const choose = (goal: HealthGoalV2) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(goal);
    setHealthGoalV2(goal);
    if (goal === 'lose_weight') setGoal('lose');
    else if (goal === 'build_muscle') setGoal('gain');
    else if (goal === 'maintain_weight') setGoal('maintain');
    else setGoal('health');
  };

  return (
    <OnboardingScreen
      canContinue={!!selected}
      buttonText="Continue"
      onContinue={() => router.push('/onboarding/diet-type' as never)}
      michiSource={MichiAssets.onboardingBuff}
      dialogueText="Time to get serious! 💪 What's your main goal right now?"
    >
      <View style={styles.content}>
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.key}
            label={opt.label}
            emoji={opt.emoji}
            selected={selected === opt.key}
            onPress={() => choose(opt.key)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 8 },
});
