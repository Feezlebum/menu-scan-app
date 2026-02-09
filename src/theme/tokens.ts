// ========================================
// "Playful Illustrated" Theme Tokens
// Warm, cookbook-like aesthetic
// ========================================

export const colors = {
  // Backgrounds
  warmCream: '#FFF5E6',      // Main background (parchment)
  white: '#FFFFFF',
  cardCream: '#FFF0D4',      // Cream cards
  cardSage: '#E8F5E2',       // Sage green cards
  cardPeach: '#FFE8D6',      // Peach cards
  
  // Primary / CTA
  coral: '#E86B50',          // Primary buttons, scan FAB, active nav
  coralShadow: 'rgba(232, 107, 80, 0.3)',
  
  // Secondary
  sage: '#6BAF7A',           // Tags, focus chips
  
  // Tertiary / Decorative
  amber: '#F4A261',          // Decorative accents
  
  // Character Only (NOT UI)
  michiTeal: '#5ABAB7',      // Michi body color only
  
  // Text
  textPrimary: '#2D2418',    // Dark warm brown
  textSecondary: '#6B5B4E',  // Medium warm brown
  textCaption: '#9B8B7E',    // Light warm brown
  
  // Borders & Shadows
  borderLight: '#F0E6D6',
  shadow: 'rgba(45, 36, 24, 0.08)',
  
  // Traffic lights (keeping for results/history)
  trafficGreen: '#6BAF7A',   // Use sage for green
  trafficAmber: '#F4A261',   // Use amber
  trafficRed: '#E86B50',     // Use coral for red
  
  // Legacy mappings (for components that still reference old names)
  brand: '#E86B50',
  secondary: '#E8F5E2',
  accent: '#F4A261',
  lightBg: '#FFF5E6',
  darkBg: '#2D2418',
  cream: '#FFF5E6',
  trueDark: '#2D2418',
  softRed: '#E86B50',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
};

// Font family names (loaded via expo-font)
export const fonts = {
  heading: {
    bold: 'Baloo2-Bold',
    semiBold: 'Baloo2-SemiBold',
    medium: 'Baloo2-Medium',
    regular: 'Baloo2-Regular',
  },
  body: {
    bold: 'Nunito-Bold',
    semiBold: 'Nunito-SemiBold',
    medium: 'Nunito-Medium',
    regular: 'Nunito-Regular',
    light: 'Nunito-Light',
  },
};

// Typography presets
export const typography = {
  greeting: {
    fontFamily: fonts.heading.bold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  sectionHeader: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  buttonText: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 18,
    color: colors.white,
  },
  bodyText: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  tagText: {
    fontFamily: fonts.body.semiBold,
    fontSize: 13,
    color: colors.sage,
  },
  caption: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.textCaption,
  },
  michiSpeech: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
};
