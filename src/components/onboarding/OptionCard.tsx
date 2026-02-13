import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
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

export function OptionCard({ label, emoji, selected, onPress, description }: Props) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  }, [onPress, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: selected ? theme.colors.brand + '15' : theme.colors.card,
    borderColor: selected ? theme.colors.brand : theme.colors.border,
  }));

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.container,
        { borderRadius: theme.radius.md },
        animatedStyle,
      ]}
    >
      {emoji && (
        <View style={styles.emojiContainer}>
          <MichiMoji emoji={emoji} size={28} />
        </View>
      )}
      <View style={styles.content}>
        <AppText
          style={[
            styles.label,
            { color: selected ? theme.colors.brand : theme.colors.text }
          ]}
        >
          {label}
        </AppText>
        {description && (
          <AppText style={[styles.description, { color: theme.colors.subtext }]}>
            {description}
          </AppText>
        )}
      </View>
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: theme.colors.brand }]}>
          <AppText style={styles.checkmarkText}>✓</AppText>
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
