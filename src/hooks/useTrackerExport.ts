import { Alert, Platform } from 'react-native';
import { useHealthStore } from '@/src/stores/healthStore';
import { healthService, FoodLogEntry } from '@/src/services/healthService';
import { trackerService } from '@/src/services/trackerService';

interface ExportOptions {
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

/**
 * Hook to export scanned food items to enabled trackers
 */
export function useTrackerExport() {
  const { 
    appleHealthConnected, 
    myFitnessPalEnabled, 
    loseItEnabled 
  } = useHealthStore();

  /**
   * Log a food item to all enabled trackers
   */
  const exportToTrackers = async (options: ExportOptions): Promise<void> => {
    const { foodName, calories, protein, carbs, fat } = options;
    const enabledTrackers: string[] = [];

    // 1. Log to Apple Health (automatic if connected)
    if (Platform.OS === 'ios' && appleHealthConnected) {
      const entry: FoodLogEntry = {
        foodName,
        calories,
        protein,
        carbs,
        fat,
        date: new Date(),
      };
      
      const result = await healthService.logFood(entry);
      if (result.success) {
        enabledTrackers.push('Apple Health');
      } else {
        console.warn('[useTrackerExport] Apple Health logging failed:', result.error);
      }
    }

    // 2. Prompt to open MyFitnessPal (if enabled)
    if (myFitnessPalEnabled) {
      enabledTrackers.push('MyFitnessPal');
    }

    // 3. Prompt to open Lose It! (if enabled)
    if (loseItEnabled) {
      enabledTrackers.push('Lose It!');
    }

    // Show confirmation with options to open other apps
    const thirdPartyApps = [];
    if (myFitnessPalEnabled) thirdPartyApps.push({ name: 'MyFitnessPal', key: 'myFitnessPal' as const });
    if (loseItEnabled) thirdPartyApps.push({ name: 'Lose It!', key: 'loseIt' as const });

    if (thirdPartyApps.length > 0) {
      const message = appleHealthConnected 
        ? `Logged to Apple Health. Open another app to log there too?`
        : `Open a tracker app to log this meal?`;

      Alert.alert(
        'Log to Tracker',
        message,
        [
          { text: 'Skip', style: 'cancel' },
          ...thirdPartyApps.map(app => ({
            text: app.name,
            onPress: () => trackerService.openApp(app.key),
          })),
        ]
      );
    } else if (appleHealthConnected) {
      // Just Apple Health, show subtle confirmation
      // (Could be a toast instead of alert in production)
    }
  };

  /**
   * Log multiple food items (e.g., from scan results)
   */
  const exportMultipleToTrackers = async (items: ExportOptions[]): Promise<void> => {
    if (Platform.OS === 'ios' && appleHealthConnected) {
      const entries: FoodLogEntry[] = items.map(item => ({
        foodName: item.foodName,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        date: new Date(),
      }));

      const result = await healthService.logMultipleFoods(entries);
      
      if (result.success) {
        console.log(`[useTrackerExport] Logged ${result.logged} items to Apple Health`);
      } else {
        console.warn(`[useTrackerExport] Failed to log ${result.failed} items:`, result.errors);
      }
    }

    // For third-party apps, just prompt once to open
    const thirdPartyApps = [];
    if (myFitnessPalEnabled) thirdPartyApps.push({ name: 'MyFitnessPal', key: 'myFitnessPal' as const });
    if (loseItEnabled) thirdPartyApps.push({ name: 'Lose It!', key: 'loseIt' as const });

    if (thirdPartyApps.length > 0) {
      const count = items.length;
      const message = appleHealthConnected 
        ? `Logged ${count} item${count > 1 ? 's' : ''} to Apple Health. Open another app?`
        : `Open a tracker to log ${count} item${count > 1 ? 's' : ''}?`;

      Alert.alert(
        'Log to Tracker',
        message,
        [
          { text: 'Skip', style: 'cancel' },
          ...thirdPartyApps.map(app => ({
            text: app.name,
            onPress: () => trackerService.openApp(app.key),
          })),
        ]
      );
    }
  };

  return {
    exportToTrackers,
    exportMultipleToTrackers,
    hasEnabledTrackers: appleHealthConnected || myFitnessPalEnabled || loseItEnabled,
  };
}
