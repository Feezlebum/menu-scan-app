import { Text, TextProps } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

export function AppText(props: TextProps) {
  const theme = useAppTheme();
  return <Text {...props} style={[{ color: theme.colors.text, fontSize: 16 }, props.style]} />;
}
