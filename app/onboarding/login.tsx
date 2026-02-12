import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { signIn } from '@/src/lib/auth';

export default function LoginScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = /@/.test(email) && password.length >= 6;

  const handleLogin = async () => {
    if (loading) return false;

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

  return (
    <OnboardingScreen
      title="Welcome Back!"
      subtitle="Log in to your account to continue tracking."
      hideProgress
      canContinue={canContinue && !loading}
      onContinue={handleLogin}
      buttonText={loading ? 'Signing in...' : 'Log In'}
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

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.brand} />
            <AppText style={[styles.loadingText, { color: theme.colors.subtext }]}>Signing in...</AppText>
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