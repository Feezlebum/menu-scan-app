import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore, Goal, DietType, MacroPriority } from '@/src/stores/onboardingStore';
import { useHealthStore } from '@/src/stores/healthStore';
import { trackerService, TrackerApp } from '@/src/services/trackerService';

const HomeBackground = require('@/assets/botanicals/home-background.png');
const MichiAvatar = require('@/assets/michi-avatar.png');
const MichiHero = require('@/assets/michi-hero.png');
const MichiThinking = require('@/assets/michi-magnifying-glass.png');

const PROFILE_PHOTO_KEY = '@profile_photo';
const PROFILE_MICHI_KEY = '@profile_michi';

type MichiVariant = 'avatar' | 'hero' | 'thinking';

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

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedMichi, setSelectedMichi] = useState<MichiVariant>('avatar');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [checkingApps, setCheckingApps] = useState<Record<TrackerApp, boolean>>({
    myFitnessPal: false,
    loseIt: false,
  });

  useEffect(() => {
    checkAppleHealthStatus();
    loadAvatarSettings();
  }, []);

  const loadAvatarSettings = async () => {
    try {
      const [savedPhoto, savedMichi] = await Promise.all([
        AsyncStorage.getItem(PROFILE_PHOTO_KEY),
        AsyncStorage.getItem(PROFILE_MICHI_KEY),
      ]);

      if (savedPhoto) setProfilePhoto(savedPhoto);
      if (savedMichi === 'avatar' || savedMichi === 'hero' || savedMichi === 'thinking') {
        setSelectedMichi(savedMichi);
      }
    } catch {
      // non-blocking
    }
  };

  const saveProfilePhoto = async (uri: string) => {
    await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
    setProfilePhoto(uri);
  };

  const saveMichiVariant = async (variant: MichiVariant) => {
    await AsyncStorage.setItem(PROFILE_MICHI_KEY, variant);
    setSelectedMichi(variant);
    if (profilePhoto) {
      await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
      setProfilePhoto(null);
    }
  };

  const formatDatabaseString = (str: string): string => {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
          },
        },
      ]
    );
  };

  const requestPhotoPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need photo access to set your profile picture.');
      return false;
    }
    return true;
  };

  const handlePhotoSelect = async () => {
    const granted = await requestPhotoPermission();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const filename = `profile_${Date.now()}.jpg`;
    const destination = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ from: result.assets[0].uri, to: destination });
    await saveProfilePhoto(destination);
    setAvatarModalVisible(false);
  };

  const handleAppleHealthPress = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Health is only available on iOS devices.');
      return;
    }

    if (appleHealthConnected) {
      Alert.alert(
        'Disconnect Apple Health',
        'Scanned meals will no longer be logged to Apple Health.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disconnect', style: 'destructive', onPress: disconnectAppleHealth },
        ]
      );
      return;
    }

    const success = await connectAppleHealth();
    if (success) {
      Alert.alert('Connected!', 'Scanned meals will now be logged to Apple Health.');
    } else if (appleHealthError) {
      Alert.alert('Connection Failed', appleHealthError);
    }
  };

  const handleTrackerPress = async (app: TrackerApp) => {
    const appName = app === 'myFitnessPal' ? 'MyFitnessPal' : 'Lose It!';
    const isEnabled = app === 'myFitnessPal' ? myFitnessPalEnabled : loseItEnabled;
    const toggle = app === 'myFitnessPal' ? toggleMyFitnessPal : toggleLoseIt;

    if (isEnabled) {
      Alert.alert(
        `Disable ${appName}`,
        `You won't be prompted to log to ${appName} after scans.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: toggle },
        ]
      );
      return;
    }

    setCheckingApps((prev) => ({ ...prev, [app]: true }));
    const installed = await trackerService.isAppInstalled(app);
    setCheckingApps((prev) => ({ ...prev, [app]: false }));

    if (installed) {
      toggle();
      Alert.alert(
        `${appName} Enabled`,
        `After scanning a menu, you'll have the option to open ${appName} to log your meal.`
      );
      return;
    }

    Alert.alert(`${appName} Not Found`, `Would you like to download ${appName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Download', onPress: () => trackerService.openAppStore(app) },
    ]);
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

  const heroMessage = useMemo(() => {
    const messages: Record<Goal, string> = {
      lose: 'Every scan gets you closer to your goal! 💪',
      gain: 'Building those gains, one meal at a time! 🔥',
      maintain: 'Staying consistent is the key to success! ⚖️',
      health: 'Making healthier choices every day! 🌱',
    };

    return messages[goal || 'health'];
  }, [goal]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.heroSection, { borderBottomColor: theme.colors.border }]} edges={['top']}>
        <View style={styles.heroContent}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => setAvatarModalVisible(true)} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.brand }]}>
                <Image source={getMichiSource(selectedMichi)} style={styles.michiFallback} />
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.colors.secondary }]}>
              <FontAwesome name="camera" size={12} color={theme.colors.text} />
            </View>
          </TouchableOpacity>

          <AppText style={[styles.welcomeTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Your Profile</AppText>
          <AppText style={[styles.motivationText, { color: theme.colors.subtext }]}>{heroMessage}</AppText>
        </View>
      </SafeAreaView>

      <ImageBackground source={HomeBackground} style={styles.contentSection} resizeMode="cover">
        <View style={styles.contentOverlay}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Your Preferences</AppText>

              <Card style={[styles.preferencesCard, { backgroundColor: theme.colors.cardSage }]}>
                <PreferenceRow icon="bullseye" label="Goal" value={formatGoal(goal)} theme={theme} />
                <Divider theme={theme} />
                <PreferenceRow icon="cutlery" label="Diet Type" value={formatDiet(dietType)} theme={theme} />
                <Divider theme={theme} />
                <PreferenceRow icon="pie-chart" label="Macro Focus" value={formatMacroPriority(macroPriority)} theme={theme} />
              </Card>

              {(intolerances.length > 0 || dislikes.length > 0) && (
                <Card style={[styles.restrictionsCard, { backgroundColor: theme.colors.cardCream }]}>
                  {intolerances.length > 0 && (
                    <RestrictionsRow
                      icon="warning"
                      label="Allergies/Intolerances"
                      items={intolerances.map(formatDatabaseString)}
                      color={theme.colors.trafficRed}
                      theme={theme}
                    />
                  )}
                  {intolerances.length > 0 && dislikes.length > 0 && <Divider theme={theme} />}
                  {dislikes.length > 0 && (
                    <RestrictionsRow
                      icon="ban"
                      label="Foods to Avoid"
                      items={dislikes.map(formatDatabaseString)}
                      color={theme.colors.trafficAmber}
                      theme={theme}
                    />
                  )}
                </Card>
              )}
            </View>

            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Export to Tracker</AppText>
              <Card style={styles.preferencesCard}>
                {Platform.OS === 'ios' && (
                  <>
                    <TrackerRow
                      icon="heart"
                      iconColor="#FF3B30"
                      label="Apple Health"
                      status={appleHealthConnected ? 'Connected' : 'Connect'}
                      statusColor={appleHealthConnected ? theme.colors.brand : theme.colors.subtext}
                      onPress={handleAppleHealthPress}
                      loading={isConnecting}
                      theme={theme}
                    />
                    <Divider theme={theme} />
                  </>
                )}

                <TrackerRow
                  icon="cutlery"
                  iconColor="#0066CC"
                  label="MyFitnessPal"
                  status={getTrackerStatus('myFitnessPal')}
                  statusColor={getTrackerStatusColor('myFitnessPal')}
                  onPress={() => handleTrackerPress('myFitnessPal')}
                  loading={checkingApps.myFitnessPal}
                  theme={theme}
                />
                <Divider theme={theme} />
                <TrackerRow
                  icon="line-chart"
                  iconColor="#FF9500"
                  label="Lose It!"
                  status={getTrackerStatus('loseIt')}
                  statusColor={getTrackerStatusColor('loseIt')}
                  onPress={() => handleTrackerPress('loseIt')}
                  loading={checkingApps.loseIt}
                  theme={theme}
                />
              </Card>
              <AppText style={[styles.trackerHint, { color: theme.colors.subtext }]}> 
                {Platform.OS === 'ios'
                  ? 'Apple Health logs automatically. Other apps open after scans for easy logging.'
                  : 'Enable trackers to quickly log scanned meals.'}
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Actions</AppText>
              <TouchableOpacity onPress={handleRedoOnboarding}>
                <Card style={styles.actionCard}>
                  <View style={styles.actionRow}>
                    <FontAwesome name="refresh" size={18} color={theme.colors.text} />
                    <AppText style={[styles.actionText, { color: theme.colors.text }]}>Redo Setup Questionnaire</AppText>
                    <FontAwesome name="chevron-right" size={14} color={theme.colors.subtext} />
                  </View>
                </Card>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Card style={[styles.infoCard, { backgroundColor: theme.colors.cardCream }]}> 
                <AppText style={[styles.infoTitle, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>MenuScan v1.0.0</AppText>
                <AppText style={[styles.infoSubtitle, { color: theme.colors.subtext }]}>Built to make healthier menu choices easier.</AppText>
              </Card>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      <AvatarModal
        visible={avatarModalVisible}
        onClose={() => setAvatarModalVisible(false)}
        onPickPhoto={handlePhotoSelect}
        onPickMichi={async (variant) => {
          await saveMichiVariant(variant);
          setAvatarModalVisible(false);
        }}
      />
    </View>
  );
}

function getMichiSource(variant: MichiVariant) {
  if (variant === 'hero') return MichiHero;
  if (variant === 'thinking') return MichiThinking;
  return MichiAvatar;
}

const PreferenceRow: React.FC<{ icon: string; label: string; value: string; theme: any }> = ({ icon, label, value, theme }) => (
  <View style={styles.preferenceRow}>
    <View style={styles.preferenceLeft}>
      <FontAwesome name={icon as any} size={18} color={theme.colors.brand} />
      <AppText style={[styles.preferenceLabel, { color: theme.colors.text }]}>{label}</AppText>
    </View>
    <AppText style={[styles.preferenceValue, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>{value}</AppText>
  </View>
);

const RestrictionsRow: React.FC<{
  icon: string;
  label: string;
  items: string[];
  color: string;
  theme: any;
}> = ({ icon, label, items, color, theme }) => (
  <View style={styles.restrictionsRow}>
    <View style={styles.restrictionsHeader}>
      <FontAwesome name={icon as any} size={16} color={color} />
      <AppText style={[styles.restrictionsLabel, { color: theme.colors.text }]}>{label}</AppText>
    </View>
    <View style={styles.restrictionsItems}>
      {items.map((item) => (
        <View key={item} style={[styles.restrictionTag, { backgroundColor: `${color}20` }]}> 
          <AppText style={[styles.restrictionText, { color }]}>{item}</AppText>
        </View>
      ))}
    </View>
  </View>
);

const Divider: React.FC<{ theme: any }> = ({ theme }) => (
  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
);

const TrackerRow: React.FC<{
  icon: string;
  iconColor: string;
  label: string;
  status: string;
  statusColor: string;
  onPress: () => void;
  loading: boolean;
  theme: any;
}> = ({ icon, iconColor, label, status, statusColor, onPress, loading, theme }) => (
  <TouchableOpacity style={styles.trackerRow} onPress={onPress} disabled={loading}>
    <View style={styles.trackerLeft}>
      <FontAwesome name={icon as any} size={18} color={iconColor} />
      <AppText style={[styles.trackerName, { color: theme.colors.text }]}>{label}</AppText>
    </View>
    {loading ? <ActivityIndicator size="small" color={theme.colors.brand} /> : <AppText style={[styles.trackerStatus, { color: statusColor }]}>{status}</AppText>}
  </TouchableOpacity>
);

const AvatarModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onPickPhoto: () => void;
  onPickMichi: (variant: MichiVariant) => void;
}> = ({ visible, onClose, onPickPhoto, onPickMichi }) => {
  const theme = useAppTheme();

  const options: Array<{ key: MichiVariant; source: any; label: string }> = [
    { key: 'avatar', source: MichiAvatar, label: 'Happy Michi' },
    { key: 'hero', source: MichiHero, label: 'Chef Michi' },
    { key: 'thinking', source: MichiThinking, label: 'Thinking Michi' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.bg }]}> 
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}> 
          <TouchableOpacity onPress={onClose}>
            <AppText style={[styles.modalCancel, { color: theme.colors.brand }]}>Cancel</AppText>
          </TouchableOpacity>
          <AppText style={[styles.modalTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Choose Avatar</AppText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <TouchableOpacity style={styles.avatarOption} onPress={onPickPhoto}>
            <Card style={styles.avatarOptionCard}>
              <FontAwesome name="camera" size={30} color={theme.colors.brand} />
              <AppText style={[styles.avatarOptionText, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>Choose Photo</AppText>
            </Card>
          </TouchableOpacity>

          <AppText style={[styles.sectionSubtitle, { color: theme.colors.subtext }]}>Or pick a Michi</AppText>

          <View style={styles.michiGrid}>
            {options.map((option) => (
              <TouchableOpacity key={option.key} style={styles.michiOption} onPress={() => onPickMichi(option.key)}>
                <Card style={styles.michiCard}>
                  <Image source={option.source} style={styles.michiPreview} />
                  <AppText style={[styles.michiLabel, { color: theme.colors.text }]}>{option.label}</AppText>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

function formatGoal(goal: Goal | null): string {
  const goals: Record<Goal, string> = {
    lose: 'Lose Weight',
    maintain: 'Maintain Weight',
    gain: 'Build Muscle',
    health: 'Eat Healthier',
  };

  return goals[goal || 'health'];
}

function formatDiet(diet: DietType | null): string {
  const diets: Record<DietType, string> = {
    none: 'No restrictions',
    cico: 'Calorie Focus',
    vegan: 'Vegan',
    keto: 'Keto',
    lowcarb: 'Low Carb',
    mediterranean: 'Mediterranean',
  };

  return diets[diet || 'none'];
}

function formatMacroPriority(macro: MacroPriority | null): string {
  const priorities: Record<MacroPriority, string> = {
    balanced: 'Balanced',
    highprotein: 'High Protein',
    lowcarb: 'Low Carb',
    lowcal: 'Low Calorie',
  };

  return priorities[macro || 'balanced'];
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  heroSection: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  heroContent: { alignItems: 'center' },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    marginTop: 6,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  michiFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  welcomeTitle: {
    fontSize: 28,
    marginBottom: 6,
  },
  motivationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  contentSection: { flex: 1 },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 245, 230, 0.93)',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 12,
  },

  preferencesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  restrictionsCard: {
    marginTop: 16,
    padding: 16,
  },

  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  preferenceValue: {
    fontSize: 16,
    textAlign: 'right',
    maxWidth: '50%',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },

  restrictionsRow: {
    gap: 12,
  },
  restrictionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  restrictionsLabel: {
    fontSize: 16,
  },
  restrictionsItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restrictionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  restrictionText: {
    fontSize: 14,
  },

  trackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  trackerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackerName: {
    fontSize: 16,
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

  infoCard: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
  },

  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  avatarOption: {
    marginBottom: 20,
  },
  avatarOptionCard: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  avatarOptionText: {
    fontSize: 16,
  },
  michiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  michiOption: {
    width: '48%',
  },
  michiCard: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  michiPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  michiLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
});
