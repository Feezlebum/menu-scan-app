export type CurrencyCode = 'USD' | 'GBP' | 'EUR';

export interface SpendingEntry {
  id: string;
  date: string; // ISO
  amount: number;
  restaurant: string;
  mealName: string;
  extractionMethod: 'ocr' | 'manual' | 'estimate';
  currency: CurrencyCode;
}

export interface SpendingTracker {
  weeklyBudget: number | null;
  currency: CurrencyCode;
  spendingHistory: SpendingEntry[];
}
