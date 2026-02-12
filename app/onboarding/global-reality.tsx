import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

const DATA_POINTS = [
  '🌍 40%+ of food budgets go to dining out globally',
  '💸 $191/month average in US, €180 in Europe, £165 in UK',
  '📈 People eat out 4-7x per week but feel lost making choices',
  '⚠️ Restaurant meals cost 5x more than cooking at home',
];

export default function GlobalRealityScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <OnboardingScreen
      title="The Global Restaurant Reality"
      subtitle="You're not the problem. The system makes good decisions harder than they should be."
      hideProgress
      buttonText="Continue"
      onContinue={() => router.push('/onboarding/profile-setup')}
    >
      <View style={styles.content}>
        <ProgressBadge step={3} total={14} />

        <View style={[styles.placeholder, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardCream }]}> 
          <AppText style={[styles.placeholderTitle, { color: theme.colors.subtext }]}>PLACEHOLDER: Data Visualization Support</AppText>
          <AppText style={[styles.placeholderSub, { color: theme.colors.subtext }]}>Money rain + bar chart growth + supportive Michi bubble</AppText>
        </View>

        <View style={styles.list}>
          {DATA_POINTS.map((point) => (
            <View key={point} style={[styles.pointCard, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}>
              <AppText style={[styles.pointText, { color: theme.colors.text }]}>{point}</AppText>
            </View>
          ))}
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
  progressWrap: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  progressText: { fontSize: 13 },
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%' },
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderSub: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
  },
  list: { gap: 8 },
  pointCard: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  pointText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
