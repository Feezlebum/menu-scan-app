import { supabase } from './supabase';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { estimateNutrition as estimateManualNutrition, type NutritionEstimate } from '@/src/lib/manualNutrition';

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

export async function estimateNutrition(
  itemName: string,
  cuisineKey: string,
  restaurantName?: string
): Promise<NutritionEstimate> {
  console.log('[estimateNutrition] Calling Edge Function with:', { itemName, cuisineKey, restaurantName });
  
  try {
    const { data, error } = await supabase.functions.invoke('estimate-nutrition', {
      body: { itemName, cuisineKey, restaurantName: restaurantName?.trim() || null },
    });

    console.log('[estimateNutrition] Edge Function response:', { data, error });

    if (!error && data?.success && data?.estimate) {
      console.log('[estimateNutrition] Using AI estimate:', data.estimate);
      return data.estimate as NutritionEstimate;
    }
    
    console.warn('[estimateNutrition] Edge Function failed, using fallback:', { error, dataSuccess: data?.success, hasEstimate: !!data?.estimate });
  } catch (catchError) {
    console.error('[estimateNutrition] Exception calling Edge Function:', catchError);
  }

  console.log('[estimateNutrition] Using local heuristic fallback');
  return estimateManualNutrition(itemName, cuisineKey);
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

  const invoke = async () =>
    supabase.functions.invoke('parse-menu', {
      body: { imageUrl, userProfile },
    });

  let { data, error } = await invoke();

  // Retry once for reliability on transient model/function misses.
  if (error || !data?.success || !Array.isArray(data?.items) || data.items.length === 0) {
    const retry = await invoke();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(`Parse failed: ${error.message}`);
  }

  if (!data?.success || !Array.isArray(data?.items) || data.items.length === 0) {
    throw new Error('Parse failed: no menu items detected. Please retake the photo with the full menu visible.');
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
    console.log('[scan] Starting optimized scan with parallel processing...');
    const parallelStart = Date.now();
    
    const [compressedUri, uploadMetadata] = await Promise.all([
      compressImageForUpload(localUri),
      prepareUploadMetadata(),
    ]);
    
    const parallelEnd = Date.now();
    console.log(`[scan] Parallel prep complete in ${parallelEnd - parallelStart}ms`);
    
    // Upload the compressed image
    const uploadStart = Date.now();
    const imageUrl = await uploadMenuImage(compressedUri, uploadMetadata);
    const uploadEnd = Date.now();
    console.log(`[scan] Upload complete in ${uploadEnd - uploadStart}ms`);
    
    // Parse with AI
    const parseStart = Date.now();
    const result = await parseMenu(imageUrl);
    const parseEnd = Date.now();
    console.log(`[scan] AI analysis complete in ${parseEnd - parseStart}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log(`[scan] Total optimized scan time: ${totalTime}ms`);
    
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
