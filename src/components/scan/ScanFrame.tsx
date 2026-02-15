import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.85;
const CORNER_SIZE = 48;
const CORNER_THICKNESS = 6;

interface Props {
  isScanning?: boolean;
}

export function ScanFrame({ isScanning = false }: Props) {
  const scanLinePosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isScanning) {
      // Scan line animation
      scanLinePosition.value = withRepeat(
        withTiming(FRAME_SIZE - 10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      // Pulse animation on corners
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      scanLinePosition.value = 0;
      pulseScale.value = 1;
    }
  }, [isScanning]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePosition.value }],
    opacity: isScanning ? 1 : 0,
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Corner frames */}
      <Animated.View style={[styles.cornerTopLeft, cornerStyle]}>
        <View style={[styles.cornerHorizontal, { top: 0, left: 0 }]} />
        <View style={[styles.cornerVertical, { top: 0, left: 0 }]} />
      </Animated.View>
      
      <Animated.View style={[styles.cornerTopRight, cornerStyle]}>
        <View style={[styles.cornerHorizontal, { top: 0, right: 0 }]} />
        <View style={[styles.cornerVertical, { top: 0, right: 0 }]} />
      </Animated.View>
      
      <Animated.View style={[styles.cornerBottomLeft, cornerStyle]}>
        <View style={[styles.cornerHorizontal, { bottom: 0, left: 0 }]} />
        <View style={[styles.cornerVertical, { bottom: 0, left: 0 }]} />
      </Animated.View>
      
      <Animated.View style={[styles.cornerBottomRight, cornerStyle]}>
        <View style={[styles.cornerHorizontal, { bottom: 0, right: 0 }]} />
        <View style={[styles.cornerVertical, { bottom: 0, right: 0 }]} />
      </Animated.View>

      {/* Scan line */}
      {isScanning && (
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cornerHorizontal: {
    width: CORNER_SIZE,
    height: CORNER_THICKNESS,
    backgroundColor: '#5ABAB7',
    position: 'absolute',
    shadowColor: '#5ABAB7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  cornerVertical: {
    width: CORNER_THICKNESS,
    height: CORNER_SIZE,
    backgroundColor: '#5ABAB7',
    position: 'absolute',
    shadowColor: '#5ABAB7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#5ABAB7',
    shadowColor: '#5ABAB7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
