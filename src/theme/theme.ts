import { useColorScheme } from 'react-native';
import { colors, radius, spacing } from './tokens';

export type AppTheme = {
  isDark: boolean;
  colors: {
    bg: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    brand: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    // Traffic light colors
    trafficGreen: string;
    trafficAmber: string;
    trafficRed: string;
  };
  spacing: typeof spacing;
  radius: typeof radius;
};

const light: AppTheme = {
  isDark: false,
  colors: {
    bg: colors.lightBg,      // Cool White #F8FAFA
    card: '#FFFFFF',
    text: '#16181D',
    subtext: '#6B7280',
    border: '#E7E7EA',
    brand: colors.brand,     // Deep Teal #0D9488
    secondary: colors.secondary, // Soft Mint #B2DFDB
    accent: colors.accent,   // Warm Coral #F28B6E
    success: colors.brand,
    warning: colors.amber,
    danger: colors.softRed,
    trafficGreen: colors.trafficGreen,
    trafficAmber: colors.trafficAmber,
    trafficRed: colors.trafficRed,
  },
  spacing,
  radius,
};

const dark: AppTheme = {
  ...light,
  isDark: true,
  colors: {
    ...light.colors,
    bg: colors.darkBg,       // Deep Slate #0F1A1E
    card: '#1A2428',
    text: '#F4F7FB',
    subtext: '#9DA6B3',
    border: '#2B3338',
  },
};

export const useAppTheme = (): AppTheme => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
};
