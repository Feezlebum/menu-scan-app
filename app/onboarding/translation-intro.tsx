import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import MichiAssets from '@/src/utils/michiAssets';

const FEATURES = [
  '📸 Instant menu scanning',
  '🧠 AI-powered nutrition analysis',
  '💰 Budget tracking built in',
  '⚠️ Allergy and diet alerts',
];

export default function TranslationIntroScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      michiSource={MichiAssets.hero}
      dialogueText="Here's my superpower — just point your camera at any menu and I'll instantly tell you the calories, nutrients, AND price of every dish! 📸✨"
      buttonText="That's Amazing!"
      onContinue={() => router.push('/onboarding/social-proof' as never)}
    >
      <View style={styles.content}>
        {FEATURES.map((feature) => (
          <View key={feature} style={styles.bulletCard}>
            <AppText style={styles.bulletText}>{feature}</AppText>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
    gap: 8,
  },
  bulletCard: {
    borderWidth: 1,
    borderColor: '#F0E6D6',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  bulletText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2418',
  },
});
