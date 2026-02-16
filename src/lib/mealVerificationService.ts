import { supabase } from '@/src/lib/supabase';
import { uploadMenuImage } from '@/src/lib/scanService';
import type { LoggedMeal } from '@/src/stores/historyStore';

export type VerificationConfidence = 'low' | 'medium' | 'high';
export type PortionAssessment = 'smaller' | 'as_expected' | 'larger' | 'much_larger';

export interface MealVerificationResult {
  revisedCalories: number;
  revisedProtein: number;
  revisedCarbs: number;
  revisedFat: number;
  confidence: VerificationConfidence;
  notes: string;
  portionAssessment: PortionAssessment;
}

export async function verifyMealPhoto(meal: LoggedMeal, localPhotoUri: string): Promise<MealVerificationResult> {
  const photoUrl = await uploadMenuImage(localPhotoUri);

  const payload = {
    imageUrl: photoUrl,
    context: {
      itemName: meal.item.name,
      restaurantName: meal.restaurantName,
      menuEstimate: {
        calories: meal.item.estimatedCalories,
        protein: meal.item.estimatedProtein,
        carbs: meal.item.estimatedCarbs,
        fat: meal.item.estimatedFat,
      },
    },
  };

  const { data, error } = await supabase.functions.invoke('verify-meal-photo', {
    body: payload,
  });

  if (error) throw new Error(error.message || 'Verification failed');
  if (!data?.success || !data?.result) throw new Error(data?.error || 'Verification failed');

  const r = data.result;
  return {
    revisedCalories: Number(r.revisedCalories),
    revisedProtein: Number(r.revisedProtein),
    revisedCarbs: Number(r.revisedCarbs),
    revisedFat: Number(r.revisedFat),
    confidence: (r.confidence || 'medium') as VerificationConfidence,
    notes: String(r.notes || ''),
    portionAssessment: (r.portionAssessment || 'as_expected') as PortionAssessment,
  };
}
