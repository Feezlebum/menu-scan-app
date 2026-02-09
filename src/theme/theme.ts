import { useColorScheme } from 'react-native';
import { colors, radius, spacing, fonts, typography } from './tokens';

export type AppTheme = {
  isDark: boolean;
  colors: {
    // Backgrounds
    bg: string;
    card: string;
    cardCream: string;
    cardSage: string;
    cardPeach: string;
    // Text
    text: string;
    subtext: string;
    caption: string;
    // UI Elements
    border: string;
    brand: string;
    secondary: string;
    accent: string;
    // Semantic
    success: string;
    warning: string;
    danger: string;
    // Traffic lights
    trafficGreen: string;
    trafficAmber: string;
    trafficRed: string;
    // Character
    michiTeal: string;
    // Shadows
    shadow: string;
    coralShadow: string;
  };
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  typography: typeof typography;
};

// Illustrated warm theme (primary)
const illustrated: AppTheme = {
  isDark: false,
  colors: {
    // Backgrounds
    bg: colors.warmCream,
    card: colors.white,
    cardCream: colors.cardCream,
    cardSage: colors.cardSage,
    cardPeach: colors.cardPeach,
    // Text
    text: colors.textPrimary,
    subtext: colors.textSecondary,
    caption: colors.textCaption,
    // UI Elements
    border: colors.borderLight,
    brand: colors.coral,
    secondary: colors.sage,
    accent: colors.amber,
    // Semantic
    success: colors.sage,
    warning: colors.amber,
    danger: colors.coral,
    // Traffic lights
    trafficGreen: colors.trafficGreen,
    trafficAmber: colors.trafficAmber,
    trafficRed: colors.trafficRed,
    // Character
    michiTeal: colors.michiTeal,
    // Shadows
    shadow: colors.shadow,
    coralShadow: colors.coralShadow,
  },
  spacing,
  radius,
  fonts,
  typography,
};

// Dark theme (for screens that need it, e.g., camera)
const dark: AppTheme = {
  ...illustrated,
  isDark: true,
  colors: {
    ...illustrated.colors,
    bg: colors.darkBg,
    card: '#3D3428',
    text: '#F4F0EB',
    subtext: '#B8AFA5',
    caption: '#8A8078',
    border: '#4D4438',
  },
};

// Always use illustrated theme for now (light mode focus)
export const useAppTheme = (): AppTheme => {
  // Force light/illustrated theme
  return illustrated;
};

// Export for components that need dark theme explicitly (e.g., camera)
export const useDarkTheme = (): AppTheme => dark;
