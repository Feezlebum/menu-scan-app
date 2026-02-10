import type { MenuItem } from '@/src/lib/scanService';
import type { DietType } from '@/src/stores/onboardingStore';
import type { MealHealthEvaluation } from '@/src/types/streak';

interface StreakCriteriaInput {
  dailyCalorieTarget: number | null;
  dietType: DietType | null;
  intolerances: string[];
  dislikes: string[];
}

const includesAny = (haystack: string, needles: string[]): string[] => {
  const lowered = haystack.toLowerCase();
  return needles.filter((needle) => lowered.includes(needle.toLowerCase()));
};

export function evaluateMealHealth(
  item: MenuItem,
  criteria: StreakCriteriaInput
): MealHealthEvaluation {
  const reasons: string[] = [];

  const calories = item.estimatedCalories || 0;
  const calorieTarget = criteria.dailyCalorieTarget;

  const combinedText = [
    item.name,
    item.description || '',
    ...(item.ingredients || []),
  ].join(' ');

  const matchedDislikes = includesAny(combinedText, criteria.dislikes || []);
  const matchedIntolerances = includesAny(combinedText, criteria.intolerances || []);

  const restrictionCompliant = matchedDislikes.length === 0 && matchedIntolerances.length === 0;

  if (matchedDislikes.length > 0) {
    reasons.push(`Contains avoided foods: ${matchedDislikes.join(', ')}`);
  }
  if (matchedIntolerances.length > 0) {
    reasons.push(`Contains intolerances: ${matchedIntolerances.join(', ')}`);
  }

  let dietCompliant = true;
  switch (criteria.dietType) {
    case 'vegan':
      dietCompliant = item.isVegan;
      if (!dietCompliant) reasons.push('Not vegan compliant');
      break;
    case 'keto':
      dietCompliant = item.estimatedCarbs <= 30;
      if (!dietCompliant) reasons.push(`High carbs (${item.estimatedCarbs}g)`);
      break;
    case 'lowcarb':
      dietCompliant = item.estimatedCarbs <= 45;
      if (!dietCompliant) reasons.push(`High carbs (${item.estimatedCarbs}g)`);
      break;
    default:
      dietCompliant = true;
      break;
  }

  let calorieCompliant = true;
  if (calorieTarget && calorieTarget > 0) {
    calorieCompliant = calories <= calorieTarget;
    if (!calorieCompliant) {
      reasons.push(`High calories (${calories} vs ${calorieTarget} goal)`);
    }
  } else {
    calorieCompliant = calories <= 800;
    if (!calorieCompliant) {
      reasons.push(`High calories (${calories})`);
    }
  }

  const isHealthy = calorieCompliant && dietCompliant && restrictionCompliant;

  return {
    isHealthy,
    reasons,
  };
}
