// Michi Asset Management
// Centralized mapping of moods to Michi images

export const MichiAssets = {
  // Core mood states
  celebrating: require('@/assets/michi-excited.png'),
  encouraging: require('@/assets/michi-avatar.png'), // Default happy
  concerned: require('@/assets/michi-sad.png'),
  thinking: require('@/assets/michi-magnifying-glass.png'),

  // Additional states for UX flows
  confused: require('@/assets/michi-confused.png'),
  worried: require('@/assets/michi-worried.png'),
  hero: require('@/assets/michi-hero.png'), // Chef/confident
  spending: require('@/assets/michi-spending.png'),

  // Onboarding v2 variants (fallback to existing assets until new PNGs are added)
  onboardingWave: require('@/assets/michi-avatar.png'),
  onboardingCurious: require('@/assets/michi-confused.png'),
  onboardingEmpathetic: require('@/assets/michi-sad.png'),
  onboardingNervous: require('@/assets/michi-worried.png'),
  onboardingBuff: require('@/assets/michi-hero.png'),
  onboardingClipboard: require('@/assets/michi-magnifying-glass.png'),
  onboardingMoney: require('@/assets/michi-spending.png'),
  onboardingMeasure: require('@/assets/michi-hero.png'),
  onboardingCelebrate: require('@/assets/michi-excited.png'),
} as const;

export type MichiMood = keyof typeof MichiAssets;
export type MichiVariant =
  | 'avatar'
  | 'hero'
  | 'thinking'
  | 'excited'
  | 'sad'
  | 'worried'
  | 'confused';

/**
 * Get Michi asset for scan states
 */
export function getScanMichi(scanState: 'ready' | 'capturing' | 'processing' | 'error') {
  switch (scanState) {
    case 'ready':
      return MichiAssets.hero; // Confident chef
    case 'capturing':
      return MichiAssets.thinking; // Focused
    case 'processing':
      return MichiAssets.confused; // Analyzing with question marks
    case 'error':
      return MichiAssets.worried; // Something went wrong
    default:
      return MichiAssets.encouraging; // Default
  }
}

/**
 * Get appropriate Michi for profile states
 */
export function getProfileMichi(variant: MichiVariant) {
  switch (variant) {
    case 'hero':
      return MichiAssets.hero;
    case 'thinking':
      return MichiAssets.thinking;
    case 'excited':
      return MichiAssets.celebrating;
    case 'sad':
      return MichiAssets.concerned;
    case 'worried':
      return MichiAssets.worried;
    case 'confused':
      return MichiAssets.confused;
    case 'avatar':
    default:
      return MichiAssets.encouraging;
  }
}

export default MichiAssets;
