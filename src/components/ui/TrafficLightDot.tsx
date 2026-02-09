import { View } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

type Tone = 'green' | 'amber' | 'red';

export function TrafficLightDot({ tone, size = 10 }: { tone: Tone; size?: number }) {
  const theme = useAppTheme();
  
  // Use dedicated traffic light colors
  const colorMap = { 
    green: theme.colors.trafficGreen,  // #0D9488 (teal-green)
    amber: theme.colors.trafficAmber,  // #E9A84C (warm gold)
    red: theme.colors.trafficRed,      // #E06B5E (coral-red)
  };
  
  return (
    <View 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: 999, 
        backgroundColor: colorMap[tone] 
      }} 
    />
  );
}
