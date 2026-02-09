import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthService, HealthServiceStatus } from '@/src/services/healthService';

interface HealthState {
  // Apple Health
  appleHealthConnected: boolean;
  appleHealthError: string | null;
  
  // Third-party apps (track if user has "connected" via deep link)
  myFitnessPalEnabled: boolean;
  loseItEnabled: boolean;
  
  // Loading state
  isConnecting: boolean;
  
  // Actions
  connectAppleHealth: () => Promise<boolean>;
  disconnectAppleHealth: () => void;
  toggleMyFitnessPal: () => void;
  toggleLoseIt: () => void;
  checkAppleHealthStatus: () => Promise<void>;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      appleHealthConnected: false,
      appleHealthError: null,
      myFitnessPalEnabled: false,
      loseItEnabled: false,
      isConnecting: false,

      connectAppleHealth: async () => {
        set({ isConnecting: true, appleHealthError: null });
        
        try {
          const status = await healthService.initialize();
          
          if (status.isAuthorized) {
            set({ 
              appleHealthConnected: true, 
              isConnecting: false,
              appleHealthError: null,
            });
            return true;
          } else {
            set({ 
              appleHealthConnected: false, 
              isConnecting: false,
              appleHealthError: status.error || 'Authorization denied',
            });
            return false;
          }
        } catch (error) {
          set({ 
            appleHealthConnected: false, 
            isConnecting: false,
            appleHealthError: error instanceof Error ? error.message : 'Unknown error',
          });
          return false;
        }
      },

      disconnectAppleHealth: () => {
        healthService.disconnect();
        set({ 
          appleHealthConnected: false, 
          appleHealthError: null,
        });
      },

      toggleMyFitnessPal: () => {
        set((state) => ({ myFitnessPalEnabled: !state.myFitnessPalEnabled }));
      },

      toggleLoseIt: () => {
        set((state) => ({ loseItEnabled: !state.loseItEnabled }));
      },

      checkAppleHealthStatus: async () => {
        if (!healthService.isAvailable()) {
          set({ appleHealthConnected: false });
          return;
        }
        
        const status = await healthService.getStatus();
        set({ appleHealthConnected: status.isAuthorized });
      },
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        appleHealthConnected: state.appleHealthConnected,
        myFitnessPalEnabled: state.myFitnessPalEnabled,
        loseItEnabled: state.loseItEnabled,
      }),
    }
  )
);
