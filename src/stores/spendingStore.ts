import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CurrencyCode, SpendingEntry, SpendingTracker } from '@/src/types/spending';

interface RecordSpendingInput {
  amount: number;
  restaurant: string;
  mealName: string;
  extractionMethod: 'ocr' | 'manual' | 'estimate';
  currency?: CurrencyCode; // Home currency
  date?: string;
  originalAmount?: number;
  originalCurrency?: CurrencyCode;
  fxRate?: number;
  fxTimestamp?: string;
  currencyConfidence?: number;
  currencySignals?: string[];
}

interface SpendingState extends SpendingTracker {
  setWeeklyBudget: (budget: number | null) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setIncludeTips: (enabled: boolean) => void;
  recordSpending: (entry: RecordSpendingInput) => void;
  getCurrentWeekSpent: () => number;
}

const startOfWeekMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const useSpendingStore = create<SpendingState>()(
  persist(
    (set, get) => ({
      weeklyBudget: null,
      currency: 'USD',
      includeTips: false,
      spendingHistory: [],

      setWeeklyBudget: (budget) => set({ weeklyBudget: budget }),
      setCurrency: (currency) => set({ currency }),
      setIncludeTips: (enabled) => set({ includeTips: enabled }),

      recordSpending: ({
        amount,
        restaurant,
        mealName,
        extractionMethod,
        currency,
        date,
        originalAmount,
        originalCurrency,
        fxRate,
        fxTimestamp,
        currencyConfidence,
        currencySignals,
      }) => {
        const entry: SpendingEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date: date || new Date().toISOString(),
          amount,
          restaurant,
          mealName,
          extractionMethod,
          currency: currency || get().currency,
          originalAmount,
          originalCurrency,
          fxRate,
          fxTimestamp,
          currencyConfidence,
          currencySignals,
        };

        set((state) => ({
          spendingHistory: [entry, ...state.spendingHistory].slice(0, 2000),
        }));
      },

      getCurrentWeekSpent: () => {
        const now = new Date();
        const weekStart = startOfWeekMonday(now);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const { includeTips } = get();

        return get().spendingHistory.reduce((sum, entry) => {
          const date = new Date(entry.date);
          if (date < weekStart || date > weekEnd) return sum;
          const base = entry.amount || 0;
          const withTips = includeTips ? base * 1.2 : base;
          return sum + withTips;
        }, 0);
      },
    }),
    {
      name: 'spending-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
