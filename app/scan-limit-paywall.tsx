import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
import { useAppTheme } from '@/src/theme/theme';

const MichiWorried = require('@/assets/michi-worried.png');
const MichiExcited = require('@/assets/michi-excited.png');

export default function ScanLimitPaywallScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { resetDate } = useLocalSearchParams<{ resetDate?: string }>();
  const { markPaywallShown, paywallInteractions } = useSubscriptionStore();

  useEffect(() => {
    markPaywallShown();
  }, [markPaywallShown]);

  const daysUntilReset = useMemo(() => {
    if (!resetDate) return 7;
    const resetAt = new Date(resetDate);
    const now = new Date();
    const ms = Math.max(0, resetAt.getTime() - now.getTime());
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [resetDate]);

  const isSoft = paywallInteractions < 3;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}> 
      <View style={styles.content}>
        <Image source={isSoft ? MichiWorried : MichiExcited} style={styles.michi} />

        <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}> 
          {isSoft ? "You've used your 2 free scans this week" : 'Ready to unlock unlimited scans?'}
        </AppText>

        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}> 
          {isSoft
            ? `Your scans reset in ${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'}.`
            : 'You are getting strong value already — Pro gives unlimited scans and advanced insights.'}
        </AppText>

        <View style={styles.valueProps}>
          <Bullet text="Unlimited menu scans" />
          <Bullet text="Advanced insights" />
          <Bullet text="Premium translation features" />
          <Bullet text="7-day free trial" />
        </View>

        <PrimaryButton label="Upgrade to Pro" onPress={() => router.push('/paywall-upgrade' as any)} />

        <TouchableOpacity style={styles.waitButton} onPress={() => router.back()}>
          <AppText style={[styles.waitText, { color: theme.colors.subtext }]}>
            {isSoft ? `I'll wait ${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'}` : 'Maybe later'}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Bullet({ text }: { text: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.bulletRow}>
      <AppText style={[styles.bulletDot, { color: theme.colors.brand }]}>•</AppText>
      <AppText style={[styles.bulletText, { color: theme.colors.text }]}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  michi: { width: 100, height: 100, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  valueProps: { gap: 8, marginBottom: 20 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bulletDot: { fontSize: 18, lineHeight: 18 },
  bulletText: { fontSize: 15 },
  waitButton: { marginTop: 14, alignItems: 'center' },
  waitText: { fontSize: 14 },
});