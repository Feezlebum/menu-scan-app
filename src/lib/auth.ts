import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import type {
  ActivityLevel,
  DietType,
  DiningChallenge,
  Gender,
  Goal,
  HealthGoalV2,
  MacroPriority,
  SpendingGoal,
  EatingFrequency,
} from '@/src/stores/onboardingStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useHistoryStore } from '@/src/stores/historyStore';
import { useSpendingStore } from '@/src/stores/spendingStore';
import { useHealthStore } from '@/src/stores/healthStore';
import { useStreakStore } from '@/src/stores/streakStore';
import type { MichiVariant } from '@/src/utils/michiAssets';

const ONBOARDING_STORAGE_KEY = 'onboarding-storage';
const USER_SCOPED_STORAGE_KEYS = [
  'history-storage',
  'spending-storage',
  'health-storage',
  'streak-storage',
] as const;

const userStoreSnapshotKey = (userId: string, storeName: 'history' | 'spending' | 'health' | 'streak') =>
  `user-snapshot:${storeName}:${userId}`;

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface UserProfile {
  firstName: string;
  email: string;
  goal?: Goal | null;
  dietType?: DietType | null;
  macroPriority?: MacroPriority | null;
  activityLevel?: ActivityLevel | null;
  age?: number | null;
  gender?: Gender | null;
  heightCm?: number | null;
  currentWeightKg?: number | null;
  goalWeightKg?: number | null;
  weeklyDiningBudget?: number | null;
  intolerances?: string[];
  dislikes?: string[];
  favoriteCuisines?: string[];
  eatingFrequency?: EatingFrequency | null;
  diningChallenge?: DiningChallenge | null;
  dailyCalorieTarget?: number | null;
  goalDate?: string | null;
  profileMichi?: string | null;
  healthGoalV2?: HealthGoalV2 | null;
  spendingGoals?: SpendingGoal[];
}

interface UserProfileRow {
  id: string;
  first_name: string;
  email: string;
  goal: Goal | null;
  diet_type: DietType | null;
  macro_priority: MacroPriority | null;
  activity_level: ActivityLevel | null;
  age: number | null;
  gender: Gender | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  weekly_dining_budget: number | null;
  intolerances: string[] | null;
  dislikes: string[] | null;
  favorite_cuisines: string[] | null;
  eating_frequency: EatingFrequency | null;
  dining_challenge: DiningChallenge | null;
  daily_calorie_target: number | null;
  goal_date: string | null;
  profile_michi: string | null;
  health_goal_v2: HealthGoalV2 | null;
  spending_goals: SpendingGoal[] | null;
}

function normalizeAuthError(message?: string): string {
  if (!message) return 'Something went wrong. Please try again.';

  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Invalid email or password.';
  if (lower.includes('email not confirmed')) return 'Please confirm your email before logging in.';
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('password')) return 'Password is too weak. Please use at least 6 characters.';
  if (lower.includes('invalid email')) return 'Please enter a valid email address.';

  return message;
}

function mapProfileToRow(userId: string, userData: Partial<UserProfile>, fallbackEmail?: string, fallbackFirstName?: string) {
  return {
    id: userId,
    first_name: userData.firstName ?? fallbackFirstName ?? 'User',
    email: userData.email ?? fallbackEmail ?? '',
    goal: userData.goal,
    diet_type: userData.dietType,
    macro_priority: userData.macroPriority,
    activity_level: userData.activityLevel,
    age: userData.age,
    gender: userData.gender,
    height_cm: userData.heightCm,
    current_weight_kg: userData.currentWeightKg,
    goal_weight_kg: userData.goalWeightKg,
    weekly_dining_budget: userData.weeklyDiningBudget,
    intolerances: userData.intolerances,
    dislikes: userData.dislikes,
    favorite_cuisines: userData.favoriteCuisines,
    eating_frequency: userData.eatingFrequency,
    dining_challenge: userData.diningChallenge,
    daily_calorie_target: userData.dailyCalorieTarget,
    goal_date: userData.goalDate,
    profile_michi: userData.profileMichi,
    health_goal_v2: userData.healthGoalV2,
    spending_goals: userData.spendingGoals,
    updated_at: new Date().toISOString(),
  };
}

