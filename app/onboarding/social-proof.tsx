import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import MichiMoji from '@/src/components/MichiMoji';
import { useAppTheme } from '@/src/theme/theme';

const REVIEWS = [
  {
    name: 'Sarah M.',
    text: 'Finally an app that tells me what to order! Lost 15 lbs in 3 months without giving up restaurants.',
    rating: 5,
  },
  {
    name: 'Mike T.',
    text: 'The calorie estimates are surprisingly accurate. Great for staying on track during business dinners.',
    rating: 5,
  },
  {
    name: 'Jessica K.',
    text: 'I used to stress about eating out. Now I just scan and pick from my Top 3. So simple!',
    rating: 5,
  },
];

export default function SocialProofScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/disclaimer');
  };

  return (
    <OnboardingScreen
      title="Join 50,000+ healthy eaters"
      subtitle="See why people love Michi: Menu Helper"
      onContinue={handleContinue}
      hideProgress
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {REVIEWS.map((review, index) => (
          <Animated.View 
            key={review.name}
            entering={FadeInUp.delay(index * 200)}
            style={[styles.reviewCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={styles.stars}>
              {[...Array(review.rating)].map((_, i) => (
                <MichiMoji key={i} name="celebrate" size={16} style={{ marginRight: 2 }} />
              ))}
            </View>
            <AppText style={[styles.reviewText, { color: theme.colors.text }]}>
              "{review.text}"
            </AppText>
            <AppText style={[styles.reviewName, { color: theme.colors.subtext }]}>
              — {review.name}
            </AppText>
          </Animated.View>
        ))}

        {/* Stats */}
        <Animated.View 
          entering={FadeInUp.delay(600)}
          style={[styles.statsCard, { backgroundColor: theme.colors.brand + '10' }]}
        >
          <View style={styles.stat}>
            <AppText style={[styles.statValue, { color: theme.colors.brand }]}>400+</AppText>
            <AppText style={[styles.statLabel, { color: theme.colors.subtext }]}>calories saved per meal</AppText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.stat}>
            <AppText style={[styles.statValue, { color: theme.colors.brand }]}>87%</AppText>
            <AppText style={[styles.statLabel, { color: theme.colors.subtext }]}>reach their goals</AppText>
          </View>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 14,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
});
