import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import MichiAssets from '@/src/utils/michiAssets';

export default function SocialProofScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [stat, setStat] = useState(0);

  useEffect(() => {
    let mounted = true;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      if (!mounted) return;
      setStat(Math.min(i, 86));
      if (i >= 86) clearInterval(id);
    }, 28);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingNervous}
      dialogueText="See?! That's why you need me! 😅 I'll make sure you always know exactly what you're eating."
      buttonText="Let's fix that!"
      onContinue={() => router.push('/onboarding/health-goals' as never)}
    >
      <View style={styles.center}>
        <AppText style={[styles.big, { color: theme.colors.brand }]}>{stat}%</AppText>
        <AppText style={[styles.sub, { color: theme.colors.subtext }]}>of people underestimate their restaurant calories</AppText>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    marginTop: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  big: {
    fontSize: 58,
    fontWeight: '800',
    lineHeight: 64,
  },
  sub: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
