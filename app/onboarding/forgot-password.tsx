import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { requestPasswordReset } from '@/src/lib/auth';

export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [sending, setSending] = useState(false);

  const canContinue = /@/.test(email) && !sending;

  const handleSendReset = async () => {
    if (sending) return false;

    setSending(true);
    const result = await requestPasswordReset(email.trim());
    setSending(false);

    if (!result.success) {
      Alert.alert('Could not send reset email', result.error || 'Please try again.');
      return false;
    }

    Alert.alert(
      'Check your email',
      'If this account exists, a password reset link has been sent.',
      [{ text: 'OK', onPress: () => router.back() }]
    );

    // Prevent onboarding step increment for this utility screen.
    return false;
  };

  return (
    <OnboardingScreen
      title="Forgot your password?"
      subtitle="No worries! Pop in your email and I'll send you a reset link ✨"
      hideProgress
      canContinue={canContinue}
      onContinue={handleSendReset}
      buttonText={sending ? 'Sending...' : 'Send Reset Link'}
      showBack
    >
      <View style={styles.form}>
        <Field label="Email">
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            editable={!sending}
          />
        </Field>

        {sending ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.brand} />
            <AppText style={[styles.loadingText, { color: theme.colors.subtext }]}>Sending reset email...</AppText>
          </View>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={styles.field}>
      <AppText style={[styles.fieldLabel, { color: theme.colors.subtext }]}>{label}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 20 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 14, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingText: { fontSize: 14 },
});