function hydrateOnboardingStoreFromProfile(user: User, profile: UserProfileRow | null) {
  const reset = useOnboardingStore.getState().reset;
  reset();

  useOnboardingStore.setState({
    completed: true,
    firstName: profile?.first_name ?? (user.user_metadata?.first_name as string | undefined) ?? '',
    email: user.email ?? profile?.email ?? '',
    password: '',
    goal: profile?.goal ?? null,
    dietType: profile?.diet_type ?? null,
    macroPriority: profile?.macro_priority ?? null,
    activityLevel: profile?.activity_level ?? null,
    age: profile?.age ?? null,
    gender: profile?.gender ?? null,
    heightCm: profile?.height_cm ?? null,
    currentWeightKg: profile?.current_weight_kg ?? null,
    goalWeightKg: profile?.goal_weight_kg ?? null,
    weeklyDiningBudget: profile?.weekly_dining_budget ?? null,
    intolerances: profile?.intolerances ?? [],
    dislikes: profile?.dislikes ?? [],
    favoriteCuisines: profile?.favorite_cuisines ?? [],
    eatingFrequency: profile?.eating_frequency ?? null,
    diningChallenge: profile?.dining_challenge ?? null,
    dailyCalorieTarget: profile?.daily_calorie_target ?? null,
    goalDate: profile?.goal_date ?? null,
    profileMichi: (profile?.profile_michi as MichiVariant | null) ?? 'avatar',
    healthGoalV2: profile?.health_goal_v2 ?? null,
    spendingGoals: profile?.spending_goals ?? [],
  });
}

function resetUserScopedStoresInMemory() {
  useHistoryStore.setState({ scans: [], loggedMeals: [] });
  useSpendingStore.setState({
    weeklyBudget: null,
    currency: 'USD',
    includeTips: false,
    spendingHistory: [],
  });
  useHealthStore.setState({
    appleHealthConnected: false,
    appleHealthError: null,
    myFitnessPalEnabled: false,
    loseItEnabled: false,
    isConnecting: false,
  });
  useStreakStore.setState({
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    lastBreakDate: null,
    totalGoodChoices: 0,
    streakHistory: [],
    lastChoice: null,
  });
}

async function saveUserScopedSnapshots(userId: string) {
  const history = useHistoryStore.getState();
  const spending = useSpendingStore.getState();
  const health = useHealthStore.getState();
  const streak = useStreakStore.getState();

  await AsyncStorage.multiSet([
    [
      userStoreSnapshotKey(userId, 'history'),
      JSON.stringify({ scans: history.scans, loggedMeals: history.loggedMeals }),
    ],
    [
      userStoreSnapshotKey(userId, 'spending'),
      JSON.stringify({
        weeklyBudget: spending.weeklyBudget,
        currency: spending.currency,
        includeTips: spending.includeTips,
        spendingHistory: spending.spendingHistory,
      }),
    ],
    [
      userStoreSnapshotKey(userId, 'health'),
      JSON.stringify({
        appleHealthConnected: health.appleHealthConnected,
        appleHealthError: health.appleHealthError,
        myFitnessPalEnabled: health.myFitnessPalEnabled,
        loseItEnabled: health.loseItEnabled,
        isConnecting: false,
      }),
    ],
    [
      userStoreSnapshotKey(userId, 'streak'),
      JSON.stringify({
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastStreakDate: streak.lastStreakDate,
        lastBreakDate: streak.lastBreakDate,
        totalGoodChoices: streak.totalGoodChoices,
        streakHistory: streak.streakHistory,
        lastChoice: streak.lastChoice,
      }),
    ],
  ]);
}

async function loadUserScopedSnapshots(userId: string) {
  const values = await AsyncStorage.multiGet([
    userStoreSnapshotKey(userId, 'history'),
    userStoreSnapshotKey(userId, 'spending'),
    userStoreSnapshotKey(userId, 'health'),
    userStoreSnapshotKey(userId, 'streak'),
  ]);

  const parsed = Object.fromEntries(
    values.map(([key, value]) => {
      if (!value) return [key, null];
      try {
        return [key, JSON.parse(value)];
      } catch {
        return [key, null];
      }
    })
  );

  useHistoryStore.setState(parsed[userStoreSnapshotKey(userId, 'history')] ?? { scans: [], loggedMeals: [] });
  useSpendingStore.setState(
    parsed[userStoreSnapshotKey(userId, 'spending')] ?? {
      weeklyBudget: null,
      currency: 'USD',
      includeTips: false,
      spendingHistory: [],
    }
  );
  useHealthStore.setState(
    parsed[userStoreSnapshotKey(userId, 'health')] ?? {
      appleHealthConnected: false,
      appleHealthError: null,
      myFitnessPalEnabled: false,
      loseItEnabled: false,
      isConnecting: false,
    }
  );
  useStreakStore.setState(
    parsed[userStoreSnapshotKey(userId, 'streak')] ?? {
      currentStreak: 0,
      longestStreak: 0,
      lastStreakDate: null,
      lastBreakDate: null,
      totalGoodChoices: 0,
      streakHistory: [],
      lastChoice: null,
    }
  );
}

