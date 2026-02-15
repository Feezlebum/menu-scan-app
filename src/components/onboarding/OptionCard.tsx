import React, { useCallback, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/theme/theme';
import { AppText } from '@/src/components/ui/AppText';
import MichiMoji from '@/src/components/MichiMoji';

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  description?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function toTitleCase(input: string) {
  return input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function OptionCard({ label, emoji, selected, onPress, description }: Props) {
  const theme = useAppTheme();
  const scale = useSharedValue(selected ? 1.02 : 1);

  useEffect(() => {
    scale.value = withTiming(selected ? 1.02 : 1, { duration: 180 });
  }, [selected, scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      activeOpacity={0.86}
      onPress={handlePress}
      style={[
        styles.container,
        {
          borderColor: selected ? theme.colors.brand : theme.colors.border,
          backgroundColor: selected ? '#FFF0EC' : '#FFFFFF',
        },
        animatedStyle,
      ]}
    >
      <View style={styles.iconWrap}>{emoji ? <MichiMoji emoji={emoji} size={28} /> : null}</View>
      <View style={styles.content}>
        <AppText style={[styles.label, { color: theme.colors.text }]}>{toTitleCase(label)}</AppText>
        {description ? (
          <AppText style={[styles.description, { color: theme.colors.subtext }]}>{description}</AppText>
        ) : null}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: { flex: 1 },
  label: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  description: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
});
