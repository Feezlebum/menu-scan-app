import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';

export default function DisclaimerScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/paywall');
  };

  return (
    <OnboardingScreen
      title="Quick heads up!"
      subtitle="Just a tiny note from me before we dive in~ 💚"
      buttonText="I Understand"
      onContinue={handleContinue}
    >
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.iconRow}>
            <FontAwesome name="cutlery" size={24} color={theme.colors.brand} />
          </View>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
            Nutrition Estimates
          </AppText>
          <AppText style={[styles.cardText, { color: theme.colors.subtext }]}>
            Our calorie and macro estimates are based on typical restaurant portions and may vary from actual values. Use them as helpful guidance, not exact measurements.
          </AppText>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.iconRow}>
            <FontAwesome name="exclamation-triangle" size={24} color="#FF9500" />
          </View>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
            Allergen Information
          </AppText>
          <AppText style={[styles.cardText, { color: theme.colors.subtext }]}>
            While we flag potential allergens based on common ingredients, we cannot guarantee accuracy. Always confirm allergens directly with restaurant staff before ordering.
          </AppText>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.iconRow}>
            <FontAwesome name="heart" size={24} color="#FF3B30" />
          </View>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
            Not Medical Advice
          </AppText>
          <AppText style={[styles.cardText, { color: theme.colors.subtext }]}>
            This app provides general guidance for healthier eating. It's not a substitute for professional medical or dietary advice. Consult a healthcare provider for personalized guidance.
          </AppText>
        </Card>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 8,
  },
  card: {
    padding: 20,
  },
  iconRow: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
