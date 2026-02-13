import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { getMichiMoji, MichiMojiName, convertToMichiMoji } from '../../assets/michimojis/michiMojiMap';

interface MichiMojiProps {
  /** Name of the Michi-moji */
  name?: MichiMojiName;
  /** Standard emoji to convert to Michi-moji */
  emoji?: string;
  /** Size of the emoji (width and height) */
  size?: number;
  /** Custom styles */
  style?: StyleProp<ImageStyle>;
}

/**
 * MichiMoji Component
 * 
 * Renders custom Michi-moji emojis with consistent sizing and styling.
 * Can use either direct name or convert from standard emoji.
 * 
 * @example
 * // Direct name usage
 * <MichiMoji name="hungry" size={24} />
 * 
 * // Convert from emoji
 * <MichiMoji emoji="🤤" size={24} />
 * 
 * // With custom styles
 * <MichiMoji name="celebrate" size={32} style={{ marginRight: 8 }} />
 */
export default function MichiMoji({ 
  name, 
  emoji, 
  size = 24, 
  style 
}: MichiMojiProps) {
  let source;
  
  if (name) {
    source = getMichiMoji(name);
  } else if (emoji) {
    source = convertToMichiMoji(emoji);
  }
  
  if (!source) {
    // Fallback: return null or a placeholder
    return null;
  }
  
  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          resizeMode: 'contain',
        },
        style,
      ]}
      accessibilityLabel={name || `michi-moji-${emoji}`}
    />
  );
}

/**
 * Utility function to replace emojis in text with Michi-mojis
 * 
 * @example
 * const text = "I'm hungry 🤤 for pizza 🍕!";
 * const processedText = replaceMichiMojisInText(text, 20);
 */
export function replaceMichiMojisInText(text: string, size: number = 16) {
  // This would need a more complex implementation with React components
  // For now, just return the text as-is
  return text;
}