import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { getAuthDiagnostics, signUp } from '@/src/lib/auth';
import MichiAssets from '@/src/utils/michiAssets';

function passwordScore(pass: string) {
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  return score;
}

export default function AccountCreationScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { firstName, email, password, setFirstName, setEmail, setPassword } = useOnboardingStore();

  const [name, setName] = useState(firstName);
  const [mail, setMail] = useState(email);
  const [pass, setPass] = useState(password);
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  React.useEffect(() => {
    const s1 = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const s2 = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  const score = passwordScore(pass);
  const passValid = score === 3;
  const confirmValid = pass.length > 0 && pass === confirmPass;
  const canContinue = name.trim().length > 1 && /@/.test(mail) && passValid && confirmValid;

  const strengthColor = useMemo(() => {
    if (score <= 1) return theme.colors.danger;
    if (score === 2) return theme.colors.warning;
    return theme.colors.success;
  }, [score, theme.colors.danger, theme.colors.success, theme.colors.warning]);

  const handleCreateAccount = async () => {
    if (loading) return false;

    setLoading(true);
    const result = await signUp(mail.trim(), pass, name.trim());
    setLoading(false);

    if (result.success) {
      setFirstName(name.trim());
      setEmail(mail.trim());
      setPassword(pass);
      router.push('/onboarding/paywall' as never);
      return true;
    }

    let message = result.error || 'Please try again';
    if (__DEV__ && message.toLowerCase().includes('network request failed')) {
      const diag = await getAuthDiagnostics();
      message = `${message}\n\n${diag}`;
    }

    Alert.alert('Account Creation Failed', message);
    return false;
  };

  return (
    <OnboardingScreen
      michiSource={keyboardOpen ? undefined : MichiAssets.onboardingWave}
      dialogueText="You're almost there! Let's set up your account so I can save all your preferences! 🎉"
      canContinue={canContinue && !loading}
      onContinue={handleCreateAccount}
      buttonText={loading ? 'Creating Account...' : 'Create Account'}
    >
      <View style={styles.wrap}>
        <Field label="First Name">
          <Input value={name} setValue={setName} placeholder="Your name" />
        </Field>

        <Field label="Email">
          <Input value={mail} setValue={setMail} placeholder="you@email.com" email />
        </Field>

        <Field label="Password">
          <Input value={pass} setValue={setPass} placeholder="Create password" secure={!showPass} />
          <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
            <AppText style={[styles.link, { color: theme.colors.brand }]}>{showPass ? 'Hide Password' : 'Show Password'}</AppText>
          </TouchableOpacity>
          <View style={[styles.strengthBarBg, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.strengthBarFill, { width: `${(score / 3) * 100}%`, backgroundColor: strengthColor }]} />
          </View>
          <AppText style={[styles.helper, { color: theme.colors.subtext }]}>At least 8 characters, 1 uppercase, 1 number</AppText>
        </Field>

        <Field label="Confirm Password">
          <Input value={confirmPass} setValue={setConfirmPass} placeholder="Re-enter password" secure={!showPass} />
          {!confirmValid && confirmPass.length > 0 ? (
            <AppText style={[styles.error, { color: theme.colors.danger }]}>Passwords do not match.</AppText>
          ) : null}
        </Field>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.colors.brand} />
            <AppText style={{ color: theme.colors.subtext, fontSize: 13 }}>Creating account...</AppText>
          </View>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useAppTheme();
  return (
    <View>
      <AppText style={{ color: t.colors.subtext, fontSize: 12, marginBottom: 6, fontWeight: '700' }}>{label}</AppText>
      {children}
    </View>
  );
}

function Input({
  value,
  setValue,
  placeholder,
  secure,
  email,
}: {
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  secure?: boolean;
  email?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <TextInput
      value={value}
      onChangeText={setValue}
      autoCapitalize={email ? 'none' : 'words'}
      keyboardType={email ? 'email-address' : 'default'}
      secureTextEntry={secure}
      style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: '#fff' }]}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.caption}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  input: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 12, height: 46 },
  link: { marginTop: 6, fontSize: 12, fontWeight: '700' },
  strengthBarBg: { marginTop: 8, height: 6, borderRadius: 999, overflow: 'hidden' },
  strengthBarFill: { height: '100%' },
  helper: { marginTop: 6, fontSize: 12 },
  error: { marginTop: 6, fontSize: 12 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
});
