import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileBackground = require('@/assets/botanicals/profile-background.png');
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useHealthStore } from '@/src/stores/healthStore';
import { healthService } from '@/src/services/healthService';
import { trackerService, TrackerApp } from '@/src/services/trackerService';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { 
    goal, 
    dietType, 
    macroPriority,
    intolerances,
    dislikes,
    reset: resetOnboarding,
  } = useOnboardingStore();

  // For now, derive a display name from goal or use a placeholder
  // TODO: Add name to onboarding flow if needed
  const name = 'User';

  const {
    appleHealthConnected,
    appleHealthError,
    myFitnessPalEnabled,
    loseItEnabled,
    isConnecting,
    connectAppleHealth,
    disconnectAppleHealth,
    toggleMyFitnessPal,
    toggleLoseIt,
    checkAppleHealthStatus,
  } = useHealthStore();

  const [checkingApps, setCheckingApps] = useState<Record<TrackerApp, boolean>>({
    myFitnessPal: false,
    loseIt: false,
  });

  // Check Apple Health status on mount
  useEffect(() => {
    checkAppleHealthStatus();
  }, []);

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

  const handleAppleHealthPress = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Health is only available on iOS devices.');
      return;
    }

    if (appleHealthConnected) {
      // Disconnect
      Alert.alert(
        'Disconnect Apple Health',
        'Scanned meals will no longer be logged to Apple Health.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disconnect', 
            style: 'destructive',
            onPress: disconnectAppleHealth,
          },
        ]
      );
    } else {
      // Connect
      const success = await connectAppleHealth();
      if (success) {
        Alert.alert('Connected!', 'Scanned meals will now be logged to Apple Health.');
      } else if (appleHealthError) {
        Alert.alert('Connection Failed', appleHealthError);
      }
    }
  };

  const handleTrackerPress = async (app: TrackerApp) => {
    const appName = app === 'myFitnessPal' ? 'MyFitnessPal' : 'Lose It!';
    const isEnabled = app === 'myFitnessPal' ? myFitnessPalEnabled : loseItEnabled;
    const toggle = app === 'myFitnessPal' ? toggleMyFitnessPal : toggleLoseIt;

    if (isEnabled) {
      // Disable
      Alert.alert(
        `Disable ${appName}`,
        `You won't be prompted to log to ${appName} after scans.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: toggle },
        ]
      );
    } else {
      // Check if app is installed and enable
      setCheckingApps(prev => ({ ...prev, [app]: true }));
      const installed = await trackerService.isAppInstalled(app);
      setCheckingApps(prev => ({ ...prev, [app]: false }));

      if (installed) {
        toggle();
        Alert.alert(
          `${appName} Enabled`,
          `After scanning a menu, you'll have the option to open ${appName} to log your meal.`
        );
      } else {
        Alert.alert(
          `${appName} Not Found`,
          `Would you like to download ${appName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Download', 
              onPress: () => trackerService.openAppStore(app),
            },
          ]
        );
      }
    }
  };

  const getTrackerStatus = (app: TrackerApp) => {
    if (checkingApps[app]) return 'Checking...';
    const isEnabled = app === 'myFitnessPal' ? myFitnessPalEnabled : loseItEnabled;
    return isEnabled ? 'Enabled' : 'Connect';
  };

  const getTrackerStatusColor = (app: TrackerApp) => {
    const isEnabled = app === 'myFitnessPal' ? myFitnessPalEnabled : loseItEnabled;
    return isEnabled ? theme.colors.brand : theme.colors.subtext;
  };

  return (
    <ImageBackground source={ProfileBackground} style={styles.container} resizeMode="cover">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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

        {/* Connected Trackers */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Export to Tracker
          </AppText>
          <Card style={styles.prefsCard}>
            {/* Apple Health - iOS only */}
            {Platform.OS === 'ios' && (
              <>
                <TouchableOpacity 
                  style={styles.trackerRow} 
                  onPress={handleAppleHealthPress}
                  disabled={isConnecting}
                >
                  <View style={styles.trackerLeft}>
                    <FontAwesome name="heart" size={18} color="#FF3B30" />
                    <AppText style={[styles.trackerName, { color: theme.colors.text }]}>
                      Apple Health
                    </AppText>
                  </View>
                  {isConnecting ? (
                    <ActivityIndicator size="small" color={theme.colors.brand} />
                  ) : (
                    <AppText style={[
                      styles.trackerStatus, 
                      { color: appleHealthConnected ? theme.colors.brand : theme.colors.subtext }
                    ]}>
                      {appleHealthConnected ? 'Connected' : 'Connect'}
                    </AppText>
                  )}
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              </>
            )}
            
            {/* MyFitnessPal */}
            <TouchableOpacity 
              style={styles.trackerRow}
              onPress={() => handleTrackerPress('myFitnessPal')}
              disabled={checkingApps.myFitnessPal}
            >
              <View style={styles.trackerLeft}>
                <FontAwesome name="cutlery" size={18} color="#0066CC" />
                <AppText style={[styles.trackerName, { color: theme.colors.text }]}>
                  MyFitnessPal
                </AppText>
              </View>
              {checkingApps.myFitnessPal ? (
                <ActivityIndicator size="small" color={theme.colors.brand} />
              ) : (
                <AppText style={[styles.trackerStatus, { color: getTrackerStatusColor('myFitnessPal') }]}>
                  {getTrackerStatus('myFitnessPal')}
                </AppText>
              )}
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            {/* Lose It! */}
            <TouchableOpacity 
              style={styles.trackerRow}
              onPress={() => handleTrackerPress('loseIt')}
              disabled={checkingApps.loseIt}
            >
              <View style={styles.trackerLeft}>
                <FontAwesome name="line-chart" size={18} color="#FF9500" />
                <AppText style={[styles.trackerName, { color: theme.colors.text }]}>
                  Lose It!
                </AppText>
              </View>
              {checkingApps.loseIt ? (
                <ActivityIndicator size="small" color={theme.colors.brand} />
              ) : (
                <AppText style={[styles.trackerStatus, { color: getTrackerStatusColor('loseIt') }]}>
                  {getTrackerStatus('loseIt')}
                </AppText>
              )}
            </TouchableOpacity>
          </Card>
          <AppText style={[styles.trackerHint, { color: theme.colors.subtext }]}>
            {Platform.OS === 'ios' 
              ? 'Apple Health logs automatically. Other apps open after scans for easy logging.'
              : 'Enable trackers to quickly log scanned meals.'}
          </AppText>
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
    </ImageBackground>
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
  safeArea: {
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
  trackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  trackerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  trackerStatus: {
    fontSize: 14,
  },
  trackerHint: {
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 4,
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
