import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  useSharedValue,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import MichiMoji from '@/src/components/MichiMoji';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

const MESSAGES = [
  'Analyzing your goals...',
  'Calculating your TDEE...',
  'Personalizing recommendations...',
  'Building your meal plan...',
  'Almost ready...',
];

export default function ProcessingScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { calculatePlan } = useOnboardingStore();
  const [messageIndex, setMessageIndex] = useState(0);
  
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Calculate the plan
    calculatePlan();

    // Animate spinner
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    // Navigate after processing
    const timeout = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/onboarding/plan-reveal');
    }, 4500);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(timeout);
    };
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.content}>
        {/* Mascot placeholder */}
        <View style={[styles.mascotContainer, { backgroundColor: theme.colors.brand + '20' }]}>
          <Animated.View style={spinnerStyle}>
            <MichiMoji name="think" size={52} />
          </Animated.View>
        </View>

        {/* Message */}
        <AppText style={[styles.message, { color: theme.colors.text }]}>
          {MESSAGES[messageIndex]}
        </AppText>

        {/* Progress dots */}
        <View style={styles.dots}>
          {MESSAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= messageIndex 
                    ? theme.colors.brand 
                    : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mascotContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  mascotEmoji: {
    fontSize: 72,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
