import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
import { useAppTheme } from '@/src/theme/theme';
import MichiMoji from '@/src/components/MichiMoji';

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
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF5E6' }]}> 
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Image source={isSoft ? MichiWorried : MichiExcited} style={styles.michi} resizeMode="contain" />
        </View>

        <View style={styles.pill}>
          <MichiMoji name="sparkle" size={14} style={{ marginRight: 6 }} />
          <AppText style={styles.pillText}>Join today, cancel anytime!</AppText>
        </View>

        <AppText style={[styles.title, { color: '#2D2418', fontFamily: theme.fonts.heading.semiBold }]}> 
          {isSoft ? 'You used your 2 free scans this week' : 'Ready to unlock unlimited scans?'}
        </AppText>

        <AppText style={[styles.subtitle, { color: '#6B5B4E' }]}> 
          {isSoft
            ? `Your scans reset in ${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'} or start your free trial now.`
            : 'Pro gives unlimited scans and advanced insights.'}
        </AppText>

        <View style={styles.valueProps}>
          <Bullet text="Unlimited menu scans" />
          <Bullet text="Personalized top picks" />
          <Bullet text="Spending & nutrition tracking" />
          <Bullet text="Menu translation support" />
        </View>

        <PrimaryButton label="Start 7-Day Free Trial" onPress={() => router.push('/paywall-upgrade' as any)} />

        <TouchableOpacity style={styles.waitButton} onPress={() => router.back()}>
          <AppText style={[styles.waitText, { color: '#6B5B4E' }]}>Continue with limited features</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Bullet({ text }: { text: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.bulletRow}>
      <MichiMoji name="thumbsup" size={13} />
      <AppText style={[styles.bulletText, { color: theme.colors.text }]}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  heroSection: {
    borderRadius: 24,
    backgroundColor: '#FFE8D6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginBottom: 14,
  },
  michi: { width: 118, height: 118, alignSelf: 'center' },
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6BAF7A',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  pillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  valueProps: { gap: 10, marginBottom: 20 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bulletText: { fontSize: 15 },
  waitButton: { marginTop: 14, alignItems: 'center' },
  waitText: { fontSize: 14 },
});
