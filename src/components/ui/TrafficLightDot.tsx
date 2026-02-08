import { View } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

type Tone = 'green' | 'amber' | 'red';

export function TrafficLightDot({ tone }: { tone: Tone }) {
  const theme = useAppTheme();
  const map = { green: theme.colors.success, amber: theme.colors.warning, red: theme.colors.danger };
  return <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: map[tone] }} />;
}
