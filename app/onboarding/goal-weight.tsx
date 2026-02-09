import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function GoalWeightScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goal, currentWeightKg, goalWeightKg, setGoalWeight } = useOnboardingStore();
  
  const [weightInput, setWeightInput] = useState(goalWeightKg?.toString() || '');

  const handleWeightChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setWeightInput(cleaned);
    if (cleaned) {
      setGoalWeight(parseFloat(cleaned));
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/activity');
  };

  // Skip if goal is health or maintain
  const showGoalWeight = goal === 'lose' || goal === 'gain';
  
  if (!showGoalWeight) {
    // Auto-navigate if no goal weight needed
    handleContinue();
    return null;
  }

  const validGoalWeight = goalWeightKg && goalWeightKg >= 30 && goalWeightKg <= 300;
  const isRealistic = currentWeightKg && goalWeightKg && 
    (goal === 'lose' ? goalWeightKg < currentWeightKg : goalWeightKg > currentWeightKg);

  const canContinue = validGoalWeight && isRealistic;

  const getMotivation = () => {
    if (!currentWeightKg || !goalWeightKg) return '';
    const diff = Math.abs(currentWeightKg - goalWeightKg);
    if (diff <= 5) return 'A realistic and achievable goal! 🎯';
    if (diff <= 15) return 'Great goal! Steady progress wins. 💪';
    return 'Big goals start with small steps. You got this! 🚀';
  };

  return (
    <OnboardingScreen
      title={goal === 'lose' ? "What's your target weight?" : "What's your goal weight?"}
      subtitle={goal === 'lose' 
        ? "We'll help you get there sustainably."
        : "We'll help you build muscle the right way."
      }
      canContinue={!!canContinue}
      onContinue={handleContinue}
    >
      <View style={styles.content}>
        {/* Current Weight Display */}
        <View style={[styles.currentWeight, { backgroundColor: theme.colors.card }]}>
          <AppText style={[styles.currentLabel, { color: theme.colors.subtext }]}>
            Current weight
          </AppText>
          <AppText style={[styles.currentValue, { color: theme.colors.text }]}>
            {currentWeightKg} kg
          </AppText>
        </View>

        {/* Goal Weight Input */}
        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext, marginTop: 24 }]}>
          {goal === 'lose' ? 'Target Weight' : 'Goal Weight'}
        </AppText>
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: theme.colors.card, 
            borderColor: validGoalWeight && isRealistic ? theme.colors.brand : theme.colors.border 
          }
        ]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={weightInput}
            onChangeText={handleWeightChange}
            placeholder={goal === 'lose' ? '65' : '80'}
            placeholderTextColor={theme.colors.subtext}
            keyboardType="decimal-pad"
            maxLength={5}
          />
          <AppText style={[styles.inputSuffix, { color: theme.colors.subtext }]}>kg</AppText>
        </View>

        {/* Validation feedback */}
        {goalWeightKg && !isRealistic && (
          <AppText style={[styles.error, { color: theme.colors.danger }]}>
            {goal === 'lose' 
              ? 'Target should be less than current weight'
              : 'Goal should be more than current weight'
            }
          </AppText>
        )}

        {/* Motivation */}
        {canContinue && (
          <View style={[styles.motivation, { backgroundColor: theme.colors.brand + '10' }]}>
            <AppText style={[styles.motivationText, { color: theme.colors.brand }]}>
              {getMotivation()}
            </AppText>
          </View>
        )}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  currentWeight: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentLabel: {
    fontSize: 14,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  inputSuffix: {
    fontSize: 16,
    marginLeft: 8,
  },
  error: {
    fontSize: 14,
    marginTop: 8,
  },
  motivation: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  motivationText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
