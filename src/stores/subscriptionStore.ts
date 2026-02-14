import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkSubscriptionStatus, purchasePackage, restorePurchases, startTrialPurchase } from '@/src/lib/purchases';

interface ScanUsage {
  count: number;
  resetDate: string;
  lastScanDate: string;
}

type SubscriptionType = 'none' | 'monthly' | 'annual' | 'trial';

interface ScanLimitStatus {
  allowed: boolean;
  remaining: number;
  resetDate: string;
}

interface SubscriptionState {
  isProUser: boolean;
  subscriptionType: SubscriptionType;
  trialEndDate: string | null;
  isTrialActive: boolean;

  scanUsage: ScanUsage;
  hasShownSoftPaywall: boolean;
  paywallInteractions: number;

  initializeUser: () => Promise<void>;
  incrementScanCount: () => boolean;
  checkScanLimit: () => ScanLimitStatus;
  startTrial: () => Promise<boolean>;
  subscribe: (type: 'monthly' | 'annual') => Promise<boolean>;
  restore: () => Promise<boolean>;
  resetScanUsage: () => void;
  markPaywallShown: () => void;
}

function getWeeklyResetDate(): string {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return nextWeek.toISOString();
}

function isTrialActive(trialEndDate: string | null): boolean {
  if (!trialEndDate) return false;
  return new Date() < new Date(trialEndDate);
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isProUser: false,
      subscriptionType: 'none',
      trialEndDate: null,
      isTrialActive: false,
      scanUsage: {
        count: 0,
        resetDate: getWeeklyResetDate(),
        lastScanDate: '',
      },
      hasShownSoftPaywall: false,
      paywallInteractions: 0,

      initializeUser: async () => {
        const state = get();

        const remoteStatus = await checkSubscriptionStatus();
        const trialActiveLocal = isTrialActive(state.trialEndDate);
        const now = new Date();
        const resetDate = new Date(state.scanUsage.resetDate);

        set({
          isProUser: remoteStatus.isProUser,
          subscriptionType:
            remoteStatus.subscriptionType !== 'none'
              ? remoteStatus.subscriptionType
              : trialActiveLocal
              ? 'trial'
              : 'none',
          isTrialActive: remoteStatus.isTrialActive || trialActiveLocal,
          trialEndDate: remoteStatus.trialEndDate ?? state.trialEndDate,
        });

        if (now >= resetDate) {
          set({
            scanUsage: {
              count: 0,
              resetDate: getWeeklyResetDate(),
              lastScanDate: state.scanUsage.lastScanDate,
            },
          });
        }
      },

      incrementScanCount: () => {
        const state = get();

        if (state.isProUser || state.isTrialActive) {
          return true;
        }

        const now = new Date();
        const resetDate = new Date(state.scanUsage.resetDate);

        if (now >= resetDate) {
          set({
            scanUsage: {
              count: 1,
              resetDate: getWeeklyResetDate(),
              lastScanDate: now.toISOString(),
            },
          });
          return true;
        }

        if (state.scanUsage.count < 2) {
          set({
            scanUsage: {
              ...state.scanUsage,
              count: state.scanUsage.count + 1,
              lastScanDate: now.toISOString(),
            },
          });
          return true;
        }

        return false;
      },

      checkScanLimit: () => {
        const state = get();

        if (state.isProUser || state.isTrialActive) {
          return { allowed: true, remaining: -1, resetDate: '' };
        }

        const remaining = Math.max(0, 2 - state.scanUsage.count);
        return {
          allowed: remaining > 0,
          remaining,
          resetDate: state.scanUsage.resetDate,
        };
      },

      startTrial: async () => {
        const result = await startTrialPurchase();

        if (result.success && result.status) {
          set({
            isProUser: result.status.isProUser,
            subscriptionType: result.status.subscriptionType,
            isTrialActive: result.status.isTrialActive,
            trialEndDate: result.status.trialEndDate,
          });
          return true;
        }

        // Fallback local trial if purchase flow is unavailable in local/dev env.
        if (!result.success && (result as any).error?.includes('not configured')) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 7);
          set({
            isTrialActive: true,
            trialEndDate: trialEnd.toISOString(),
            subscriptionType: 'trial',
          });
          return true;
        }

        return false;
      },

      subscribe: async (type) => {
        const result = await purchasePackage(type);

        if (result.success && result.status) {
          set({
            isProUser: result.status.isProUser,
            subscriptionType: result.status.subscriptionType,
            isTrialActive: result.status.isTrialActive,
            trialEndDate: result.status.trialEndDate,
          });
          return true;
        }

        return false;
      },

      restore: async () => {
        const result = await restorePurchases();

        if (result.success && result.status) {
          set({
            isProUser: result.status.isProUser,
            subscriptionType: result.status.subscriptionType,
            isTrialActive: result.status.isTrialActive,
            trialEndDate: result.status.trialEndDate,
          });
          return true;
        }

        return false;
      },

      resetScanUsage: () => {
        set({
          scanUsage: {
            count: 0,
            resetDate: getWeeklyResetDate(),
            lastScanDate: '',
          },
        });
      },

      markPaywallShown: () => {
        set((state) => ({
          hasShownSoftPaywall: true,
          paywallInteractions: state.paywallInteractions + 1,
        }));
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
