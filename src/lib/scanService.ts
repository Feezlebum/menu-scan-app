import { supabase } from './supabase';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import * as FileSystem from 'expo-file-system/legacy';
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

/**
 * Upload image to Supabase Storage
 */
export async function uploadMenuImage(uri: string): Promise<string> {
  const filename = `menu-${Date.now()}.jpg`;
  
  // Read file as base64 (React Native compatible)
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  
  // Decode base64 to ArrayBuffer for Supabase upload
  const arrayBuffer = decode(base64);
  
  const { data, error } = await supabase.storage
    .from('menu-scans')
    .upload(filename, arrayBuffer, {
      contentType: 'image/jpeg',
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
 * Full scan flow: upload + parse
 */
export async function scanMenu(localUri: string): Promise<ScanResult> {
  // Step 1: Upload to storage
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
