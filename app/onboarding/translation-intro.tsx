import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

export default function TranslationIntroScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <OnboardingScreen
      title="Michi Goes Global"
      subtitle="Traveling? Michi can translate menus and help you order like a local."
      hideProgress
      showBack
      buttonText="Continue"
      onContinue={() => router.push('/onboarding/biggest-challenge' as any)}
    >
      <View style={styles.content}>
        <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardCream }]}> 
          <AppText style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>🌍 Translation + Pronunciation</AppText>
          <AppText style={[styles.cardText, { color: theme.colors.subtext }]}>Scan non-English menus and get translated dishes, phonetic pronunciation, and quick ordering phrases.</AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 21,
  },
});