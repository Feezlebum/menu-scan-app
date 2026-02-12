import { describe, it, expect } from '@jest/globals';
import { estimateNutrition } from './manualNutrition';

describe('estimateNutrition', () => {
  it('boosts healthy signals for grilled salad-like names', () => {
    const result = estimateNutrition('Grilled Chicken Salad', 'american');
    expect(result.estimatedCalories).toBeLessThan(650);
    expect(result.estimatedProtein).toBeGreaterThanOrEqual(36);
    expect(['healthy', 'moderate']).toContain(result.health);
  });

  it('increases calories for indulgent keywords', () => {
    const result = estimateNutrition('Double Cheeseburger with Fries', 'american');
    expect(result.estimatedCalories).toBeGreaterThan(700);
    expect(['moderate', 'indulgent']).toContain(result.health);
    expect(result.score).toBeLessThan(70);
  });

  it('falls back safely for unknown cuisine', () => {
    const result = estimateNutrition('House Special', 'martian');
    expect(result.estimatedCalories).toBeGreaterThanOrEqual(150);
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.score).toBeLessThanOrEqual(95);
  });
});
