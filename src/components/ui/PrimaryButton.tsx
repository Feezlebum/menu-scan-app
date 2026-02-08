import { Pressable, Text } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

export function PrimaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.brand,
        borderRadius: theme.radius.pill,
        paddingVertical: 12,
        paddingHorizontal: 18,
      }}>
      <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}
