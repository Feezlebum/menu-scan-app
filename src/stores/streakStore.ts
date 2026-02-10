import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HealthyStreak, StreakEntry } from '@/src/types/streak';

interface RecordMealDecisionInput {
  mealId: string;
  mealName: string;
  loggedAt: string;
  isHealthy: boolean;
  overrideUsed?: boolean;
}

interface StreakState extends HealthyStreak {
  recordMealDecision: (input: RecordMealDecisionInput) => void;
  resetCurrentStreak: () => void;
}

const initialState: HealthyStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDate: null,
  lastBreakDate: null,
  totalGoodChoices: 0,
  streakHistory: [],
  lastChoice: null,
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set) => ({
      ...initialState,

      recordMealDecision: ({ mealId, mealName, loggedAt, isHealthy, overrideUsed }) => {
        set((state) => {
          let nextCurrentStreak = state.currentStreak;
          let nextLongestStreak = state.longestStreak;
          let nextLastStreakDate = state.lastStreakDate;
          let nextLastBreakDate = state.lastBreakDate;
          let nextTotalGoodChoices = state.totalGoodChoices;
          let nextHistory: StreakEntry[] = [...state.streakHistory];

          if (isHealthy) {
            nextCurrentStreak = state.currentStreak + 1;
            nextLongestStreak = Math.max(state.longestStreak, nextCurrentStreak);
            nextLastStreakDate = loggedAt;
            nextTotalGoodChoices = state.totalGoodChoices + 1;
            nextHistory = [
              {
                date: loggedAt,
                action: 'increment' as const,
                streakValue: nextCurrentStreak,
                mealId,
              },
              ...nextHistory,
            ].slice(0, 500);
          } else {
            nextLastBreakDate = loggedAt;
            if (state.currentStreak > 0) {
              nextHistory = [
                {
                  date: loggedAt,
                  action: 'break' as const,
                  streakValue: state.currentStreak,
                  mealId,
                },
                ...nextHistory,
              ].slice(0, 500);
            }
            nextCurrentStreak = 0;
          }

          return {
            currentStreak: nextCurrentStreak,
            longestStreak: nextLongestStreak,
            lastStreakDate: nextLastStreakDate,
            lastBreakDate: nextLastBreakDate,
            totalGoodChoices: nextTotalGoodChoices,
            streakHistory: nextHistory,
            lastChoice: {
              mealName,
              loggedAt,
              wasHealthy: isHealthy,
              overrideUsed,
            },
          };
        });
      },

      resetCurrentStreak: () => {
        set((state) => ({
          currentStreak: 0,
          lastBreakDate: new Date().toISOString(),
          streakHistory: [
            {
              date: new Date().toISOString(),
              action: 'break' as const,
              streakValue: state.currentStreak,
            },
            ...state.streakHistory,
          ].slice(0, 500),
        }));
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
