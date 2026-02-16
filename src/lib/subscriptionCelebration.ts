import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export async function playSubscriptionCelebration(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // haptics best-effort
  }

  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/subscribed-yay.mp3'),
      { shouldPlay: true, volume: 1.0 }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => undefined);
      }
    });
  } catch {
    // audio best-effort
  }
}
