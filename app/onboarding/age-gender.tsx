import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore, Gender } from '@/src/stores/onboardingStore';

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '👨' },
  { value: 'female', label: 'Female', emoji: '👩' },
  { value: 'other', label: 'Other', emoji: '🧑' },
];

export default function AgeGenderScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { age, gender, setAge, setGender } = useOnboardingStore();
  const [ageInput, setAgeInput] = useState(age?.toString() || '');

  const handleAgeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAgeInput(cleaned);
    if (cleaned) {
      setAge(parseInt(cleaned, 10));
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/height-weight');
  };

  const canContinue = !!gender && !!age && age >= 13 && age <= 120;

  return (
    <OnboardingScreen
      title="Tell us about yourself"
      subtitle="We'll use this to calculate your daily calorie needs."
      canContinue={canContinue}
      onContinue={handleContinue}
    >
      <View style={styles.content}>
        {/* Gender Selection */}
        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext }]}>
          Gender
        </AppText>
        <View style={styles.genderRow}>
          {GENDERS.map((item) => (
            <View key={item.value} style={styles.genderOption}>
              <OptionCard
                label={item.label}
                emoji={item.emoji}
                selected={gender === item.value}
                onPress={() => setGender(item.value)}
              />
            </View>
          ))}
        </View>

        {/* Age Input */}
        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext, marginTop: 24 }]}>
          Age
        </AppText>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={ageInput}
            onChangeText={handleAgeChange}
            placeholder="Enter your age"
            placeholderTextColor={theme.colors.subtext}
            keyboardType="number-pad"
            maxLength={3}
          />
          <AppText style={[styles.inputSuffix, { color: theme.colors.subtext }]}>years</AppText>
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
  genderRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  genderOption: {
    flex: 1,
    paddingHorizontal: 6,
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
});
