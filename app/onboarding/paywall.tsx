import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import MichiMoji from '@/src/components/MichiMoji';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';

type Plan = 'annual' | 'monthly';

type Feature = {
  icon: 'scan' | 'star' | 'dollar' | 'globe';
  label: string;
  description: string;
};

const MichiExcited = require('@/assets/michi-excited.png');

const PLANS = {
  annual: { price: '$39.99', period: '/year', weekly: '$0.77/week', savings: 'SAVE 58%' },
  monthly: { price: '$7.99', period: '/month', weekly: '$1.85/week', savings: '' },
} as const;

const FEATURES: Feature[] = [
  { icon: 'scan', label: 'Unlimited menu scans', description: 'Snap any menu, get instant nutrition info' },
  { icon: 'star', label: 'Personalized top picks', description: 'AI recommendations based on your goals' },
  { icon: 'dollar', label: 'Spending & nutrition tracking', description: 'Track your dining budget alongside health goals' },
  { icon: 'globe', label: 'Menu translation', description: '50+ languages with pronunciation guides' },
];

function FeatureIcon({ icon }: { icon: Feature['icon'] }) {
  if (icon === 'scan') return <MichiMoji name="eyes" size={28} />;
  if (icon === 'star') return <MichiMoji name="celebrate" size={28} />;
  if (icon === 'dollar') return <MichiMoji name="money" size={28} />;
  return <MichiMoji name="wave" size={28} />;
}

const FEATURE_COLORS = ['#5FA6A6', '#6BAF7A', '#F2B95E', '#E86B50'];

export default function PaywallScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboardingStore();
  const { subscribe, restore } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = (plan: Plan) => {
    Haptics.selectionAsync();
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (loading) return;

    setError(null);
    setLoading(true);
    const ok = await subscribe(selectedPlan);
    setLoading(false);

    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeOnboarding();
      router.replace('/(tabs)');
      return;
    }

    setError('Purchase did not complete. You can continue and restore later from Settings.');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleRestore = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    const ok = await restore();
    setLoading(false);

    if (ok) {
      completeOnboarding();
      router.replace('/(tabs)');
      return;
    }

    setError('No active subscription found to restore.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF5E6' }]}> 
      <View style={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.heroSection}>
          <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
            <AppText style={styles.closeText}>✕</AppText>
          </TouchableOpacity>

          <View style={[styles.dot, styles.dotCoral]} />
          <View style={[styles.dot, styles.dotSage]} />
          <View style={[styles.dot, styles.dotAmber]} />
          <View style={[styles.dot, styles.dotTeal]} />

          <Image source={MichiExcited} style={styles.heroImage} resizeMode="contain" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(160)} style={styles.pill}>
          <MichiMoji name="sparkle" size={14} style={{ marginRight: 6 }} />
          <AppText style={styles.pillText}>Join today, cancel anytime!</AppText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.titleWrap}>
          <AppText style={[styles.title, { color: '#2D2418' }]}>Unlock all the best features</AppText>
          <AppText style={[styles.subtitle, { color: '#6B5B4E' }]}>Michi is waiting to dine with you wherever you go!</AppText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260)} style={styles.featuresWrap}>
          {FEATURES.map((feature, idx) => (
            <View key={feature.label} style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: `${FEATURE_COLORS[idx]}22` }]}>
                <FeatureIcon icon={feature.icon} />
              </View>
              <View style={styles.featureTextWrap}>
                <AppText style={[styles.featureTitle, { color: '#2D2418' }]}>{feature.label}</AppText>
                <AppText style={[styles.featureDescription, { color: '#9B8B7E' }]}>{feature.description}</AppText>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(320)} style={styles.planRow}>
          {(['monthly', 'annual'] as Plan[]).map((plan) => {
            const selected = selectedPlan === plan;
            const data = PLANS[plan];
            return (
              <TouchableOpacity
                key={plan}
                activeOpacity={0.9}
                onPress={() => handleSelectPlan(plan)}
                style={[
                  styles.planCard,
                  {
                    borderColor: selected ? '#E86B50' : '#F0E6D6',
                    backgroundColor: '#fff',
                  },
                ]}
              >
                {data.savings ? (
                  <View style={styles.savingsBadge}>
                    <AppText style={styles.savingsBadgeText}>{data.savings}</AppText>
                  </View>
                ) : null}

                <View style={styles.planTopRow}>
                  <View style={[styles.radioOuter, { borderColor: selected ? '#E86B50' : '#C9BAA7' }]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <AppText style={styles.planName}>{plan === 'annual' ? 'Annual' : 'Monthly'}</AppText>
                </View>

                <AppText style={styles.planPrice}>
                  {data.price}
                  <AppText style={styles.planPeriod}>{data.period}</AppText>
                </AppText>
                <AppText style={styles.planWeekly}>{data.weekly}</AppText>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(360)} style={[styles.footer, { paddingBottom: Math.max(20, insets.bottom + 8) }]}>
        <PrimaryButton
          label={loading ? 'Processing…' : 'Start 7-Day Free Trial'}
          onPress={handleSubscribe}
          disabled={loading}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <AppText style={[styles.skipText, { color: '#6B5B4E' }]}>Continue with limited features</AppText>
        </TouchableOpacity>

        {error ? <AppText style={[styles.errorText, { color: theme.colors.trafficRed }]}>{error}</AppText> : null}

        <AppText style={[styles.legalText, { color: '#9B8B7E' }]}>Cancel anytime. Subscription renews automatically.</AppText>

        <View style={styles.linkRow}>
          <TouchableOpacity onPress={handleRestore}>
            <AppText style={styles.footerLink}>Restore Purchases</AppText>
          </TouchableOpacity>
          <AppText style={styles.linkSeparator}>|</AppText>
          <AppText style={styles.footerLink}>Terms</AppText>
          <AppText style={styles.linkSeparator}>|</AppText>
          <AppText style={styles.footerLink}>Privacy</AppText>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
    justifyContent: 'space-between',
  },
  heroSection: {
    borderRadius: 28,
    backgroundColor: '#FFE8D6',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B5B4E',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.4,
  },
  dotCoral: { backgroundColor: '#E86B50', top: 26, left: 22 },
  dotSage: { backgroundColor: '#6BAF7A', top: 72, right: 24 },
  dotAmber: { backgroundColor: '#F2B95E', bottom: 34, left: 34 },
  dotTeal: { backgroundColor: '#5FA6A6', bottom: 24, right: 46 },
  heroImage: {
    width: 130,
    height: 130,
  },
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
  titleWrap: { marginBottom: 14 },
  title: {
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  featuresWrap: {
    gap: 10,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  featureDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  planRow: {
    flexDirection: 'row',
    gap: 10,
  },
  planCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    position: 'relative',
  },
  savingsBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#E86B50',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  savingsBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 7,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E86B50',
  },
  planName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2418',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2418',
  },
  planPeriod: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B5B4E',
  },
  planWeekly: {
    marginTop: 2,
    fontSize: 12,
    color: '#9B8B7E',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  skipButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  legalText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 11,
  },
  linkRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: '#6B5B4E',
    fontWeight: '600',
  },
  linkSeparator: {
    marginHorizontal: 8,
    color: '#9B8B7E',
    fontSize: 11,
  },
});
