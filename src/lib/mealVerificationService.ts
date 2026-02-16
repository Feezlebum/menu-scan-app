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

  const invokeVerify = async () => {
    const { data, error } = await supabase.functions.invoke('verify-meal-photo', {
      body: payload,
    });

    if (error) {
      const status = (error as any)?.context?.status;
      const responseText = (error as any)?.context?.body;
      let detail = error.message || 'Verification failed';

      if (typeof responseText === 'string') {
        try {
          const parsed = JSON.parse(responseText);
          if (parsed?.error) detail = parsed.error;
        } catch {
          // keep original detail
        }
      }

      if (status === 404) {
        detail = 'Verification service is not deployed yet (verify-meal-photo).';
      } else if (status === 401 || status === 403) {
        detail = 'Verification service auth failed. Check Supabase function keys/secrets.';
      } else if (status === 500 || status === 502 || status === 503) {
        detail = `Verification service temporary error (${status}). Please retry.`;
      }

      throw new Error(detail);
    }

    if (!data?.success || !data?.result) {
      throw new Error(data?.error || 'Verification failed');
    }

    return data.result;
  };

  let r: any;
  try {
    r = await invokeVerify();
  } catch (error: any) {
    const msg = String(error?.message || '');
    const isRetryable =
      msg.includes('temporary error') || msg.includes('non-2xx') || msg.includes('Failed to fetch');

    if (!isRetryable) throw error;

    await new Promise((resolve) => setTimeout(resolve, 700));
    r = await invokeVerify();
  }

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
