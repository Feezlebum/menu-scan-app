import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore, DiningChallenge } from '@/src/stores/onboardingStore';

const OPTIONS: Array<{ key: DiningChallenge; label: string; reaction: string }> = [
  { key: 'overwhelm', label: 'I feel overwhelmed by menu choices', reaction: 'PLACEHOLDER: Confused Michi (question marks)' },
  { key: 'social', label: 'I worry about spending too much', reaction: 'PLACEHOLDER: Concerned Michi (surprised at receipt)' },
  { key: 'calories', label: 'I struggle to pick healthier options', reaction: 'PLACEHOLDER: Determined Michi (notepad)' },
  { key: 'willpower', label: 'I choose treats and regret it later', reaction: 'PLACEHOLDER: Anxious Michi (fidgeting)' },
];

export default function BiggestChallengeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { diningChallenge, setDiningChallenge } = useOnboardingStore();
  const [selected, setSelected] = useState<DiningChallenge | null>(diningChallenge);

  const handleSelect = (value: DiningChallenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(value);
    setDiningChallenge(value);
  };

  const handleContinue = () => {
    if (!selected) return;
    router.push('/onboarding/global-reality' as any);
  };

  const selectedMeta = OPTIONS.find((o) => o.key === selected);

  return (
    <OnboardingScreen
      title="What's tough for you?"
      subtitle="Ooh, tell me — what's your biggest struggle when eating out? I wanna help! 💚"
      hideProgress
      canContinue={!!selected}
      buttonText="Continue"
      onContinue={handleContinue}
    >
      <View style={styles.content}>
        <ProgressBadge step={2} total={14} />

        <View style={styles.list}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.option,
                { borderColor: theme.colors.border, backgroundColor: '#fff' },
                selected === opt.key && { borderColor: theme.colors.brand, backgroundColor: theme.colors.brand + '14' },
              ]}
              onPress={() => handleSelect(opt.key)}
            >
              <View style={[styles.dot, { borderColor: theme.colors.brand }, selected === opt.key && { backgroundColor: theme.colors.brand }]} />
              <AppText style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.reactionPlaceholder, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardCream }]}>
          <AppText style={[styles.reactionText, { color: theme.colors.subtext }]}>
            {selectedMeta?.reaction || 'PLACEHOLDER: Emotional Reactions Set (select an option)'}
          </AppText>
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
  list: { gap: 10 },
  option: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
  },
  reactionPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  reactionText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
