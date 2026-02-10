import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useSpendingStore } from '@/src/stores/spendingStore';

const MichiSpending = require('@/assets/michi-spending.png');

const PRESETS = [
  { label: 'Under $50', value: 50 },
  { label: '$50-100', value: 100 },
  { label: '$100-200', value: 200 },
  { label: '$200+', value: 250 },
];

export default function WeeklyBudgetScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { weeklyDiningBudget, setWeeklyDiningBudget } = useOnboardingStore();
  const { setWeeklyBudget } = useSpendingStore();

  const [inputValue, setInputValue] = useState(
    weeklyDiningBudget !== null ? String(weeklyDiningBudget) : ''
  );

  const parsed = inputValue.trim() === '' ? null : Number.parseFloat(inputValue);
  const isValid = parsed === null || (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1000);

  const continueNext = () => {
    const budget = parsed === null || Number.isNaN(parsed) ? null : parsed;
    setWeeklyDiningBudget(budget);
    setWeeklyBudget(budget);
    router.push('/onboarding/intolerances');
  };

  const choosePreset = (value: number) => {
    setInputValue(String(value));
  };

  return (
    <OnboardingScreen
      title="💰 Weekly Dining Budget"
      subtitle="How much do you typically spend eating out per week?"
      canContinue={isValid}
      onContinue={continueNext}
      buttonText={parsed === null ? 'Skip for now' : 'Continue'}
    >
      <View style={styles.content}>
        <Image source={MichiSpending} style={styles.heroImage} resizeMode="contain" />
        <View style={[styles.inputWrap, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}>
          <AppText style={[styles.currency, { color: theme.colors.text }]}>$</AppText>
          <TextInput
            value={inputValue}
            onChangeText={(t) => setInputValue(t.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="100"
            placeholderTextColor={theme.colors.caption}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>

        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[styles.presetBtn, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}
              onPress={() => choosePreset(preset.value)}
            >
              <AppText style={[styles.presetText, { color: theme.colors.text }]}>{preset.label}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        {parsed !== null && parsed > 500 && (
          <AppText style={[styles.warning, { color: theme.colors.trafficAmber }]}>That’s on the higher side — just making sure this is intentional.</AppText>
        )}

        <AppText style={[styles.helper, { color: theme.colors.subtext }]}>
          This helps track spending alongside your health goals.
        </AppText>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    gap: 14,
  },
  heroImage: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 4,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 24,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
  },
  warning: {
    fontSize: 13,
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
  },
});
