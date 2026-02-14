import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';

type Plan = 'annual' | 'monthly';

const PLANS = {
  annual: { price: '$49.99', period: '/year', savings: 'Save 48%', weekly: '$0.96/week' },
  monthly: { price: '$7.99', period: '/month', savings: '', weekly: '$1.85/week' },
};

const FEATURES = [
  { emoji: '📸', label: 'Unlimited menu scans' },
  { emoji: '🎯', label: 'Personalized Top 3 picks' },
  { emoji: '📊', label: 'Full nutrition breakdown' },
  { emoji: '✏️', label: 'Modification suggestions' },
  { emoji: '💬', label: '"What to say" scripts' },
  { emoji: '🔥', label: 'Streak tracking' },
  { emoji: '🚫', label: 'Ad-free experience' },
];

export default function PaywallScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboardingStore();
  const { subscribe } = useSubscriptionStore();
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={[styles.mascot, { backgroundColor: theme.colors.brand + '20' }]}>
            <AppText style={styles.mascotEmoji}>🥗</AppText>
          </View>
          <AppText style={[styles.title, { color: theme.colors.text }]}>
            Start Your Free Trial
          </AppText>
          <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>
            7 days free, cancel anytime
          </AppText>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.features}>
          {FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <AppText style={styles.featureEmoji}>{feature.emoji}</AppText>
              <AppText style={[styles.featureLabel, { color: theme.colors.text }]}>
                {feature.label}
              </AppText>
              <AppText style={[styles.featureCheck, { color: theme.colors.brand }]}>✓</AppText>
            </View>
          ))}
        </Animated.View>

        {/* Plans */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.plans}>
          {/* Annual Plan */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectPlan('annual')}
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === 'annual' ? theme.colors.brand + '10' : theme.colors.card,
                borderColor: selectedPlan === 'annual' ? theme.colors.brand : theme.colors.border,
              },
            ]}
          >
            {PLANS.annual.savings && (
              <View style={[styles.badge, { backgroundColor: theme.colors.brand }]}>
                <AppText style={styles.badgeText}>{PLANS.annual.savings}</AppText>
              </View>
            )}
            <View style={styles.planHeader}>
              <View style={[
                styles.radio,
                {
                  borderColor: selectedPlan === 'annual' ? theme.colors.brand : theme.colors.border,
                  backgroundColor: selectedPlan === 'annual' ? theme.colors.brand : 'transparent',
                }
              ]}>
                {selectedPlan === 'annual' && <View style={styles.radioInner} />}
              </View>
              <View>
                <AppText style={[styles.planName, { color: theme.colors.text }]}>Annual</AppText>
                <AppText style={[styles.planWeekly, { color: theme.colors.subtext }]}>
                  {PLANS.annual.weekly}
                </AppText>
              </View>
            </View>
            <AppText style={[styles.planPrice, { color: theme.colors.text }]}>
              {PLANS.annual.price}
              <AppText style={[styles.planPeriod, { color: theme.colors.subtext }]}>
                {PLANS.annual.period}
              </AppText>
            </AppText>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectPlan('monthly')}
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === 'monthly' ? theme.colors.brand + '10' : theme.colors.card,
                borderColor: selectedPlan === 'monthly' ? theme.colors.brand : theme.colors.border,
              },
            ]}
          >
            <View style={styles.planHeader}>
              <View style={[
                styles.radio,
                {
                  borderColor: selectedPlan === 'monthly' ? theme.colors.brand : theme.colors.border,
                  backgroundColor: selectedPlan === 'monthly' ? theme.colors.brand : 'transparent',
                }
              ]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
              <View>
                <AppText style={[styles.planName, { color: theme.colors.text }]}>Monthly</AppText>
                <AppText style={[styles.planWeekly, { color: theme.colors.subtext }]}>
                  {PLANS.monthly.weekly}
                </AppText>
              </View>
            </View>
            <AppText style={[styles.planPrice, { color: theme.colors.text }]}>
              {PLANS.monthly.price}
              <AppText style={[styles.planPeriod, { color: theme.colors.subtext }]}>
                {PLANS.monthly.period}
              </AppText>
            </AppText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeIn.delay(500)} style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
        <PrimaryButton
          label={loading ? 'Processing…' : 'Start 7-Day Free Trial'}
          onPress={handleSubscribe}
          disabled={loading}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <AppText style={[styles.skipText, { color: theme.colors.subtext }]}> 
            Continue with limited features
          </AppText>
        </TouchableOpacity>
        {error ? (
          <AppText style={[styles.errorText, { color: theme.colors.trafficRed }]}>{error}</AppText>
        ) : null}
        <AppText style={[styles.legal, { color: theme.colors.subtext }]}> 
          Cancel anytime. Subscription renews automatically.
        </AppText>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 0,
  },
  mascot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  mascotEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureLabel: {
    flex: 1,
    fontSize: 15,
  },
  featureCheck: {
    fontSize: 16,
    fontWeight: '600',
  },
  plans: {
    gap: 12,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
  },
  planWeekly: {
    fontSize: 13,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '400',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  legal: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});
