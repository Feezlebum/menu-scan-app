import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { DiningChallenge, useOnboardingStore } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const OPTIONS: Array<{ value: DiningChallenge; label: string; emoji: string }> = [
  { value: 'calories', label: 'figuring out the calories and nutrition', emoji: '🔢' },
  { value: 'social', label: 'dealing with social pressure to eat certain things', emoji: '👫' },
  { value: 'willpower', label: 'sticking to my goals when everything looks good', emoji: '🧠' },
  { value: 'overwhelm', label: "the menu is too big and i can't decide", emoji: '📖' },
];

export default function DecisionAnxietyScreen() {
  const router = useRouter();
  const { diningChallenge, setDiningChallenge } = useOnboardingStore();
  const [selected, setSelected] = useState<DiningChallenge | null>(diningChallenge);

  const choose = (value: DiningChallenge) => {
    Haptics.selectionAsync();
    setSelected(value);
    setDiningChallenge(value);
  };

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingCurious}
      dialogueText="One more thing! When you're at a restaurant, what's the hardest part?"
      canContinue={!!selected}
      buttonText="Continue"
      onContinue={() => router.push('/onboarding/account-creation' as never)}
    >
      <View style={styles.content}>
        {OPTIONS.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            emoji={option.emoji}
            selected={selected === option.value}
            onPress={() => choose(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
  },
});
