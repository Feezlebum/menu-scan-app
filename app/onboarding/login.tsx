import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { getAuthDiagnostics, requestMagicLinkSignIn, signIn } from '@/src/lib/auth';

export default function LoginScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  const canContinue = /@/.test(email) && password.length >= 6;

  const handleLogin = async () => {
    if (loading || sendingMagicLink) return false;

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)/' as any);
      return true;
    }

    let message = result.error || 'Please check your credentials';
    if (__DEV__ && message.toLowerCase().includes('network request failed')) {
      const diag = await getAuthDiagnostics();
      message = `${message}\n\n${diag}`;
    }

    Alert.alert('Login Failed', message);
    return false;
  };

  const handleForgotPassword = () => {
    const candidate = email.trim();
    router.push(
      candidate
        ? (`/onboarding/forgot-password?email=${encodeURIComponent(candidate)}` as any)
        : ('/onboarding/forgot-password' as any)
    );
  };

  const handleMagicLink = async () => {
    if (loading || sendingMagicLink) return;

    const candidate = email.trim();
    if (!candidate || !candidate.includes('@')) {
      Alert.alert('Magic Link', 'Enter your account email first, then tap Email me a sign-in link.');
      return;
    }

    setSendingMagicLink(true);
    const result = await requestMagicLinkSignIn(candidate);
    setSendingMagicLink(false);

    if (result.success) {
      Alert.alert('Check your email', 'We sent a magic sign-in link. Open it on this device to continue.');
      return;
    }

    Alert.alert('Could not send magic link', result.error || 'Please try again.');
  };

  const handleAccountHelp = async () => {
    const support = 'support@menuscan.app';
    const mailto = `mailto:${support}?subject=${encodeURIComponent('Need help accessing my Michi account')}`;

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
      canContinue={canContinue && !loading && !sendingMagicLink}
      onContinue={handleLogin}
      buttonText={loading ? 'Signing in...' : sendingMagicLink ? 'Sending link...' : 'Log In'}
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

        <TouchableOpacity onPress={handleMagicLink} disabled={loading || sendingMagicLink}>
          <AppText style={[styles.linkText, { color: theme.colors.brand, opacity: loading || sendingMagicLink ? 0.6 : 1 }]}>Email me a sign-in link</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword} disabled={loading || sendingMagicLink}>
          <AppText style={[styles.linkText, { color: theme.colors.brand, opacity: loading || sendingMagicLink ? 0.6 : 1 }]}>Forgot password?</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAccountHelp} disabled={loading || sendingMagicLink}>
          <AppText style={[styles.helpText, { color: theme.colors.subtext, opacity: loading || sendingMagicLink ? 0.6 : 1 }]}>Need help accessing your account or forgot your email?</AppText>
        </TouchableOpacity>

        {(loading || sendingMagicLink) && (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.brand} />
            <AppText style={[styles.loadingText, { color: theme.colors.subtext }]}>{loading ? 'Signing in...' : 'Sending magic link...'}</AppText>
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