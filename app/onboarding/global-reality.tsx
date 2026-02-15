import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import MichiAssets from '@/src/utils/michiAssets';

const PAIN_POINTS = [
  'I never know what is actually healthy on the menu',
  'I always spend more than I planned',
  'I just pick something random and hope for the best',
  'I feel guilty after eating out',
];

export default function GlobalRealityScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingEmpathetic}
      dialogueText="I totally get it... you're not alone. Here's what I hear from people just like you:"
      buttonText="I Can Relate"
      onContinue={() => router.push('/onboarding/translation-intro' as never)}
    >
      <View style={styles.content}>
        {PAIN_POINTS.map((point, idx) => (
          <Animated.View
            key={point}
            entering={FadeInRight.delay(idx * 400)}
            style={[styles.pointCard, { borderColor: theme.colors.border, backgroundColor: '#FFFFFF' }]}
          >
            <AppText style={[styles.pointText, { color: theme.colors.text }]}>😔 {point}</AppText>
          </Animated.View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { marginTop: 8, gap: 10 },
  pointCard: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pointText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
