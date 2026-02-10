export interface StreakEntry {
  date: string; // ISO date
  action: 'increment' | 'break';
  streakValue: number;
  mealId?: string;
}

export interface HealthyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  lastBreakDate: string | null;
  totalGoodChoices: number;
  streakHistory: StreakEntry[];
  lastChoice: {
    mealName: string;
    loggedAt: string;
    wasHealthy: boolean;
    overrideUsed?: boolean;
  } | null;
}

export interface MealHealthEvaluation {
  isHealthy: boolean;
  reasons: string[];
}
