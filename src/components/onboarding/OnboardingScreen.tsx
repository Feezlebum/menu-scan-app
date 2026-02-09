import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { ProgressBar } from './ProgressBar';
import { useOnboardingStore, TOTAL_ONBOARDING_STEPS } from '@/src/stores/onboardingStore';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  canContinue?: boolean;
  onContinue?: () => void;
  showBack?: boolean;
  buttonText?: string;
  hideProgress?: boolean;
}

export function OnboardingScreen({
  title,
  subtitle,
  children,
  canContinue = true,
  onContinue,
  showBack = true,
  buttonText = 'Continue',
  hideProgress = false,
}: Props) {
  const theme = useAppTheme();
  const router = useRouter();
  const { currentStep, prevStep, nextStep } = useOnboardingStore();

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
      router.back();
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    nextStep();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        {showBack && currentStep > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <AppText style={[styles.backText, { color: theme.colors.subtext }]}>
              ← Back
            </AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        {!hideProgress && (
          <View style={styles.progressContainer}>
            <ProgressBar current={currentStep + 1} total={TOTAL_ONBOARDING_STEPS} />
          </View>
        )}
        
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AppText style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </AppText>
        {subtitle && (
          <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>
            {subtitle}
          </AppText>
        )}
        
        <View style={styles.body}>
          {children}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          label={buttonText}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
