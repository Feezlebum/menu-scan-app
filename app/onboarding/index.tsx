import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function WelcomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const handleContinue = () => {
    setStep(0);
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingScreen
      title="Welcome to MenuScan"
      subtitle="Your personal restaurant menu guide. Scan any menu and get personalized healthy recommendations."
      showBack={false}
      hideProgress
      buttonText="Let's Get Started"
      onContinue={handleContinue}
    >
      <View style={styles.mascotContainer}>
        {/* Mascot placeholder */}
        <View style={[styles.mascotPlaceholder, { backgroundColor: theme.colors.brand + '20' }]}>
          <AppText style={styles.mascotEmoji}>🥗</AppText>
        </View>
        
        <View style={styles.features}>
          <FeatureItem emoji="📸" text="Scan any restaurant menu" />
          <FeatureItem emoji="✨" text="Get personalized Top 3 picks" />
          <FeatureItem emoji="🎯" text="Stay on track with your goals" />
          <FeatureItem emoji="📊" text="Traffic light nutrition guide" />
        </View>
      </View>
    </OnboardingScreen>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  const theme = useAppTheme();
  
  return (
    <View style={styles.featureItem}>
      <AppText style={styles.featureEmoji}>{emoji}</AppText>
      <AppText style={[styles.featureText, { color: theme.colors.text }]}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  mascotContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  mascotEmoji: {
    fontSize: 72,
  },
  features: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
