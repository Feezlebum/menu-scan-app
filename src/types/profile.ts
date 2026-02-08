export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface Profile {
  id: string;
  goal: 'lose' | 'maintain' | 'gain' | 'health';
  daily_calorie_target: number | null;
  scans_this_week: number;
  subscription_tier: SubscriptionTier;
}
