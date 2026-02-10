import type { MenuItem } from '@/src/lib/scanService';
import type { DietType } from '@/src/stores/onboardingStore';

interface HealthyCriteriaInput {
  dailyCalorieGoal: number | null;
  dietType: DietType | null;
  restrictedFoods: string[];
}

export interface HealthyResult {
  isHealthy: boolean;
  reasons: string[];
}

const MEAT_KEYWORDS = ['beef', 'pork', 'chicken', 'turkey', 'lamb', 'bacon', 'ham', 'sausage', 'fish', 'shrimp', 'salmon', 'tuna'];
const ANIMAL_PRODUCT_KEYWORDS = [...MEAT_KEYWORDS, 'egg', 'eggs', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'honey'];
const NON_PALEO_KEYWORDS = ['rice', 'pasta', 'bread', 'wheat', 'corn', 'soy', 'beans', 'lentils', 'sugar'];

function hasAnyKeyword(text: string, keywords: string[]) {
  const lowered = text.toLowerCase();
  return keywords.some((keyword) => lowered.includes(keyword));
}

function matchesDietRestrictions(item: MenuItem, dietType: DietType | null): { ok: boolean; reason?: string } {
  const text = [item.name, item.description || '', ...(item.ingredients || [])].join(' ').toLowerCase();

  switch (dietType) {
    case 'keto':
      return item.estimatedCarbs <= 20
        ? { ok: true }
        : { ok: false, reason: `High carbs (${item.estimatedCarbs}g)` };
    case 'lowcarb':
      return item.estimatedCarbs <= 45
        ? { ok: true }
        : { ok: false, reason: `High carbs (${item.estimatedCarbs}g)` };
    case 'vegan':
      return !hasAnyKeyword(text, ANIMAL_PRODUCT_KEYWORDS)
        ? { ok: true }
        : { ok: false, reason: 'Not vegan compliant' };
    // paleo is not currently an active app diet option in this build
    case 'cico':
    case 'none':
    case null:
    default:
      return { ok: true };
  }
}

export function evaluateHealthyChoice(item: MenuItem, profile: HealthyCriteriaInput): HealthyResult {
  const reasons: string[] = [];

  // 1) Calorie compliance
  if (profile.dailyCalorieGoal && profile.dailyCalorieGoal > 0) {
    const perMealCap = profile.dailyCalorieGoal * 0.4;
    if (item.estimatedCalories > perMealCap) {
      reasons.push(`High calories (${item.estimatedCalories} vs ${Math.round(perMealCap)} meal cap)`);
    }
  } else if (item.estimatedCalories > 800) {
    reasons.push(`High calories (${item.estimatedCalories})`);
  }

  // 2) Diet compliance
  const dietCheck = matchesDietRestrictions(item, profile.dietType);
  if (!dietCheck.ok && dietCheck.reason) reasons.push(dietCheck.reason);

  // 3) Restricted foods compliance
  const text = [item.name, item.description || '', ...(item.ingredients || [])].join(' ').toLowerCase();
  const matches = (profile.restrictedFoods || []).filter((f) => f && text.includes(f.toLowerCase()));
  if (matches.length > 0) {
    reasons.push(`Contains restricted foods: ${matches.join(', ')}`);
  }

  return {
    isHealthy: reasons.length === 0,
    reasons,
  };
}
