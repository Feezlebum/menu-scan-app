import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { requestPasswordReset, signIn } from '@/src/lib/auth';

export default function LoginScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const canContinue = /@/.test(email) && password.length >= 6;

  const handleLogin = async () => {
    if (loading || resettingPassword) return false;

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/' as any);
      return true;
    }

    Alert.alert('Login Failed', result.error || 'Please check your credentials');
    return false;
  };

  const handleForgotPassword = async () => {
    if (loading || resettingPassword) return;

    const candidate = email.trim();
    if (!candidate || !candidate.includes('@')) {
      Alert.alert('Reset password', 'Enter your account email first, then tap Forgot password.');
      return;
    }

    setResettingPassword(true);
    const result = await requestPasswordReset(candidate);
    setResettingPassword(false);

    if (result.success) {
      Alert.alert('Check your email', 'If this account exists, a password reset link has been sent.');
      return;
    }

    Alert.alert('Could not send reset email', result.error || 'Please try again.');
  };

  const handleAccountHelp = async () => {
    const support = 'support@menuscan.app';
    const mailto = `mailto:${support}?subject=${encodeURIComponent('Need help accessing my MenuScan account')}`;

    try {
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
        return;
      }
    } catch {
      // fallback alert below
    }

    Alert.alert('Need help?', `Please contact ${support} and include any prior receipt/subscription details so we can help find your account email.`);
  };

  return (
    <OnboardingScreen
      title="Welcome Back!"
      subtitle="Log in to your account to continue tracking."
      hideProgress
      canContinue={canContinue && !loading && !resettingPassword}
      onContinue={handleLogin}
      buttonText={loading ? 'Signing in...' : resettingPassword ? 'Sending reset...' : 'Log In'}
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
            editable={!loading}
          />
        </Field>

        <Field label="Password">
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            editable={!loading}
          />
        </Field>

        <TouchableOpacity onPress={handleForgotPassword} disabled={loading || resettingPassword}>
          <AppText style={[styles.linkText, { color: theme.colors.brand, opacity: loading || resettingPassword ? 0.6 : 1 }]}>Forgot password?</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAccountHelp} disabled={loading || resettingPassword}>
          <AppText style={[styles.helpText, { color: theme.colors.subtext, opacity: loading || resettingPassword ? 0.6 : 1 }]}>Need help accessing your account or forgot your email?</AppText>
        </TouchableOpacity>

        {(loading || resettingPassword) && (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.brand} />
            <AppText style={[styles.loadingText, { color: theme.colors.subtext }]}>{loading ? 'Signing in...' : 'Sending reset email...'}</AppText>
          </View>
        )}
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
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
  },
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