import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

export default function MoneySuperpowersScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <OnboardingScreen
      title="Michi's Money-Saving Superpowers"
      subtitle="See how MenuScan helps you avoid hidden costs and find the best-value options fast."
      hideProgress
      buttonText="Show Me More"
      onContinue={() => router.push('/onboarding/decision-anxiety' as any)}
    >
      <View style={styles.content}>
        <ProgressBadge step={4} total={14} />
        <View style={[styles.placeholder, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardCream }]}>
          <AppText style={[styles.title, { color: theme.colors.subtext }]}>PLACEHOLDER: Feature Demo Animations</AppText>
          <AppText style={[styles.sub, { color: theme.colors.subtext }]}>Hidden costs reveal • budget tracking • sweet spot circles • savings counter</AppText>
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
  content: { gap: 14 },
  progressWrap: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 },
  progressText: { fontSize: 13 },
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%' },
  placeholder: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, minHeight: 140, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  title: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  sub: { marginTop: 6, fontSize: 11, textAlign: 'center' },
});
