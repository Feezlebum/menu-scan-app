import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

export default function MeetMichiScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  useEffect(() => {
    setStep(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [setStep]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/biggest-challenge' as never);
  };

  return (
    <OnboardingScreen
      showBack={false}
      hideProgress={false}
      buttonText="Let's Go!"
      onContinue={handleContinue}
      michiSource={MichiAssets.onboardingWave}
      dialogueText="Hiii! 👋 I'm Michi — your personal menu buddy! I use AI to scan restaurant menus and find the perfect dishes for YOUR goals. No more guessing, no more guilt!"
    >
      <View style={styles.loginPrompt}>
        <AppText style={[styles.loginText, { color: theme.colors.subtext }]}>Already have an account?</AppText>
        <TouchableOpacity onPress={() => router.push('/onboarding/login' as never)}>
          <AppText style={[styles.loginLink, { color: theme.colors.brand }]}>Log In</AppText>
        </TouchableOpacity>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
