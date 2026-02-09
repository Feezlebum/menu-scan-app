import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { 
    name,
    goal, 
    dietType, 
    macroPriority,
    dailyCalorieTarget,
    intolerances,
    dislikes,
    resetOnboarding,
  } = useOnboardingStore();

  const formatGoal = (g: string | null) => {
    const goals: Record<string, string> = {
      lose: 'Lose Weight',
      maintain: 'Maintain Weight',
      gain: 'Build Muscle',
      health: 'Eat Healthier',
    };
    return goals[g || ''] || 'Not set';
  };

  const formatDiet = (d: string | null) => {
    const diets: Record<string, string> = {
      none: 'No restrictions',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
      paleo: 'Paleo',
      lowcarb: 'Low Carb',
    };
    return diets[d || ''] || 'No restrictions';
  };

  const formatMacroPriority = (m: string | null) => {
    const priorities: Record<string, string> = {
      balanced: 'Balanced',
      highprotein: 'High Protein',
      lowcarb: 'Low Carb',
      lowcal: 'Low Calorie',
    };
    return priorities[m || ''] || 'Balanced';
  };

  const handleRedoOnboarding = () => {
    Alert.alert(
      'Redo Setup',
      'This will reset your preferences and take you through onboarding again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/onboarding');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.brand }]}>
            <AppText style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : '?'}
            </AppText>
          </View>
          <AppText style={[styles.name, { color: theme.colors.text }]}>
            {name || 'User'}
          </AppText>
          <View style={[styles.calorieBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <FontAwesome name="fire" size={14} color={theme.colors.brand} />
            <AppText style={[styles.calorieText, { color: theme.colors.text }]}>
              {dailyCalorieTarget || 2000} cal/day target
            </AppText>
          </View>
        </View>

        {/* Diet Preferences */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Diet Preferences
          </AppText>
          <Card style={styles.prefsCard}>
            <ProfileRow 
              icon="bullseye" 
              label="Goal" 
              value={formatGoal(goal)} 
              theme={theme} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ProfileRow 
              icon="leaf" 
              label="Diet Type" 
              value={formatDiet(dietType)} 
              theme={theme} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ProfileRow 
              icon="pie-chart" 
              label="Macro Focus" 
              value={formatMacroPriority(macroPriority)} 
              theme={theme} 
            />
          </Card>
        </View>

        {/* Restrictions */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Restrictions
          </AppText>
          <Card style={styles.prefsCard}>
            <ProfileRow 
              icon="ban" 
              label="Allergies/Intolerances" 
              value={intolerances.length > 0 ? intolerances.join(', ') : 'None'} 
              theme={theme} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ProfileRow 
              icon="thumbs-down" 
              label="Foods to Avoid" 
              value={dislikes.length > 0 ? dislikes.join(', ') : 'None'} 
              theme={theme} 
            />
          </Card>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Subscription
          </AppText>
          <Card style={styles.subscriptionCard}>
            <View style={styles.subscriptionRow}>
              <View>
                <AppText style={[styles.planName, { color: theme.colors.text }]}>
                  Free Plan
                </AppText>
                <AppText style={[styles.planDesc, { color: theme.colors.subtext }]}>
                  3 scans remaining this week
                </AppText>
              </View>
              <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: theme.colors.brand }]}>
                <AppText style={styles.upgradeText}>Upgrade</AppText>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleRedoOnboarding}>
            <Card style={styles.actionCard}>
              <View style={styles.actionRow}>
                <FontAwesome name="refresh" size={18} color={theme.colors.text} />
                <AppText style={[styles.actionText, { color: theme.colors.text }]}>
                  Redo Setup Questionnaire
                </AppText>
                <FontAwesome name="chevron-right" size={14} color={theme.colors.subtext} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <AppText style={[styles.version, { color: theme.colors.subtext }]}>
          MenuScan v1.0.0
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value, theme }: { 
  icon: string; 
  label: string; 
  value: string; 
  theme: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <FontAwesome name={icon as any} size={16} color={theme.colors.brand} />
        <AppText style={[styles.rowLabel, { color: theme.colors.subtext }]}>{label}</AppText>
      </View>
      <AppText style={[styles.rowValue, { color: theme.colors.text }]}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  calorieText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  prefsCard: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '500',
    maxWidth: '50%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  subscriptionCard: {
    padding: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
  },
  planDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  upgradeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionCard: {
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    paddingBottom: 40,
  },
});
