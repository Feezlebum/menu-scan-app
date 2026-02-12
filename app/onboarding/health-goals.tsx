import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore, HealthGoalV2 } from '@/src/stores/onboardingStore';

const OPTIONS: Array<{ key: HealthGoalV2; label: string }> = [
  { key: 'lose_weight', label: 'Lose weight' },
  { key: 'build_muscle', label: 'Build muscle' },
  { key: 'maintain_weight', label: 'Maintain weight' },
  { key: 'eat_healthier', label: 'Eat healthier' },
  { key: 'athletic_performance', label: 'Athletic performance' },
  { key: 'manage_health_conditions', label: 'Manage health conditions' },
];

export default function HealthGoalsScreen() {
  const theme = useAppTheme();
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
      title="Your Health Goals"
      subtitle="Choose your primary goal. We'll personalize every recommendation around it."
      hideProgress
      canContinue={!!selected}
      buttonText="Continue"
      onContinue={() => router.push('/onboarding/spending-goals-budget' as any)}
    >
      <View style={styles.content}>
        <ProgressBadge step={7} total={14} />
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.option,
              { borderColor: theme.colors.border, backgroundColor: '#fff' },
              selected === opt.key && { borderColor: theme.colors.brand, backgroundColor: theme.colors.brand + '14' },
            ]}
            onPress={() => choose(opt.key)}
          >
            <View style={[styles.dot, { borderColor: theme.colors.brand }, selected === opt.key && { backgroundColor: theme.colors.brand }]} />
            <AppText style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreen>
  );
}

function ProgressBadge({ step, total }: { step: number; total: number }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.progressWrap, { borderColor: theme.colors.border }]}>
      <AppText style={[styles.progressText, { color: theme.colors.subtext }]}>Step {step}/{total}</AppText>
      <View style={[styles.track, { backgroundColor: theme.colors.cardSage }]}>
        <View style={[styles.fill, { width: `${(step / total) * 100}%`, backgroundColor: theme.colors.brand }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 10 },
  progressWrap: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 8, marginBottom: 4 },
  progressText: { fontSize: 13 },
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%' },
  option: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  optionText: { fontSize: 14, flex: 1 },
});
