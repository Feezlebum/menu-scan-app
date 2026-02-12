import { supabase } from './supabase';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

export interface MenuItem {
  name: string;
  description: string | null;
  price: string | null;
  section: string | null;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenWarning: string | null;
  modificationTips: string[];
  score: number;
  scoreReasons: string[];
  trafficLight: 'green' | 'amber' | 'red';
  matchLabel: string;
}

export interface TopPick extends MenuItem {
  rank: number;
  badge: string;
}

export interface ScanResult {
  success: boolean;
  restaurantName: string | null;
  restaurantType: 'chain' | 'independent';
  items: MenuItem[];
  topPicks: TopPick[];
  totalItems: number;
  error?: string;
}

export interface NutritionEstimate {
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  health: 'healthy' | 'moderate' | 'indulgent';
  healthReason: string;
  score: number;
  trafficLight: 'green' | 'amber' | 'red';
  matchLabel: string;
}

/**
 * Convert OCR-extracted price text to a normalized number.
 */
export const parsePrice = (priceText: string | null): number | null => {
  if (!priceText) return null;

  const normalized = priceText.trim().toLowerCase();
  if (
    normalized === 'mp' ||
    normalized.includes('market') ||
    normalized.includes('seasonal')
  ) {
    return null;
  }

  const match = priceText.match(/(\d+\.?\d*)/);
  if (!match) return null;

  const parsed = Number.parseFloat(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
};

export async function estimateNutrition(itemName: string, cuisineKey: string): Promise<NutritionEstimate> {
  const defaults: Record<string, { cals: number; protein: number; carbs: number; fat: number }> = {
    american: { cals: 650, protein: 32, carbs: 55, fat: 32 },
    italian: { cals: 550, protein: 25, carbs: 62, fat: 20 },
    mexican: { cals: 580, protein: 28, carbs: 58, fat: 24 },
    chinese: { cals: 420, protein: 22, carbs: 48, fat: 14 },
    japanese: { cals: 380, protein: 24, carbs: 42, fat: 12 },
    thai: { cals: 450, protein: 22, carbs: 50, fat: 16 },
    indian: { cals: 520, protein: 20, carbs: 55, fat: 20 },
    mediterranean: { cals: 480, protein: 26, carbs: 38, fat: 20 },
    french: { cals: 620, protein: 26, carbs: 46, fat: 30 },
    other: { cals: 500, protein: 24, carbs: 50, fat: 20 },
  };

  const base = defaults[cuisineKey] ?? defaults.other;
  const name = itemName.toLowerCase();

  let calories = base.cals;
  let protein = base.protein;
  let carbs = base.carbs;
  let fat = base.fat;

  if (/(salad|grilled|steamed|broth|sashimi)/.test(name)) {
    calories -= 120;
    carbs -= 12;
    fat -= 6;
    protein += 4;
  }

  if (/(burger|fries|fried|alfredo|carbonara|cream|cheesy|pizza|burrito)/.test(name)) {
    calories += 180;
    carbs += 14;
    fat += 10;
  }

  if (/(chicken|turkey|tuna|salmon|steak|beef|pork|tofu)/.test(name)) {
    protein += 8;
  }

  calories = Math.max(150, Math.round(calories));
  protein = Math.max(5, Math.round(protein));
  carbs = Math.max(5, Math.round(carbs));
  fat = Math.max(3, Math.round(fat));

  let score = 65;
  if (calories > 750) score -= 20;
  else if (calories > 600) score -= 10;
  else if (calories < 450) score += 8;

  if (protein >= 30) score += 10;
  if (fat > 35) score -= 10;
  if (carbs > 70) score -= 8;

  score = Math.max(20, Math.min(95, Math.round(score)));

  const health: NutritionEstimate['health'] = score >= 72 ? 'healthy' : score >= 50 ? 'moderate' : 'indulgent';
  const trafficLight: NutritionEstimate['trafficLight'] = score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red';
  const matchLabel = score >= 85 ? 'Perfect Match' : score >= 70 ? 'Great Choice' : score >= 55 ? 'Good Option' : score >= 40 ? 'Okay with Tweaks' : 'Splurge';

  const healthReason =
    health === 'healthy'
      ? 'Balanced estimate with good protein and manageable calories.'
      : health === 'moderate'
      ? 'Reasonable choice, but portion and sides can swing calories up.'
      : 'Likely calorie-dense choice; consider lighter sides or portion split.';

  return {
    estimatedCalories: calories,
    estimatedProtein: protein,
    estimatedCarbs: carbs,
    estimatedFat: fat,
    health,
    healthReason,
    score,
    trafficLight,
    matchLabel,
  };
}

/**
 * Compress image for optimal upload size and processing
 */
export async function compressImageForUpload(uri: string): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        // Resize to reasonable dimensions for OCR (balance quality vs upload speed)
        { resize: { width: 1200 } }, // Height auto-scales to maintain aspect ratio
      ],
      {
        compress: 0.8, // 80% quality - good balance of file size vs clarity
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    return manipResult.uri;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return uri; // Fallback to original if compression fails
  }
}

