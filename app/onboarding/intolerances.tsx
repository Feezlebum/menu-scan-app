import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

const INTOLERANCES = [
  { value: 'gluten', label: 'Gluten', emoji: '🤔' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'nuts', label: 'Tree Nuts', emoji: '🥜' },
  { value: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { value: 'soy', label: 'Soy', emoji: '🫘' },
  { value: 'eggs', label: 'Eggs', emoji: '🥚' },
  { value: 'fish', label: 'Fish', emoji: '🐟' },
];

export default function IntolerancesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { intolerances, toggleIntolerance } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/onboarding/dislikes');
  };

  return (
    <OnboardingScreen
      title="Any food allergies?"
      subtitle="We'll filter these out completely. Select all that apply."
      canContinue={true} // Can skip
      onContinue={handleContinue}
      buttonText={intolerances.length > 0 ? 'Continue' : 'None of these'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.warning, { backgroundColor: theme.colors.warning + '15' }]}>
          <AppText style={[styles.warningText, { color: theme.colors.warning }]}>
            ⚠️ For severe allergies, always verify with restaurant staff.
          </AppText>
        </View>
        
        {INTOLERANCES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            selected={intolerances.includes(item.value)}
            onPress={() => toggleIntolerance(item.value)}
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
  warning: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
