import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore, Gender } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const GENDERS: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function AgeGenderScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { age, gender, setAge, setGender } = useOnboardingStore();
  const [ageInput, setAgeInput] = useState(age?.toString() || '');

  const parsedAge = Number.parseInt(ageInput || '0', 10);
  const ageValid = Number.isFinite(parsedAge) && parsedAge >= 13 && parsedAge <= 120;
  const canContinue = !!gender && ageValid;

  const handleAgeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAgeInput(cleaned);
    if (!cleaned) return;
    setAge(Number.parseInt(cleaned, 10));
  };

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingMeasure}
      dialogueText="Almost there! I need a few details to calculate your perfect nutrition targets. Don't worry — this stays between us! 🤫"
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/height-weight' as never)}
      buttonText="Continue"
    >
      <View style={styles.content}>
        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext }]}>Age</AppText>
        <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={ageInput}
            onChangeText={handleAgeChange}
            placeholder="25"
            placeholderTextColor={theme.colors.caption}
            keyboardType="number-pad"
            maxLength={3}
          />
          <AppText style={[styles.inputSuffix, { color: theme.colors.subtext }]}>Years</AppText>
        </View>
        {!ageValid && ageInput.length > 0 ? (
          <AppText style={[styles.error, { color: theme.colors.danger }]}>Age must be between 13 and 120.</AppText>
        ) : null}

        <AppText style={[styles.sectionLabel, { color: theme.colors.subtext, marginTop: 18 }]}>Gender</AppText>
        <View style={styles.genderRow}>
          {GENDERS.map((item) => {
            const selected = gender === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setGender(item.value)}
                style={[
                  styles.pill,
                  {
                    borderColor: selected ? theme.colors.brand : theme.colors.border,
                    backgroundColor: selected ? '#FFF0EC' : '#fff',
                  },
                ]}
              >
                <AppText style={[styles.pillText, { color: theme.colors.text }]}>{item.label}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    marginTop: 6,
    fontSize: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
