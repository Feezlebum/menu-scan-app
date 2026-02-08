import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

export function Screen({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]}>
      <View style={[styles.inner, { padding: theme.spacing.lg }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, inner: { flex: 1 } });
