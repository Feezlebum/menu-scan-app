import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parsePrice } from '@/src/lib/scanService';
import type { MenuItem, TopPick, ScanResult } from '@/src/lib/scanService';

export interface LoggedMeal {
  id: string;
  item: MenuItem;
  loggedAt: string; // ISO date
  scanId: string;
  restaurantName: string | null;
  userPrice?: number;
  healthyOverride?: 'healthy' | 'unhealthy' | null;
}

export interface ScanHistoryEntry {
  id: string;
  scannedAt: string; // ISO date
  restaurantName: string | null;
  restaurantType: 'chain' | 'independent';
  itemCount: number;
  topPicks: TopPick[];
  allItems: MenuItem[];
  loggedMeals: string[]; // IDs of meals logged from this scan
}

interface HistoryState {
  // Scan history
  scans: ScanHistoryEntry[];
  
  // Logged meals (items user selected/logged)
  loggedMeals: LoggedMeal[];
  
  // Actions
  saveScan: (result: ScanResult) => string; // Returns scan ID
  logMeal: (
    scanId: string,
    item: MenuItem,
    restaurantName: string | null,
    options?: { userPrice?: number; healthyOverride?: 'healthy' | 'unhealthy' | null }
  ) => string; // Returns meal ID
  getScanById: (id: string) => ScanHistoryEntry | undefined;
  getMealById: (id: string) => LoggedMeal | undefined;
  getMealsForDate: (date: Date) => LoggedMeal[];
  getMealsForScan: (scanId: string) => LoggedMeal[];
  deleteScan: (id: string) => void;
  deleteMeal: (id: string) => void;
  clearHistory: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getMealPrice = (meal: LoggedMeal): number | null => {
  if (typeof meal.userPrice === 'number') return meal.userPrice;
  return parsePrice(meal.item.price);
};

export const getDaySpending = (meals: LoggedMeal[]): number => {
  return meals.reduce((total, meal) => {
    const price = getMealPrice(meal);
    return total + (price || 0);
  }, 0);
};

export const getWeekSpending = (meals: LoggedMeal[], weekOffset: number = 0): number => {
  const today = new Date();
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  weekStart.setDate(weekStart.getDate() + mondayOffset - (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.loggedAt);
    return mealDate >= weekStart && mealDate <= weekEnd;
  });

  return getDaySpending(weekMeals);
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      scans: [],
      loggedMeals: [],

      saveScan: (result) => {
        const id = generateId();
        const entry: ScanHistoryEntry = {
          id,
          scannedAt: new Date().toISOString(),
          restaurantName: result.restaurantName,
          restaurantType: result.restaurantType,
          itemCount: result.totalItems,
          topPicks: result.topPicks,
          allItems: result.items,
          loggedMeals: [],
        };
        
        set((state) => ({
          scans: [entry, ...state.scans].slice(0, 100), // Keep last 100 scans
        }));
        
        return id;
      },

      logMeal: (scanId, item, restaurantName, options) => {
        const id = generateId();
        const meal: LoggedMeal = {
          id,
          item,
          loggedAt: new Date().toISOString(),
          scanId,
          restaurantName,
          userPrice: options?.userPrice,
          healthyOverride: options?.healthyOverride ?? null,
        };
        
        set((state) => ({
          loggedMeals: [meal, ...state.loggedMeals].slice(0, 500), // Keep last 500 meals
          scans: state.scans.map((scan) =>
            scan.id === scanId
              ? { ...scan, loggedMeals: [...scan.loggedMeals, id] }
              : scan
          ),
        }));
        
        return id;
      },

      getScanById: (id) => {
        return get().scans.find((scan) => scan.id === id);
      },

      getMealById: (id) => {
        return get().loggedMeals.find((meal) => meal.id === id);
      },

      getMealsForDate: (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return get().loggedMeals.filter(
          (meal) => meal.loggedAt.split('T')[0] === dateStr
        );
      },

      getMealsForScan: (scanId) => {
        return get().loggedMeals.filter((meal) => meal.scanId === scanId);
      },

      deleteScan: (id) => {
        set((state) => ({
          scans: state.scans.filter((scan) => scan.id !== id),
          loggedMeals: state.loggedMeals.filter((meal) => meal.scanId !== id),
        }));
      },

      deleteMeal: (id) => {
        const meal = get().loggedMeals.find((m) => m.id === id);
        set((state) => ({
          loggedMeals: state.loggedMeals.filter((m) => m.id !== id),
          scans: meal
            ? state.scans.map((scan) =>
                scan.id === meal.scanId
                  ? { ...scan, loggedMeals: scan.loggedMeals.filter((mId) => mId !== id) }
                  : scan
              )
            : state.scans,
        }));
      },

      clearHistory: () => {
        set({ scans: [], loggedMeals: [] });
      },
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
