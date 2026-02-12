import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

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
    router.push('/onboarding/biggest-challenge' as any);
  };

  return (
    <OnboardingScreen
      title="Meet Michi"
      subtitle="Hey there! I'm Michi, your personal restaurant guide. I help people like you make confident choices that feel amazing AND save money. Ready to never stress about menus again?"
      showBack={false}
      hideProgress
      buttonText="I'm Ready"
      onContinue={handleContinue}
    >
      <View style={styles.content}>
        <ProgressBadge step={1} total={14} />

        <View style={[styles.placeholder, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardCream }]}>
          <AppText style={[styles.placeholderText, { color: theme.colors.subtext }]}>PLACEHOLDER: Hero Michi Introduction</AppText>
          <AppText style={[styles.placeholderSub, { color: theme.colors.subtext }]}>180x180 • wave / wink / magnifying glass tap states</AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

function ProgressBadge({ step, total }: { step: number; total: number }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.progressWrap, { borderColor: theme.colors.border }]}>
      <AppText style={[styles.progressText, { color: theme.colors.subtext }]}>Step {step}/{total}</AppText>
      <View style={[styles.track, { backgroundColor: theme.colors.cardSage }]}> 
        <View style={[styles.fill, { width: `${(step / total) * 100}%`, backgroundColor: theme.colors.brand }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingTop: 8,
  },
  progressWrap: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  progressText: {
    fontSize: 13,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  placeholder: {
    width: 180,
    height: 180,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  placeholderText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  placeholderSub: {
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
  },
});
