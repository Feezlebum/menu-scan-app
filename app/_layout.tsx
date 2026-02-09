import { useEffect } from 'react';
import { Stack, Redirect, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

// Keep splash screen visible until ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const { completed } = useOnboardingStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const inOnboarding = segments[0] === 'onboarding';

  if (!completed && !inOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (completed && inOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
