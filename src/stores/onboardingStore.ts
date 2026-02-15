import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MichiVariant } from '@/src/utils/michiAssets';

// Types
export type Goal = 'lose' | 'maintain' | 'gain' | 'health';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type DietType = 'cico' | 'keto' | 'vegan' | 'lowcarb' | 'mediterranean' | 'none';
export type MacroPriority = 'lowcal' | 'highprotein' | 'lowcarb' | 'balanced';
export type EatingFrequency = '1-2x' | '3-4x' | '5+';
export type DiningChallenge = 'calories' | 'social' | 'willpower' | 'overwhelm';
export type HealthGoalV2 =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain_weight'
  | 'eat_healthier'
  | 'athletic_performance'
  | 'manage_health_conditions';
export type SpendingGoal = 'stay_within_budget' | 'track_spending' | 'better_value' | 'cut_costs';

export interface OnboardingData {
  currentStep: number;
  completed: boolean;
  goal: Goal | null;
  age: number | null;
  gender: Gender | null;
  unitSystem: 'metric' | 'imperial';
  heightCm: number | null;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  activityLevel: ActivityLevel | null;
  dietType: DietType | null;
  macroPriority: MacroPriority | null;
  weeklyDiningBudget: number | null;
  intolerances: string[];
  customIntolerances: string[];
  dislikes: string[];
  favoriteCuisines: string[];
  eatingFrequency: EatingFrequency | null;
  diningChallenge: DiningChallenge | null;
  dailyCalorieTarget: number | null;
  goalDate: string | null;
  profileMichi: MichiVariant;
  healthGoalV2: HealthGoalV2 | null;
  spendingGoals: SpendingGoal[];
  firstName: string;
  email: string;
  password: string;
}

interface OnboardingStore extends OnboardingData {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setGoal: (goal: Goal) => void;
  setAge: (age: number) => void;
  setGender: (gender: Gender) => void;
  setUnitSystem: (value: 'metric' | 'imperial') => void;
  setHeight: (cm: number) => void;
  setCurrentWeight: (kg: number) => void;
  setGoalWeight: (kg: number) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  setDietType: (diet: DietType) => void;
  setMacroPriority: (priority: MacroPriority) => void;
  setWeeklyDiningBudget: (budget: number | null) => void;
  toggleIntolerance: (item: string) => void;
  addCustomIntolerance: (item: string) => void;
  removeCustomIntolerance: (item: string) => void;
  toggleDislike: (item: string) => void;
  toggleCuisine: (cuisine: string) => void;
  setEatingFrequency: (freq: EatingFrequency) => void;
  setDiningChallenge: (challenge: DiningChallenge) => void;
  setProfileMichi: (variant: MichiVariant) => void;
  setHealthGoalV2: (goal: HealthGoalV2) => void;
  toggleSpendingGoal: (goal: SpendingGoal) => void;
  setFirstName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  calculatePlan: () => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const initialState: OnboardingData = {
  currentStep: 0,
  completed: false,
  goal: null,
  age: null,
  gender: null,
  unitSystem: 'metric',
  heightCm: null,
  currentWeightKg: null,
  goalWeightKg: null,
  activityLevel: null,
  dietType: null,
  macroPriority: null,
  weeklyDiningBudget: null,
  intolerances: [],
  customIntolerances: [],
  dislikes: [],
  favoriteCuisines: [],
  eatingFrequency: null,
  diningChallenge: null,
  dailyCalorieTarget: null,
  goalDate: null,
  profileMichi: 'avatar',
  healthGoalV2: null,
  spendingGoals: [],
  firstName: '',
  email: '',
  password: '',
};

// Mifflin-St Jeor TDEE Calculator
function calculateTDEE(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel
): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

function calculateGoalDate(
  currentWeight: number,
  goalWeight: number,
  goal: Goal,
  deficit: number
): string {
  if (goal === 'maintain' || goal === 'health') {
    return 'Ongoing';
  }

  const weightDiff = Math.abs(currentWeight - goalWeight);
  const weeksToGoal = weightDiff / ((deficit / 500) * 0.5);
  const daysToGoal = Math.round(weeksToGoal * 7);
  
  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + daysToGoal);
  
  return goalDate.toISOString().split('T')[0];
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

      setGoal: (goal) => set({ goal }),
      setAge: (age) => set({ age }),
      setGender: (gender) => set({ gender }),
      setUnitSystem: (value) => set({ unitSystem: value }),
      setHeight: (cm) => set({ heightCm: cm }),
      setCurrentWeight: (kg) => set({ currentWeightKg: kg }),
      setGoalWeight: (kg) => set({ goalWeightKg: kg }),
      setActivityLevel: (level) => set({ activityLevel: level }),
      setDietType: (diet) => set({ dietType: diet }),
      setMacroPriority: (priority) => set({ macroPriority: priority }),
      setWeeklyDiningBudget: (budget) => set({ weeklyDiningBudget: budget }),
      
      toggleIntolerance: (item) => set((s) => ({
        intolerances: s.intolerances.includes(item)
          ? s.intolerances.filter((i) => i !== item)
          : [...s.intolerances, item],
      })),
      addCustomIntolerance: (item) =>
        set((s) => ({
          customIntolerances: s.customIntolerances.includes(item)
            ? s.customIntolerances
            : [...s.customIntolerances, item],
        })),
      removeCustomIntolerance: (item) =>
        set((s) => ({
          customIntolerances: s.customIntolerances.filter((i) => i !== item),
        })),
      
      toggleDislike: (item) => set((s) => ({
        dislikes: s.dislikes.includes(item)
          ? s.dislikes.filter((i) => i !== item)
          : [...s.dislikes, item],
      })),
      
      toggleCuisine: (cuisine) => set((s) => ({
        favoriteCuisines: s.favoriteCuisines.includes(cuisine)
          ? s.favoriteCuisines.filter((c) => c !== cuisine)
          : [...s.favoriteCuisines, cuisine],
      })),
      
      setEatingFrequency: (freq) => set({ eatingFrequency: freq }),
      setDiningChallenge: (challenge) => set({ diningChallenge: challenge }),
      setProfileMichi: (variant) => set({ profileMichi: variant }),
      setHealthGoalV2: (goal) => set({ healthGoalV2: goal }),
      toggleSpendingGoal: (goal) =>
        set((s) => ({
          spendingGoals: s.spendingGoals.includes(goal)
            ? s.spendingGoals.filter((g) => g !== goal)
            : [...s.spendingGoals, goal],
        })),
      setFirstName: (value) => set({ firstName: value }),
      setEmail: (value) => set({ email: value }),
      setPassword: (value) => set({ password: value }),

      calculatePlan: () => {
        const state = get();
        if (
          !state.gender ||
          !state.currentWeightKg ||
          !state.heightCm ||
          !state.age ||
          !state.activityLevel ||
          !state.goal
        ) {
          return;
        }

        const tdee = calculateTDEE(
          state.gender,
          state.currentWeightKg,
          state.heightCm,
          state.age,
          state.activityLevel
        );

        let deficit = 0;
        if (state.goal === 'lose') deficit = 500;
        if (state.goal === 'gain') deficit = -300;

        const dailyCalorieTarget = tdee - deficit;
        const goalDate = state.goalWeightKg
          ? calculateGoalDate(
              state.currentWeightKg,
              state.goalWeightKg,
              state.goal,
              deficit
            )
          : 'Ongoing';

        set({ dailyCalorieTarget, goalDate });
      },

      completeOnboarding: () => set({ completed: true }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Total steps for progress calculation
export const TOTAL_ONBOARDING_STEPS = 14;
