import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { getProfileMichi, type MichiVariant } from '@/src/utils/michiAssets';

const PROFILE_MICHI_KEY = '@profile_michi';

const OPTIONS: Array<{ key: MichiVariant; label: string }> = [
  { key: 'avatar', label: 'Happy Michi' },
  { key: 'hero', label: 'Chef Michi' },
  { key: 'thinking', label: 'Thinking Michi' },
  { key: 'excited', label: 'Excited Michi' },
  { key: 'sad', label: 'Gentle Michi' },
  { key: 'worried', label: 'Concerned Michi' },
  { key: 'confused', label: 'Puzzled Michi' },
];

export default function ProfileSetupScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { profileMichi, setProfileMichi } = useOnboardingStore();

  const continueNext = async () => {
    await AsyncStorage.setItem(PROFILE_MICHI_KEY, profileMichi);
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingScreen
      title="Pick your Michi"
      subtitle="Choose the profile style you want to see across the app."
      buttonText="Continue"
      onContinue={continueNext}
    >
      <View style={styles.grid}>
        {OPTIONS.map((option) => {
          const selected = option.key === profileMichi;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.card,
                { borderColor: theme.colors.border, backgroundColor: '#fff' },
                selected && { borderColor: theme.colors.brand, backgroundColor: theme.colors.brand + '12' },
              ]}
              onPress={() => setProfileMichi(option.key)}
            >
              <Image source={getProfileMichi(option.key)} style={styles.image} />
              <AppText style={[styles.label, { color: theme.colors.text }]}>{option.label}</AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
  },
});
