import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useScanStore } from '@/src/stores/scanStore';
import { Video, ResizeMode } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const processingVideo = Platform.select({
  ios: require('@/assets/animations/michi-processing.mp4'),
  android: require('@/assets/animations/michi-processing.webm'),
  default: require('@/assets/animations/michi-processing.mp4'),
});

interface MenuAnalysisLoadingProps {
  onComplete?: () => void;
  estimatedDurationMs?: number;
}

const ANALYSIS_PHASES = [
  {
    duration: 5000, // 0-5s
    texts: [
      "Michi is reading the menu... 🤔",
      "Checking out all the tasty options!",
      "Spotting the dish names...",
    ]
  },
  {
    duration: 5000, // 5-10s  
    texts: [
      "Calculating calories and nutrients... 📊",
      "Michi's doing the math!",
      "Checking ingredients carefully...",
    ]
  },
  {
    duration: 5000, // 10-15s
    texts: [
      "Finding your perfect matches... ✨", 
      "Tailoring recommendations just for you!",
      "Michi knows what you like!",
    ]
  },
  {
    duration: 4000, // 15-19s
    texts: [
      "Almost ready with your results! 🎉",
      "Putting the finishing touches...",
      "Your personalized menu is ready!",
    ]
  },
];

export default function MenuAnalysisLoading({ 
  onComplete, 
  estimatedDurationMs = 19000 
}: MenuAnalysisLoadingProps) {
  const theme = useAppTheme();
  const { currentResult, scanError } = useScanStore();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Animation values
  const progressWidth = useSharedValue(0);
  const michiScale = useSharedValue(1);
  const textOpacity = useSharedValue(1);

  // Check for completion (results available or error)
  useEffect(() => {
    if ((currentResult || scanError) && !hasCompleted) {
      setHasCompleted(true);
      // Small delay to let user see completion, then navigate
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  }, [currentResult, scanError, hasCompleted, onComplete]);

  // Start animations on mount
  useEffect(() => {
    // Progress bar animation - smooth fill over duration
    progressWidth.value = withTiming(
      SCREEN_WIDTH * 0.8, // 80% of screen width
      { 
        duration: estimatedDurationMs,
        easing: Easing.out(Easing.quad) 
      }
    );

    // Michi subtle breathing animation
    const breathingAnimation = () => {
      michiScale.value = withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      );
    };
    
    breathingAnimation();
    const breathingInterval = setInterval(breathingAnimation, 3000);

    // Phase and text progression
    let phaseTimeout: NodeJS.Timeout;
    let textInterval: NodeJS.Timeout;

    const startPhaseProgression = () => {
      let totalElapsed = 0;
      
      ANALYSIS_PHASES.forEach((phase, phaseIndex) => {
        phaseTimeout = setTimeout(() => {
          setCurrentPhase(phaseIndex);
          setCurrentTextIndex(0);
          
          // Cycle through texts within this phase
          let textIndex = 0;
          textInterval = setInterval(() => {
            if (textIndex < phase.texts.length - 1) {
              textIndex++;
              setCurrentTextIndex(textIndex);
              
              // Animate text change
              textOpacity.value = withSequence(
                withTiming(0.3, { duration: 200 }),
                withTiming(1, { duration: 300 })
              );
            }
          }, phase.duration / phase.texts.length);
          
        }, totalElapsed);
        
        totalElapsed += phase.duration;
      });
    };

    startPhaseProgression();

    // Complete callback
    const completeTimeout = setTimeout(() => {
      onComplete?.();
    }, estimatedDurationMs);

    return () => {
      clearTimeout(phaseTimeout);
      clearInterval(textInterval);
      clearInterval(breathingInterval);
      clearTimeout(completeTimeout);
    };
  }, [estimatedDurationMs, onComplete]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const michiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: michiScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const currentText = hasCompleted 
    ? (scanError ? "Oops! Let's try that again..." : "Analysis complete! 🎉")
    : ANALYSIS_PHASES[currentPhase]?.texts[currentTextIndex] || 
      "Michi is working hard for you...";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <SafeAreaView style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <AppText style={[styles.title, { 
            color: theme.colors.text,
            fontFamily: theme.fonts.heading.bold 
          }]}>
            MenuScan
          </AppText>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          
          {/* Animated Michi */}
          <Animated.View style={[styles.michiContainer, michiStyle]}>
            <Video
              source={processingVideo}
              style={styles.michiVideo}
              shouldPlay
              isLooping
              isMuted
              resizeMode={ResizeMode.CONTAIN}
            />
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.cardSage }]}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: theme.colors.brand },
                  progressBarStyle
                ]} 
              />
            </View>
          </View>

          {/* Status Text */}
          <Animated.View style={textStyle}>
            <AppText style={[styles.statusText, { 
              color: theme.colors.subtext,
              fontFamily: theme.fonts.body.medium 
            }]}>
              {currentText}
            </AppText>
          </Animated.View>

        </View>

        {/* Footer Spacer */}
        <View style={styles.footer} />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  michiContainer: {
    marginBottom: 60,
  },
  michiVideo: {
    width: 160,
    height: 160,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressTrack: {
    height: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  footer: {
    height: 60,
  },
});