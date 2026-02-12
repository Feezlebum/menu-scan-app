import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore, SpendingGoal } from '@/src/stores/onboardingStore';
import { useSpendingStore } from '@/src/stores/spendingStore';

const GOALS: Array<{ key: SpendingGoal; label: string }> = [
  { key: 'stay_within_budget', label: 'Stay within budget' },
  { key: 'track_spending', label: 'Track spending' },
  { key: 'better_value', label: 'Find better value' },
  { key: 'cut_costs', label: 'Cut costs over time' },
];

export default function SpendingGoalsBudgetScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { weeklyDiningBudget, setWeeklyDiningBudget, spendingGoals, toggleSpendingGoal } = useOnboardingStore();
  const { setWeeklyBudget } = useSpendingStore();
  const [budgetInput, setBudgetInput] = useState(weeklyDiningBudget ? String(weeklyDiningBudget) : '100');

  const parsedBudget = Number.parseFloat(budgetInput.replace(/[^0-9.]/g, ''));
  const budgetValue = Number.isFinite(parsedBudget) ? parsedBudget : 0;
  const canContinue = budgetValue >= 25 && spendingGoals.length > 0;

  const weeklyProjection = useMemo(() => Math.max(0, budgetValue), [budgetValue]);

  const commitAndContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const value = Number.parseFloat(budgetInput.replace(/[^0-9.]/g, ''));
    const finalBudget = Number.isFinite(value) ? Math.max(25, Math.min(300, value)) : 100;
    setWeeklyDiningBudget(finalBudget);
    setWeeklyBudget(finalBudget);
    router.push('/onboarding/tell-about-you' as any);
  };

  return (
    <OnboardingScreen
      title="Your Spending Goals & Budget"
      subtitle="Set your weekly target and tell Michi what success looks like."
      hideProgress
      canContinue={canContinue}
      buttonText="Continue"
      onContinue={commitAndContinue}
    >
      <View style={styles.content}>
        <ProgressBadge step={8} total={14} />

        <View style={[styles.inputWrap, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}>
          <AppText style={[styles.dollar, { color: theme.colors.subtext }]}>$</AppText>
          <TextInput
            value={budgetInput}
            onChangeText={(v) => setBudgetInput(v.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="100"
            placeholderTextColor={theme.colors.subtext}
          />
        </View>

        <AppText style={[styles.helper, { color: theme.colors.subtext }]}>Weekly target: ${weeklyProjection.toFixed(0)} • recommended range $25–$200+</AppText>

        {GOALS.map((goal) => {
          const active = spendingGoals.includes(goal.key);
          return (
            <TouchableOpacity
              key={goal.key}
              style={[
                styles.goalRow,
                { borderColor: theme.colors.border, backgroundColor: '#fff' },
                active && { borderColor: theme.colors.brand, backgroundColor: theme.colors.brand + '14' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggleSpendingGoal(goal.key);
              }}
            >
              <AppText style={[styles.goalText, { color: theme.colors.text }]}>{goal.label}</AppText>
              {active ? <AppText style={{ color: theme.colors.brand }}>✓</AppText> : null}
            </TouchableOpacity>
          );
        })}
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
  inputWrap: { borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  dollar: { fontSize: 18, marginRight: 6 },
  input: { flex: 1, height: 46, fontSize: 17 },
  helper: { fontSize: 12, marginBottom: 4 },
  goalRow: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalText: { fontSize: 14 },
});
