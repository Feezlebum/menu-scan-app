import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '@/src/theme/theme';

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const theme = useAppTheme();
  const progress = Math.min(current / total, 1);

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, { duration: 300 }),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.border }]}> 
      <Animated.View style={[styles.fill, { backgroundColor: theme.colors.brand }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 3,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
