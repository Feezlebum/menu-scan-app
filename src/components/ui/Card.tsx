import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: Props) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
