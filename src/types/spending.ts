export type CurrencyCode =
  | 'USD'
  | 'GBP'
  | 'EUR'
  | 'THB'
  | 'INR'
  | 'JPY'
  | 'CNY'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'MXN';

export interface SpendingEntry {
  id: string;
  date: string; // ISO
  amount: number; // Home-currency amount for budgeting
  restaurant: string;
  mealName: string;
  extractionMethod: 'ocr' | 'manual' | 'estimate';
  currency: CurrencyCode; // Home currency
  originalAmount?: number;
  originalCurrency?: CurrencyCode;
  fxRate?: number;
  fxTimestamp?: string;
  currencyConfidence?: number;
  currencySignals?: string[];
}

export interface SpendingTracker {
  weeklyBudget: number | null;
  currency: CurrencyCode;
  includeTips: boolean;
  spendingHistory: SpendingEntry[];
}