async function clearUserScopedLocalData() {
  resetUserScopedStoresInMemory();
  await AsyncStorage.multiRemove([...USER_SCOPED_STORAGE_KEYS]);
}

async function clearUserSnapshots(userId: string) {
  await AsyncStorage.multiRemove([
    userStoreSnapshotKey(userId, 'history'),
    userStoreSnapshotKey(userId, 'spending'),
    userStoreSnapshotKey(userId, 'health'),
    userStoreSnapshotKey(userId, 'streak'),
  ]);
}

async function clearLocalOnboardingData() {
  useOnboardingStore.getState().reset();
  await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

export async function syncUserProfile(userData: Partial<UserProfile>): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const payload = mapProfileToRow(
    user.id,
    userData,
    user.email,
    (user.user_metadata?.first_name as string | undefined) ?? undefined
  );

  const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Profile sync failed:', error.message);
  }
}

export async function signUp(email: string, password: string, firstName: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName },
    },
  });

  if (error) {
    return { success: false, error: normalizeAuthError(error.message) };
  }

  const user = data.user;
  if (!user) {
    return { success: false, error: 'Unable to create account. Please try again.' };
  }

  const onboarding = useOnboardingStore.getState();

  await clearUserScopedLocalData();
  await loadUserScopedSnapshots(user.id);

  await syncUserProfile({
    firstName,
    email,
    goal: onboarding.goal,
    dietType: onboarding.dietType,
    macroPriority: onboarding.macroPriority,
    activityLevel: onboarding.activityLevel,
    age: onboarding.age,
    gender: onboarding.gender,
    heightCm: onboarding.heightCm,
    currentWeightKg: onboarding.currentWeightKg,
    goalWeightKg: onboarding.goalWeightKg,
    weeklyDiningBudget: onboarding.weeklyDiningBudget,
    intolerances: onboarding.intolerances,
    dislikes: onboarding.dislikes,
    favoriteCuisines: onboarding.favoriteCuisines,
    eatingFrequency: onboarding.eatingFrequency,
    diningChallenge: onboarding.diningChallenge,
    dailyCalorieTarget: onboarding.dailyCalorieTarget,
    goalDate: onboarding.goalDate,
    profileMichi: onboarding.profileMichi,
    healthGoalV2: onboarding.healthGoalV2,
    spendingGoals: onboarding.spendingGoals,
  });

  return { success: true, user };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: normalizeAuthError(error.message) };
  }

  if (!data.user) {
    return { success: false, error: 'Unable to load user session.' };
  }

  await clearUserScopedLocalData();
  await loadUserScopedSnapshots(data.user.id);
  await syncUserProfile({});

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle<UserProfileRow>();

  hydrateOnboardingStoreFromProfile(data.user, profile ?? null);

  return { success: true, user: data.user };
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
  if (error) {
    return { success: false, error: normalizeAuthError(error.message) };
  }

  return { success: true };
}

export async function signOut(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await saveUserScopedSnapshots(user.id);
  }

  await supabase.auth.signOut();
  await clearUserScopedLocalData();
  await clearLocalOnboardingData();
}

export async function deleteAccount(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    await clearUserScopedLocalData();
    await clearLocalOnboardingData();
    return;
  }

  const { error: profileDeleteError } = await supabase.from('user_profiles').delete().eq('id', user.id);
  if (profileDeleteError) {
    throw new Error(normalizeAuthError(profileDeleteError.message));
  }

  // Requires backend support (RPC/Edge Function with service role) to remove auth.users row.
  const { error: authDeleteError } = await supabase.rpc('delete_user');
  if (authDeleteError) {
    throw new Error('Account data removed, but auth user deletion is not configured yet (missing delete_user RPC).');
  }

  await clearUserSnapshots(user.id);
  await supabase.auth.signOut();
  await clearUserScopedLocalData();
  await clearLocalOnboardingData();
}
