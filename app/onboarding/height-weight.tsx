import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function HeightWeightScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { heightCm, currentWeightKg, setHeight, setCurrentWeight } = useOnboardingStore();
  
  const [heightInput, setHeightInput] = useState(heightCm?.toString() || '');
  const [weightInput, setWeightInput] = useState(currentWeightKg?.toString() || '');

  const handleHeightChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setHeightInput(cleaned);
    if (cleaned) {
      setHeight(parseInt(cleaned, 10));
    }
  };

  const handleWeightChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    setWeightInput(cleaned);
    if (cleaned) {
      setCurrentWeight(parseFloat(cleaned));
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/goal-weight');
  };

  const validHeight = heightCm && heightCm >= 100 && heightCm <= 250;
  const validWeight = currentWeightKg && currentWeightKg >= 30 && currentWeightKg <= 300;
  const canContinue = validHeight && validWeight;

  return (
    <OnboardingScreen
      title="Height & current weight"
      subtitle="This helps calculate your daily calorie needs."
      canContinue={!!canContinue}
      onContinue={handleContinue}
    >
      <View style={styles.content}>
        {/* Height Input */}
        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext }]}>
          Height
        </AppText>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={heightInput}
            onChangeText={handleHeightChange}
            placeholder="170"
            placeholderTextColor={theme.colors.subtext}
            keyboardType="number-pad"
            maxLength={3}
          />
          <AppText style={[styles.inputSuffix, { color: theme.colors.subtext }]}>cm</AppText>
        </View>

        {/* Weight Input */}
        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext, marginTop: 24 }]}>
          Current Weight
        </AppText>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={weightInput}
            onChangeText={handleWeightChange}
            placeholder="70"
            placeholderTextColor={theme.colors.subtext}
            keyboardType="decimal-pad"
            maxLength={5}
          />
          <AppText style={[styles.inputSuffix, { color: theme.colors.subtext }]}>kg</AppText>
        </View>

        {/* Encouragement */}
        <View style={[styles.encouragement, { backgroundColor: theme.colors.brand + '10' }]}>
          <AppText style={[styles.encouragementText, { color: theme.colors.brand }]}>
            💚 Your information is private and never shared.
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
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
  encouragement: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
  },
  encouragementText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
