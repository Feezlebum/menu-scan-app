import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '@/src/theme/theme';

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const theme = useAppTheme();
  const progress = Math.min(current / total, 1);

  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, {
      damping: 15,
      stiffness: 100,
    }),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.border }]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: theme.colors.brand },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
