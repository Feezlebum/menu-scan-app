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

export function estimateNutrition(itemName: string, cuisineKey: string): NutritionEstimate {
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
