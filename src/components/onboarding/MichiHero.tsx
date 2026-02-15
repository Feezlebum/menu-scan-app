import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface MichiHeroProps {
  source: ImageSourcePropType;
  size?: number;
  animate?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function MichiHero({ source, size = 200, animate = true }: MichiHeroProps) {
  const floatY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    if (animate) {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [animate, floatY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <AnimatedView style={[styles.wrap, animatedStyle]}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
