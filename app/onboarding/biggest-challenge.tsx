import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { useOnboardingStore, DiningChallenge } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const OPTIONS: Array<{ key: DiningChallenge; label: string; emoji: string }> = [
  { key: 'calories', label: 'counting calories is confusing', emoji: '🔥' },
  { key: 'social', label: 'social pressure to eat more', emoji: '👥' },
  { key: 'willpower', label: 'staying on track with my diet', emoji: '💪' },
  { key: 'overwhelm', label: 'menus are just overwhelming', emoji: '😵‍💫' },
];

export default function BiggestChallengeScreen() {
  const router = useRouter();
  const { diningChallenge, setDiningChallenge } = useOnboardingStore();
  const [selected, setSelected] = useState<DiningChallenge | null>(diningChallenge);

  const handleSelect = (value: DiningChallenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(value);
    setDiningChallenge(value);
  };

  const handleContinue = () => {
    if (!selected) return false;
    router.push('/onboarding/global-reality' as never);
  };

  return (
    <OnboardingScreen
      canContinue={!!selected}
      buttonText="Continue"
      onContinue={handleContinue}
      michiSource={MichiAssets.onboardingCurious}
      dialogueText="So tell me... what's been your biggest struggle when eating out?"
    >
      <View style={styles.list}>
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.key}
            label={opt.label}
            emoji={opt.emoji}
            selected={selected === opt.key}
            onPress={() => handleSelect(opt.key)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 8 },
});
