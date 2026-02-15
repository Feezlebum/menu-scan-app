import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { ProgressBar } from './ProgressBar';
import { MichiHero } from './MichiHero';
import { MichiDialogue } from './MichiDialogue';
import { useOnboardingStore, TOTAL_ONBOARDING_STEPS } from '@/src/stores/onboardingStore';

interface Props {
  title?: string;
  subtitle?: string;
  dialogueText?: string;
  michiSource?: ImageSourcePropType;
  children: ReactNode;
  canContinue?: boolean;
  onContinue?: () => void | boolean | Promise<void | boolean>;
  showBack?: boolean;
  buttonText?: string;
  hideProgress?: boolean;
}

export function OnboardingScreen({
  title,
  subtitle,
  dialogueText,
  michiSource,
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

  const handleContinue = async () => {
    if (onContinue) {
      const result = await onContinue();
      if (result === false) return;
    }
    nextStep();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}> 
      {!hideProgress ? (
        <View style={styles.progressTop}>
          <ProgressBar current={currentStep + 1} total={TOTAL_ONBOARDING_STEPS} />
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          {showBack && currentStep > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <AppText style={[styles.backText, { color: theme.colors.subtext }]}>←</AppText>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {michiSource ? (
            <View style={styles.heroWrap}>
              <MichiHero source={michiSource} />
            </View>
          ) : null}

          {dialogueText ? (
            <MichiDialogue text={dialogueText} />
          ) : title ? (
            <View style={styles.legacyTitleWrap}>
              <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
              {subtitle ? (
                <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>{subtitle}</AppText>
              ) : null}
            </View>
          ) : null}

          <View style={styles.body}>{children}</View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={buttonText} onPress={handleContinue} disabled={!canContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  legacyTitleWrap: {
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
});
