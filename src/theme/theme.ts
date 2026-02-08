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
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  spacing: typeof spacing;
  radius: typeof radius;
};

const light: AppTheme = {
  isDark: false,
  colors: {
    bg: colors.cream,
    card: '#FFFFFF',
    text: '#16181D',
    subtext: '#6B7280',
    border: '#E7E7EA',
    brand: colors.brand,
    accent: colors.accent,
    success: colors.brand,
    warning: colors.amber,
    danger: colors.softRed,
  },
  spacing,
  radius,
};

const dark: AppTheme = {
  ...light,
  isDark: true,
  colors: {
    ...light.colors,
    bg: colors.trueDark,
    card: '#161A22',
    text: '#F4F7FB',
    subtext: '#9DA6B3',
    border: '#2B303B',
  },
};

export const useAppTheme = (): AppTheme => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
};
