import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { dailyCalorieTarget, goal, macroPriority } = useOnboardingStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleScan = () => {
    router.push('/(tabs)/scan');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <AppText style={[styles.greeting, { color: theme.colors.subtext }]}>
            {getGreeting()} 👋
          </AppText>
          <AppText style={[styles.title, { color: theme.colors.text }]}>
            Ready to eat smart?
          </AppText>
        </View>

        {/* Calorie Budget Card */}
        <Card style={[styles.budgetCard, { backgroundColor: theme.colors.brand }]}>
          <AppText style={styles.budgetLabel}>Today's Budget</AppText>
          <View style={styles.budgetRow}>
            <AppText style={styles.budgetValue}>{dailyCalorieTarget || 2000}</AppText>
            <AppText style={styles.budgetUnit}>cal remaining</AppText>
          </View>
          <View style={[styles.budgetProgress, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <View style={[styles.budgetProgressFill, { width: '100%' }]} />
          </View>
        </Card>

        {/* Quick Scan CTA */}
        <Card style={styles.scanCard}>
          <View style={styles.scanContent}>
            <View style={[styles.scanIcon, { backgroundColor: theme.colors.brand + '15' }]}>
              <AppText style={styles.scanEmoji}>📸</AppText>
            </View>
            <View style={styles.scanText}>
              <AppText style={[styles.scanTitle, { color: theme.colors.text }]}>
                Scan a Menu
              </AppText>
              <AppText style={[styles.scanSubtitle, { color: theme.colors.subtext }]}>
                Get personalized recommendations
              </AppText>
            </View>
          </View>
          <PrimaryButton label="Scan Now" onPress={handleScan} />
        </Card>

        {/* Stats Preview */}
        <View style={styles.statsRow}>
          <StatCard 
            emoji="🔥" 
            value="0" 
            label="Day streak" 
            theme={theme} 
          />
          <StatCard 
            emoji="📊" 
            value="0" 
            label="Scans today" 
            theme={theme} 
          />
        </View>

        {/* Tips */}
        <Card style={styles.tipCard}>
          <AppText style={[styles.tipLabel, { color: theme.colors.subtext }]}>
            💡 Quick Tip
          </AppText>
          <AppText style={[styles.tipText, { color: theme.colors.text }]}>
            {macroPriority === 'highprotein' 
              ? "Look for grilled proteins - they're usually your best bet for high protein, lower calorie meals."
              : 'Ask for dressings and sauces on the side to control your calorie intake.'
            }
          </AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ emoji, value, label, theme }: { emoji: string; value: string; label: string; theme: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <AppText style={styles.statEmoji}>{emoji}</AppText>
      <AppText style={[styles.statValue, { color: theme.colors.text }]}>{value}</AppText>
      <AppText style={[styles.statLabel, { color: theme.colors.subtext }]}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  budgetCard: {
    padding: 20,
    marginBottom: 16,
  },
  budgetLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  budgetValue: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    marginRight: 8,
  },
  budgetUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  budgetProgress: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  scanCard: {
    padding: 20,
    marginBottom: 16,
  },
  scanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scanEmoji: {
    fontSize: 28,
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scanSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  tipCard: {
    padding: 16,
  },
  tipLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
