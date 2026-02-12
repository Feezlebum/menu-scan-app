import { useEffect, useCallback, useState } from 'react';
import { View } from 'react-native';
import { Stack, Redirect, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Baloo2_400Regular,
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import 'react-native-reanimated';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { isAuthenticated } from '@/src/lib/auth';
import { supabase } from '@/src/lib/supabase';

// Keep splash screen visible until ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const { completed } = useOnboardingStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    // Baloo 2 (headings)
    'Baloo2-Regular': Baloo2_400Regular,
    'Baloo2-Medium': Baloo2_500Medium,
    'Baloo2-SemiBold': Baloo2_600SemiBold,
    'Baloo2-Bold': Baloo2_700Bold,
    'Baloo2-ExtraBold': Baloo2_800ExtraBold,
    // Nunito (body)
    'Nunito-Light': Nunito_300Light,
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Medium': Nunito_500Medium,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
      setIsAuthChecked(true);
    };

    checkAuthStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setIsAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Wait for fonts/auth check to load
  if ((!fontsLoaded && !fontError) || !isAuthChecked) {
    return null;
  }

  const inOnboarding = segments[0] === 'onboarding';

  if (!isLoggedIn && !inOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (isLoggedIn && completed && inOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
