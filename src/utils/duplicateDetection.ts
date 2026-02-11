import type { MenuItem } from '@/src/lib/scanService';
import type { LoggedMeal } from '@/src/stores/historyStore';

export function isDuplicateMealToday(
  loggedMeals: LoggedMeal[],
  item: MenuItem,
  restaurantName: string | null
): boolean {
  const today = new Date().toDateString();

  return loggedMeals.some((meal) => {
    const sameDay = new Date(meal.loggedAt).toDateString() === today;
    if (!sameDay) return false;

    const sameName = meal.item.name.toLowerCase().trim() === item.name.toLowerCase().trim();
    const sameRestaurant = (meal.restaurantName || '').toLowerCase().trim() === (restaurantName || '').toLowerCase().trim();
    const closeCalories = Math.abs((meal.item.estimatedCalories || 0) - (item.estimatedCalories || 0)) < 50;

    return sameName && sameRestaurant && closeCalories;
  });
}
