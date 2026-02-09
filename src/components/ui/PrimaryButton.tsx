import { Pressable, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/src/theme/theme';

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: string;
}

export function PrimaryButton({ label, onPress, disabled = false, icon }: Props) {
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
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}>
      <View style={styles.content}>
        {icon && (
          <FontAwesome 
            name={icon as any} 
            size={20} 
            color={disabled ? theme.colors.caption : '#fff'} 
            style={styles.icon}
          />
        )}
        <Text 
          style={[
            styles.text, 
            { 
              fontFamily: theme.fonts.heading.semiBold,
              color: disabled ? theme.colors.caption : '#fff' 
            }
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Warm coral shadow
    shadowColor: '#E86B50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
  },
});
