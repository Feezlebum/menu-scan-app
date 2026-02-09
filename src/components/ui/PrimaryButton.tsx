import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/src/theme/theme';

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  const theme = useAppTheme();

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.border : theme.colors.brand,
          borderRadius: theme.radius.pill,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <Text style={[styles.text, { color: disabled ? theme.colors.subtext : '#fff' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    fontSize: 17,
  },
});
