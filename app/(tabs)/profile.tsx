import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import {
  useOnboardingStore,
  Goal,
  DietType,
  MacroPriority,
  ActivityLevel,
  Gender,
} from '@/src/stores/onboardingStore';
import { useSpendingStore } from '@/src/stores/spendingStore';
import type { CurrencyCode } from '@/src/types/spending';

const HomeBackground = require('@/assets/botanicals/home-background.png');
import { getProfileMichi } from '@/src/utils/michiAssets';

const PROFILE_PHOTO_KEY = '@profile_photo';
const PROFILE_MICHI_KEY = '@profile_michi';

type MichiVariant = 'avatar' | 'hero' | 'thinking';
type EditableField =
  | 'goal'
  | 'dietType'
  | 'macroPriority'
  | 'age'
  | 'gender'
  | 'activityLevel'
  | 'currentWeightKg'
  | 'goalWeightKg';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const {
    goal,
    dietType,
    macroPriority,
    intolerances,
    dislikes,
    age,
    gender,
    activityLevel,
    currentWeightKg,
    goalWeightKg,
    weeklyDiningBudget,
    setGoal,
    setDietType,
    setMacroPriority,
    setAge,
    setGender,
    setActivityLevel,
    setCurrentWeight,
    setGoalWeight,
    setWeeklyDiningBudget,
  } = useOnboardingStore();

  const { weeklyBudget, setWeeklyBudget, currency, setCurrency, includeTips, setIncludeTips } = useSpendingStore();

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedMichi, setSelectedMichi] = useState<MichiVariant>('avatar');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  useEffect(() => {
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

  const formatDatabaseString = (str: string): string =>
    str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

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

  const heroMessage = useMemo(() => {
    const messages: Record<Goal, string> = {
      lose: 'Every scan gets you closer to your goal! 💪',
      gain: 'Building those gains, one meal at a time! 🔥',
      maintain: 'Staying consistent is the key to success! ⚖️',
      health: 'Making healthier choices every day! 🌱',
    };

    return messages[goal || 'health'];
  }, [goal]);

  const openEdit = (field: EditableField) => {
    setEditingField(field);
    setEditModalVisible(true);
  };

  const closeEdit = () => {
    setEditModalVisible(false);
    setEditingField(null);
  };

  const openBudgetEditor = () => {
    if (typeof Alert.prompt === 'function') {
      Alert.prompt(
        'Weekly Dining Budget',
        'Set your weekly budget',
        [
          { text: 'Clear', style: 'destructive', onPress: () => { setWeeklyBudget(null); setWeeklyDiningBudget(null); } },
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (value?: string) => {
              const parsed = value ? Number.parseFloat(value.replace(/[^0-9.]/g, '')) : NaN;
              if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) return;
              setWeeklyBudget(parsed);
              setWeeklyDiningBudget(parsed);
            },
          },
        ],
        'plain-text',
        weeklyBudget ? String(weeklyBudget) : ''
      );
      return;
    }

    Alert.alert('Weekly Dining Budget', 'Choose a budget', [
      { text: 'Clear', style: 'destructive', onPress: () => { setWeeklyBudget(null); setWeeklyDiningBudget(null); } },
      { text: '$50', onPress: () => { setWeeklyBudget(50); setWeeklyDiningBudget(50); } },
      { text: '$100', onPress: () => { setWeeklyBudget(100); setWeeklyDiningBudget(100); } },
      { text: '$200', onPress: () => { setWeeklyBudget(200); setWeeklyDiningBudget(200); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCurrencySelector = () => {
    const currencies: CurrencyCode[] = ['USD', 'GBP', 'EUR'];
    Alert.alert('Currency', 'Choose your currency', [
      ...currencies.map((c) => ({ text: c, onPress: () => setCurrency(c) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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
                <EditableRow icon="bullseye" label="Goal" value={formatGoal(goal)} theme={theme} onPress={() => openEdit('goal')} />
                <Divider theme={theme} />
                <EditableRow icon="cutlery" label="Diet Type" value={formatDiet(dietType)} theme={theme} onPress={() => openEdit('dietType')} />
                <Divider theme={theme} />
                <EditableRow icon="pie-chart" label="Macro Focus" value={formatMacroPriority(macroPriority)} theme={theme} onPress={() => openEdit('macroPriority')} />
                <Divider theme={theme} />
                <EditableRow icon="birthday-cake" label="Age" value={age ? `${age}` : 'Not set'} theme={theme} onPress={() => openEdit('age')} />
                <Divider theme={theme} />
                <EditableRow icon="user" label="Gender" value={formatGender(gender)} theme={theme} onPress={() => openEdit('gender')} />
                <Divider theme={theme} />
                <EditableRow icon="heartbeat" label="Activity Level" value={formatActivity(activityLevel)} theme={theme} onPress={() => openEdit('activityLevel')} />
                <Divider theme={theme} />
                <EditableRow
                  icon="balance-scale"
                  label="Current Weight"
                  value={currentWeightKg ? `${currentWeightKg} kg` : 'Not set'}
                  theme={theme}
                  onPress={() => openEdit('currentWeightKg')}
                />
                <Divider theme={theme} />
                <EditableRow
                  icon="flag-checkered"
                  label="Goal Weight"
                  value={goalWeightKg ? `${goalWeightKg} kg` : 'Not set'}
                  theme={theme}
                  onPress={() => openEdit('goalWeightKg')}
                />
              </Card>

              {(intolerances.length > 0 || dislikes.length > 0) && (
                <Card style={[styles.restrictionsCard, { backgroundColor: theme.colors.cardCream }]}>
                  {dislikes.length > 0 && (
                    <RestrictionListRow
                      icon="ban"
                      title="Foods to Avoid"
                      items={dislikes.map(formatDatabaseString)}
                      color={theme.colors.trafficAmber}
                      theme={theme}
                    />
                  )}

                  {dislikes.length > 0 && intolerances.length > 0 && <Divider theme={theme} />}

                  {intolerances.length > 0 && (
                    <RestrictionListRow
                      icon="warning"
                      title="Allergies/Intolerances"
                      items={intolerances.map(formatDatabaseString)}
                      color={theme.colors.trafficRed}
                      theme={theme}
                    />
                  )}
                </Card>
              )}
            </View>

            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Spending & Budget</AppText>
              <Card style={styles.preferencesCard}>
                <EditableRow
                  icon="dollar"
                  label="Weekly Dining Budget"
                  value={weeklyBudget ? `$${weeklyBudget.toFixed(0)}` : 'Not set'}
                  theme={theme}
                  onPress={openBudgetEditor}
                />
                <Divider theme={theme} />
                <EditableRow
                  icon="money"
                  label="Currency"
                  value={currency}
                  theme={theme}
                  onPress={openCurrencySelector}
                />
                <Divider theme={theme} />
                <TouchableOpacity
                  style={styles.preferenceRow}
                  activeOpacity={0.8}
                  onPress={() => setIncludeTips(!includeTips)}
                >
                  <View style={styles.preferenceLeft}>
                    <FontAwesome name="percent" size={18} color={theme.colors.brand} />
                    <AppText style={[styles.preferenceLabel, { color: theme.colors.text }]}>Include Tips (+20%)</AppText>
                  </View>
                  <View style={[styles.tipToggle, { backgroundColor: includeTips ? theme.colors.brand : '#ddd' }]}>
                    <View style={[styles.tipToggleKnob, includeTips && styles.tipToggleKnobOn]} />
                  </View>
                </TouchableOpacity>
              </Card>
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

      <EditPreferenceModal
        visible={editModalVisible}
        field={editingField}
        onClose={closeEdit}
        goal={goal}
        dietType={dietType}
        macroPriority={macroPriority}
        age={age}
        gender={gender}
        activityLevel={activityLevel}
        currentWeightKg={currentWeightKg}
        goalWeightKg={goalWeightKg}
        setGoal={setGoal}
        setDietType={setDietType}
        setMacroPriority={setMacroPriority}
        setAge={setAge}
        setGender={setGender}
        setActivityLevel={setActivityLevel}
        setCurrentWeight={setCurrentWeight}
        setGoalWeight={setGoalWeight}
      />
    </View>
  );
}

function getMichiSource(variant: MichiVariant) {
  return getProfileMichi(variant);
}

const EditableRow: React.FC<{ icon: string; label: string; value: string; theme: any; onPress: () => void }> = ({
  icon,
  label,
  value,
  theme,
  onPress,
}) => (
  <TouchableOpacity style={styles.preferenceRow} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.preferenceLeft}>
      <FontAwesome name={icon as any} size={18} color={theme.colors.brand} />
      <AppText style={[styles.preferenceLabel, { color: theme.colors.text }]}>{label}</AppText>
    </View>
    <View style={styles.preferenceRight}>
      <AppText style={[styles.preferenceValue, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>{value}</AppText>
      <FontAwesome name="chevron-right" size={12} color={theme.colors.subtext} />
    </View>
  </TouchableOpacity>
);

const RestrictionListRow: React.FC<{
  icon: string;
  title: string;
  items: string[];
  color: string;
  theme: any;
}> = ({ icon, title, items, color, theme }) => (
  <View style={styles.restrictionsListRow}>
    <View style={styles.restrictionsHeader}>
      <FontAwesome name={icon as any} size={16} color={color} />
      <AppText style={[styles.restrictionsLabel, { color: theme.colors.text }]}>{title}</AppText>
    </View>
    <AppText style={[styles.restrictionsBullets, { color }]}>{items.join(', ')}</AppText>
  </View>
);

const Divider: React.FC<{ theme: any }> = ({ theme }) => (
  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
);

const AvatarModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onPickPhoto: () => void;
  onPickMichi: (variant: MichiVariant) => void;
}> = ({ visible, onClose, onPickPhoto, onPickMichi }) => {
  const theme = useAppTheme();

  const options: Array<{ key: MichiVariant; source: any; label: string }> = [
    { key: 'avatar', source: getProfileMichi('avatar'), label: 'Happy Michi' },
    { key: 'hero', source: getProfileMichi('hero'), label: 'Chef Michi' },
    { key: 'thinking', source: getProfileMichi('thinking'), label: 'Thinking Michi' },
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

const EditPreferenceModal: React.FC<{
  visible: boolean;
  field: EditableField | null;
  onClose: () => void;
  goal: Goal | null;
  dietType: DietType | null;
  macroPriority: MacroPriority | null;
  age: number | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  setGoal: (value: Goal) => void;
  setDietType: (value: DietType) => void;
  setMacroPriority: (value: MacroPriority) => void;
  setAge: (value: number) => void;
  setGender: (value: Gender) => void;
  setActivityLevel: (value: ActivityLevel) => void;
  setCurrentWeight: (value: number) => void;
  setGoalWeight: (value: number) => void;
}> = ({
  visible,
  field,
  onClose,
  goal,
  dietType,
  macroPriority,
  age,
  gender,
  activityLevel,
  currentWeightKg,
  goalWeightKg,
  setGoal,
  setDietType,
  setMacroPriority,
  setAge,
  setGender,
  setActivityLevel,
  setCurrentWeight,
  setGoalWeight,
}) => {
  const theme = useAppTheme();

  const [tempNumber, setTempNumber] = useState(0);

  useEffect(() => {
    if (field === 'age') setTempNumber(age ?? 30);
    if (field === 'currentWeightKg') setTempNumber(currentWeightKg ?? 70);
    if (field === 'goalWeightKg') setTempNumber(goalWeightKg ?? 65);
  }, [field, age, currentWeightKg, goalWeightKg]);

  const title = getEditTitle(field);
  const numericField = field === 'age' || field === 'currentWeightKg' || field === 'goalWeightKg';

  const options: Array<{ key: string; label: string; active: boolean; onPress: () => void }> =
    field === 'goal'
      ? [
          { key: 'lose', label: 'Lose Weight', active: goal === 'lose', onPress: () => setGoal('lose') },
          { key: 'maintain', label: 'Maintain Weight', active: goal === 'maintain', onPress: () => setGoal('maintain') },
          { key: 'gain', label: 'Build Muscle', active: goal === 'gain', onPress: () => setGoal('gain') },
          { key: 'health', label: 'Eat Healthier', active: goal === 'health', onPress: () => setGoal('health') },
        ]
      : field === 'dietType'
      ? [
          { key: 'none', label: 'No restrictions', active: dietType === 'none', onPress: () => setDietType('none') },
          { key: 'cico', label: 'Calorie Focus', active: dietType === 'cico', onPress: () => setDietType('cico') },
          { key: 'vegan', label: 'Vegan', active: dietType === 'vegan', onPress: () => setDietType('vegan') },
          { key: 'keto', label: 'Keto', active: dietType === 'keto', onPress: () => setDietType('keto') },
          { key: 'lowcarb', label: 'Low Carb', active: dietType === 'lowcarb', onPress: () => setDietType('lowcarb') },
          { key: 'mediterranean', label: 'Mediterranean', active: dietType === 'mediterranean', onPress: () => setDietType('mediterranean') },
        ]
      : field === 'macroPriority'
      ? [
          { key: 'balanced', label: 'Balanced', active: macroPriority === 'balanced', onPress: () => setMacroPriority('balanced') },
          { key: 'highprotein', label: 'High Protein', active: macroPriority === 'highprotein', onPress: () => setMacroPriority('highprotein') },
          { key: 'lowcarb', label: 'Low Carb', active: macroPriority === 'lowcarb', onPress: () => setMacroPriority('lowcarb') },
          { key: 'lowcal', label: 'Low Calorie', active: macroPriority === 'lowcal', onPress: () => setMacroPriority('lowcal') },
        ]
      : field === 'gender'
      ? [
          { key: 'male', label: 'Male', active: gender === 'male', onPress: () => setGender('male') },
          { key: 'female', label: 'Female', active: gender === 'female', onPress: () => setGender('female') },
          { key: 'other', label: 'Other', active: gender === 'other', onPress: () => setGender('other') },
        ]
      : field === 'activityLevel'
      ? [
          { key: 'sedentary', label: 'Sedentary', active: activityLevel === 'sedentary', onPress: () => setActivityLevel('sedentary') },
          { key: 'light', label: 'Light', active: activityLevel === 'light', onPress: () => setActivityLevel('light') },
          { key: 'moderate', label: 'Moderate', active: activityLevel === 'moderate', onPress: () => setActivityLevel('moderate') },
          { key: 'active', label: 'Active', active: activityLevel === 'active', onPress: () => setActivityLevel('active') },
          { key: 'very_active', label: 'Very Active', active: activityLevel === 'very_active', onPress: () => setActivityLevel('very_active') },
        ]
      : [];

  const handleSelect = (onPress: () => void) => {
    onPress();
    onClose();
  };

  const handleSaveNumber = () => {
    if (field === 'age') {
      setAge(Math.max(12, Math.min(100, Math.round(tempNumber))));
    } else if (field === 'currentWeightKg') {
      setCurrentWeight(Math.max(30, Math.min(300, Number(tempNumber.toFixed(1)))));
    } else if (field === 'goalWeightKg') {
      setGoalWeight(Math.max(30, Math.min(300, Number(tempNumber.toFixed(1)))));
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.editBackdrop}>
        <View style={[styles.editCard, { backgroundColor: theme.colors.bg }]}> 
          <AppText style={[styles.editTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>{title}</AppText>

          {numericField ? (
            <View style={styles.numberEditor}>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={[styles.stepperButton, { borderColor: theme.colors.border }]} onPress={() => setTempNumber((v) => v - (field === 'age' ? 1 : 0.5))}>
                  <FontAwesome name="minus" size={14} color={theme.colors.text} />
                </TouchableOpacity>
                <AppText style={[styles.numberValue, { color: theme.colors.text }]}>
                  {field === 'age' ? Math.round(tempNumber) : tempNumber.toFixed(1)}
                  {field === 'age' ? '' : ' kg'}
                </AppText>
                <TouchableOpacity style={[styles.stepperButton, { borderColor: theme.colors.border }]} onPress={() => setTempNumber((v) => v + (field === 'age' ? 1 : 0.5))}>
                  <FontAwesome name="plus" size={14} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.brand }]} onPress={handleSaveNumber}>
                <AppText style={styles.saveButtonText}>Save</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.optionsList}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionRow,
                    { borderColor: theme.colors.border },
                    opt.active && { backgroundColor: `${theme.colors.brand}16`, borderColor: theme.colors.brand },
                  ]}
                  onPress={() => handleSelect(opt.onPress)}
                >
                  <AppText style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</AppText>
                  {opt.active && <FontAwesome name="check" size={14} color={theme.colors.brand} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
            <AppText style={[styles.cancelLinkText, { color: theme.colors.subtext }]}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function getEditTitle(field: EditableField | null): string {
  if (field === 'goal') return 'Edit Goal';
  if (field === 'dietType') return 'Edit Diet Type';
  if (field === 'macroPriority') return 'Edit Macro Focus';
  if (field === 'age') return 'Edit Age';
  if (field === 'gender') return 'Edit Gender';
  if (field === 'activityLevel') return 'Edit Activity Level';
  if (field === 'currentWeightKg') return 'Edit Current Weight';
  if (field === 'goalWeightKg') return 'Edit Goal Weight';
  return 'Edit Preference';
}

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

function formatGender(gender: Gender | null): string {
  if (!gender) return 'Not set';
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  return 'Other';
}

function formatActivity(level: ActivityLevel | null): string {
  if (!level) return 'Not set';
  return level
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
    gap: 14,
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
  preferenceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
    maxWidth: '52%',
  },
  preferenceLabel: {
    fontSize: 16,
  },
  tipToggle: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  tipToggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  tipToggleKnobOn: {
    alignSelf: 'flex-end',
  },
  preferenceValue: {
    fontSize: 16,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },

  restrictionsListRow: {
    gap: 8,
    paddingVertical: 2,
  },
  restrictionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restrictionsLabel: {
    fontSize: 16,
  },
  restrictionsBullets: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 26,
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

  editBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  editCard: {
    borderRadius: 18,
    padding: 18,
  },
  editTitle: {
    fontSize: 20,
    marginBottom: 14,
  },
  optionsList: {
    gap: 10,
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
  },
  numberEditor: {
    gap: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  cancelLinkText: {
    fontSize: 14,
  },
});
