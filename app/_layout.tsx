import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

// Keep splash screen visible until ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { completed } = useOnboardingStore();

  useEffect(() => {
    // Hide splash screen after a brief delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const inOnboarding = segments[0] === 'onboarding';

    if (!completed && !inOnboarding) {
      // Redirect to onboarding if not completed
      router.replace('/onboarding');
    } else if (completed && inOnboarding) {
      // Redirect to main app if onboarding is completed
      router.replace('/(tabs)');
    }
  }, [completed, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
