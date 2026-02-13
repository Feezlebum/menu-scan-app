/**
 * Michi-moji Asset Mapping
 * Maps standard emoji Unicode to custom Michi-moji assets
 */

export const MICHI_MOJI_MAP = {
  // Emotions & Expressions
  '😀': require('./optimized/laugh.png'),      // grinning face
  '😂': require('./optimized/laugh.png'),      // face with tears of joy
  '😍': require('./optimized/love.png'),       // smiling face with heart-eyes
  '😎': require('./optimized/cool.png'),       // smiling face with sunglasses
  '😢': require('./optimized/sad.png'),        // crying face
  '😡': require('./optimized/angry.png'),      // pouting face
  '😴': require('./optimized/sleep.png'),      // sleeping face
  '🤔': require('./optimized/think.png'),      // thinking face
  '😱': require('./optimized/shocked.png'),    // face screaming in fear
  '🤒': require('./optimized/sick.png'),       // face with thermometer
  '🥵': require('./optimized/hot.png'),        // hot face
  '🥶': require('./optimized/cold.png'),       // cold face
  '😵': require('./optimized/confused.png'),   // dizzy face
  '🤤': require('./optimized/hungry.png'),     // drooling face
  
  // Gestures & Actions  
  '👍': require('./optimized/thumbsup.png'),   // thumbs up
  '👏': require('./optimized/clap.png'),       // clapping hands
  '👋': require('./optimized/wave.png'),       // waving hand
  '🙏': require('./optimized/pray.png'),       // folded hands
  '🫡': require('./optimized/salute.png'),     // saluting face
  '🤷': require('./optimized/shrug.png'),      // person shrugging
  '🤦': require('./optimized/facepalm.png'),   // person facepalming
  
  // Activity & Objects
  '🔥': require('./optimized/fire.png'),       // fire
  '💪': require('./optimized/workout.png'),    // flexed biceps
  '🎉': require('./optimized/celebrate.png'),  // party popper
  '💰': require('./optimized/money.png'),      // money bag
  '❤️': require('./optimized/heart.png'),      // red heart
  '👀': require('./optimized/eyes.png'),       // eyes
  '✨': require('./optimized/sparkle.png'),    // sparkles
  '👨‍🍳': require('./optimized/cook.png'),       // cook
  '😏': require('./optimized/sneaky.png'),     // smirking face
  '😤': require('./optimized/proud.png'),      // face with steam from nose
} as const;

export type MichiMojiName = 
  | 'angry' | 'celebrate' | 'clap' | 'cold' | 'confused' | 'cook' | 'cool' 
  | 'eyes' | 'facepalm' | 'fire' | 'heart' | 'hot' | 'hungry' | 'laugh' 
  | 'love' | 'money' | 'pray' | 'proud' | 'sad' | 'salute' | 'shocked' 
  | 'shrug' | 'sick' | 'sleep' | 'sneaky' | 'sparkle' | 'think' 
  | 'thumbsup' | 'wave' | 'workout';

/**
 * Get Michi-moji asset by name
 */
export function getMichiMoji(name: MichiMojiName) {
  return require(`./optimized/${name}.png`);
}

/**
 * Convert standard emoji to Michi-moji
 */
export function convertToMichiMoji(emoji: string) {
  return MICHI_MOJI_MAP[emoji as keyof typeof MICHI_MOJI_MAP] || null;
}

/**
 * Check if emoji has Michi-moji equivalent
 */
export function hasMichiMoji(emoji: string): boolean {
  return emoji in MICHI_MOJI_MAP;
}

/**
 * Get all available Michi-moji names
 */
export function getAllMichiMojiNames(): MichiMojiName[] {
  return [
    'angry', 'celebrate', 'clap', 'cold', 'confused', 'cook', 'cool',
    'eyes', 'facepalm', 'fire', 'heart', 'hot', 'hungry', 'laugh',
    'love', 'money', 'pray', 'proud', 'sad', 'salute', 'shocked',
    'shrug', 'sick', 'sleep', 'sneaky', 'sparkle', 'think',
    'thumbsup', 'wave', 'workout'
  ];
}