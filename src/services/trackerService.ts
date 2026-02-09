import { Linking, Platform, Alert } from 'react-native';

// Deep link URLs for popular food tracking apps
const TRACKER_URLS = {
  myFitnessPal: {
    ios: 'myfitnesspal://',
    android: 'myfitnesspal://',
    appStore: 'https://apps.apple.com/app/myfitnesspal/id341232718',
    playStore: 'https://play.google.com/store/apps/details?id=com.myfitnesspal.android',
  },
  loseIt: {
    ios: 'loseit://',
    android: 'loseit://',
    appStore: 'https://apps.apple.com/app/lose-it-calorie-counter/id297368629',
    playStore: 'https://play.google.com/store/apps/details?id=com.fitnow.loseit',
  },
};

export type TrackerApp = 'myFitnessPal' | 'loseIt';

class TrackerService {
  /**
   * Check if a tracker app is installed
   */
  async isAppInstalled(app: TrackerApp): Promise<boolean> {
    const urls = TRACKER_URLS[app];
    const url = Platform.OS === 'ios' ? urls.ios : urls.android;
    
    try {
      return await Linking.canOpenURL(url);
    } catch {
      return false;
    }
  }

  /**
   * Open a tracker app
   */
  async openApp(app: TrackerApp): Promise<boolean> {
    const urls = TRACKER_URLS[app];
    const url = Platform.OS === 'ios' ? urls.ios : urls.android;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        // App not installed - offer to download
        this.promptInstall(app);
        return false;
      }
    } catch (error) {
      console.error(`[TrackerService] Error opening ${app}:`, error);
      return false;
    }
  }

  /**
   * Prompt user to install an app
   */
  private promptInstall(app: TrackerApp): void {
    const urls = TRACKER_URLS[app];
    const storeUrl = Platform.OS === 'ios' ? urls.appStore : urls.playStore;
    const appName = app === 'myFitnessPal' ? 'MyFitnessPal' : 'Lose It!';

    Alert.alert(
      `${appName} Not Installed`,
      `Would you like to download ${appName} from the ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => Linking.openURL(storeUrl),
        },
      ]
    );
  }

  /**
   * Open the app store page for a tracker
   */
  async openAppStore(app: TrackerApp): Promise<void> {
    const urls = TRACKER_URLS[app];
    const storeUrl = Platform.OS === 'ios' ? urls.appStore : urls.playStore;
    await Linking.openURL(storeUrl);
  }

  /**
   * Generate shareable text for manual logging
   * (When apps don't support deep linking with food data)
   */
  generateShareText(foodName: string, calories: number, macros?: { protein?: number; carbs?: number; fat?: number }): string {
    let text = `${foodName} - ${calories} cal`;
    
    if (macros) {
      const parts: string[] = [];
      if (macros.protein) parts.push(`${macros.protein}g protein`);
      if (macros.carbs) parts.push(`${macros.carbs}g carbs`);
      if (macros.fat) parts.push(`${macros.fat}g fat`);
      
      if (parts.length > 0) {
        text += ` (${parts.join(', ')})`;
      }
    }
    
    return text;
  }
}

export const trackerService = new TrackerService();