/**
 * Prepare upload metadata (can run in parallel with compression)
 */
export async function prepareUploadMetadata(): Promise<{ filename: string; contentType: string }> {
  return {
    filename: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`,
    contentType: 'image/jpeg',
  };
}

/**
 * Upload image to Supabase Storage (optimized version)
 */
export async function uploadMenuImage(
  uri: string, 
  metadata?: { filename: string; contentType: string }
): Promise<string> {
  const uploadMeta = metadata || await prepareUploadMetadata();
  
  // Read file as base64 (React Native compatible)
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  
  // Decode base64 to ArrayBuffer for Supabase upload
  const arrayBuffer = decode(base64);
  
  const { data, error } = await supabase.storage
    .from('menu-scans')
    .upload(uploadMeta.filename, arrayBuffer, {
      contentType: uploadMeta.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('menu-scans')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Parse menu using Edge Function
 */
export async function parseMenu(imageUrl: string): Promise<ScanResult> {
  // Get user profile for scoring
  const store = useOnboardingStore.getState();
  
  const userProfile = {
    goal: store.goal || 'health',
    dietType: store.dietType || 'none',
    macroPriority: store.macroPriority || 'balanced',
    intolerances: store.intolerances || [],
    dislikes: store.dislikes || [],
  };

  const { data, error } = await supabase.functions.invoke('parse-menu', {
    body: { imageUrl, userProfile },
  });

  if (error) {
    throw new Error(`Parse failed: ${error.message}`);
  }

  return data as ScanResult;
}

/**
 * Optimized scan flow with parallel processing
 */
export async function scanMenu(localUri: string): Promise<ScanResult> {
  const startTime = Date.now();
  
  try {
    // PARALLEL OPTIMIZATION: Start compression and metadata prep simultaneously
    console.log('🚀 Starting optimized scan with parallel processing...');
    const parallelStart = Date.now();
    
    const [compressedUri, uploadMetadata] = await Promise.all([
      compressImageForUpload(localUri),
      prepareUploadMetadata(),
    ]);
    
    const parallelEnd = Date.now();
    console.log(`✅ Parallel prep complete in ${parallelEnd - parallelStart}ms`);
    
    // Upload the compressed image
    const uploadStart = Date.now();
    const imageUrl = await uploadMenuImage(compressedUri, uploadMetadata);
    const uploadEnd = Date.now();
    console.log(`📤 Upload complete in ${uploadEnd - uploadStart}ms`);
    
    // Parse with AI
    const parseStart = Date.now();
    const result = await parseMenu(imageUrl);
    const parseEnd = Date.now();
    console.log(`🧠 AI analysis complete in ${parseEnd - parseStart}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log(`🏁 Total optimized scan time: ${totalTime}ms`);
    
    return result;
  } catch (error) {
    console.warn('Optimized scan failed, falling back to original method:', error);
    return await scanMenuFallback(localUri);
  }
}

/**
 * Fallback scan flow (original method)
 */
export async function scanMenuFallback(localUri: string): Promise<ScanResult> {
  // Step 1: Upload to storage (original method, no compression)
  const imageUrl = await uploadMenuImage(localUri);
  
  // Step 2: Parse with AI
  const result = await parseMenu(imageUrl);
  
  return result;
}

/**
 * Save scan to database
 */
export async function saveScan(
  userId: string,
  result: ScanResult,
  photoUrl: string
): Promise<string> {
  const { data, error } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      restaurant_name: result.restaurantName,
      restaurant_type: result.restaurantType,
      photo_url: photoUrl,
      menu_items: result.items,
      top_picks: result.topPicks,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Save failed: ${error.message}`);
  }

  return data.id;
}
