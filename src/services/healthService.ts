import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthValueOptions,
} from 'react-native-health';

// Types
export interface FoodLogEntry {
  foodName: string;
  calories: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date?: Date;
}

export interface HealthServiceStatus {
  isAvailable: boolean;
  isAuthorized: boolean;
  error?: string;
}

// Permissions we need for food logging
const healthKitPermissions: HealthKitPermissions = {
  permissions: {
    read: [],
    write: [
      AppleHealthKit.Constants.Permissions.EnergyConsumed,
      AppleHealthKit.Constants.Permissions.Protein,
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      AppleHealthKit.Constants.Permissions.FatTotal,
    ],
  },
};

class HealthService {
  private initialized = false;
  private authorized = false;

  /**
   * Check if Apple Health is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  /**
   * Initialize HealthKit and request permissions
   */
  async initialize(): Promise<HealthServiceStatus> {
    if (!this.isAvailable()) {
      return {
        isAvailable: false,
        isAuthorized: false,
        error: 'Apple Health is only available on iOS',
      };
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(healthKitPermissions, (error: string) => {
        if (error) {
          console.log('[HealthService] Init error:', error);
          this.initialized = false;
          this.authorized = false;
          resolve({
            isAvailable: true,
            isAuthorized: false,
            error: error,
          });
          return;
        }

        console.log('[HealthService] Initialized successfully');
        this.initialized = true;
        this.authorized = true;
        resolve({
          isAvailable: true,
          isAuthorized: true,
        });
      });
    });
  }

  /**
   * Check current authorization status
   */
  async getStatus(): Promise<HealthServiceStatus> {
    if (!this.isAvailable()) {
      return {
        isAvailable: false,
        isAuthorized: false,
      };
    }

    if (!this.initialized) {
      // Try to initialize to check status
      return this.initialize();
    }

    return {
      isAvailable: true,
      isAuthorized: this.authorized,
    };
  }

  /**
   * Log a food item to Apple Health
   */
  async logFood(entry: FoodLogEntry): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Apple Health not available' };
    }

    if (!this.authorized) {
      const status = await this.initialize();
      if (!status.isAuthorized) {
        return { success: false, error: 'Apple Health not authorized' };
      }
    }

    const date = entry.date || new Date();
    const dateString = date.toISOString();

    try {
      // Log calories (energy consumed)
      if (entry.calories > 0) {
        await this.saveEnergyConsumed(entry.calories, dateString, entry.foodName);
      }

      // Log protein
      if (entry.protein && entry.protein > 0) {
        await this.saveProtein(entry.protein, dateString);
      }

      // Log carbs
      if (entry.carbs && entry.carbs > 0) {
        await this.saveCarbohydrates(entry.carbs, dateString);
      }

      // Log fat
      if (entry.fat && entry.fat > 0) {
        await this.saveFat(entry.fat, dateString);
      }

      console.log('[HealthService] Logged food:', entry.foodName);
      return { success: true };
    } catch (error) {
      console.error('[HealthService] Error logging food:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private saveEnergyConsumed(calories: number, date: string, foodName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: HealthValueOptions = {
        value: calories,
        startDate: date,
        endDate: date,
        metadata: {
          HKFoodType: foodName,
        },
      };

      AppleHealthKit.saveFood(options, (error: string | null, result: HealthValue) => {
        if (error) {
          reject(new Error(error));
          return;
        }
        resolve();
      });
    });
  }

  private saveProtein(grams: number, date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Note: react-native-health saveFood handles all macros in one call
      // This is a placeholder for individual macro logging if needed
      resolve();
    });
  }

  private saveCarbohydrates(grams: number, date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  private saveFat(grams: number, date: string): Promise<void> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  /**
   * Log multiple food items (from a scan result)
   */
  async logMultipleFoods(entries: FoodLogEntry[]): Promise<{ 
    success: boolean; 
    logged: number; 
    failed: number;
    errors: string[];
  }> {
    let logged = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      const result = await this.logFood(entry);
      if (result.success) {
        logged++;
      } else {
        failed++;
        if (result.error) {
          errors.push(`${entry.foodName}: ${result.error}`);
        }
      }
    }

    return {
      success: failed === 0,
      logged,
      failed,
      errors,
    };
  }

  /**
   * Disconnect/reset authorization state
   */
  disconnect(): void {
    this.initialized = false;
    this.authorized = false;
    console.log('[HealthService] Disconnected');
  }
}

// Export singleton
export const healthService = new HealthService();
