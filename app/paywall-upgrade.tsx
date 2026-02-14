import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useAppTheme } from '@/src/theme/theme';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';

export default function PaywallUpgradeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { startTrial, subscribe, restore } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrial = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const ok = await startTrial();
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)/scan');
    } else {
      setError('Could not start trial. Please check store setup and try again.');
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const ok = await subscribe(plan);
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)/scan');
    } else {
      setError('Purchase did not complete. Please try again.');
    }
  };

  const handleRestore = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const ok = await restore();
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)/scan');
    } else {
      setError('No active subscription found to restore.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}> 
      <View style={styles.content}>
        <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Go Pro</AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>Unlimited scans, advanced insights, and premium translation features.</AppText>

        <View style={[styles.planCard, { borderColor: theme.colors.border }]}> 
          <AppText style={[styles.planTitle, { color: theme.colors.text }]}>Annual</AppText>
          <AppText style={[styles.planPrice, { color: theme.colors.brand }]}>$39.99/year</AppText>
          <AppText style={[styles.planMeta, { color: theme.colors.subtext }]}>Best value</AppText>
          <PrimaryButton label={loading ? 'Please wait...' : 'Choose Annual'} onPress={() => handleSubscribe('annual')} disabled={loading} />
        </View>

        <View style={[styles.planCard, { borderColor: theme.colors.border }]}> 
          <AppText style={[styles.planTitle, { color: theme.colors.text }]}>Monthly</AppText>
          <AppText style={[styles.planPrice, { color: theme.colors.brand }]}>$7.99/month</AppText>
          <PrimaryButton label={loading ? 'Please wait...' : 'Choose Monthly'} onPress={() => handleSubscribe('monthly')} disabled={loading} />
        </View>

        <TouchableOpacity onPress={handleTrial} disabled={loading} style={styles.trialButton}>
          <AppText style={[styles.trialText, { color: theme.colors.subtext }]}>Start 7-day free trial</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} disabled={loading} style={styles.restoreButton}>
          <AppText style={[styles.restoreText, { color: theme.colors.brand }]}>Restore Purchases</AppText>
        </TouchableOpacity>

        {error ? <AppText style={[styles.errorText, { color: theme.colors.trafficRed }]}>{error}</AppText> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 14 },
  title: { fontSize: 32, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  planCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 },
  planTitle: { fontSize: 18, fontWeight: '700' },
  planPrice: { fontSize: 20, fontWeight: '700' },
  planMeta: { fontSize: 13, marginBottom: 4 },
  trialButton: { alignItems: 'center', marginTop: 4 },
  trialText: { fontSize: 14 },
  restoreButton: { alignItems: 'center', marginTop: 2 },
  restoreText: { fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 13, textAlign: 'center' },
});