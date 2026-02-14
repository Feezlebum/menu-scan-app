import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import MichiMoji from '@/src/components/MichiMoji';
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
          <View style={styles.titleRow}>
            <MichiMoji name="wave" size={20} style={{ marginRight: 8 }} />
            <AppText style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Translation + Pronunciation</AppText>
          </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 21,
  },
});