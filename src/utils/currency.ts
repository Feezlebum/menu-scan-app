import type { CurrencyCode } from '@/src/types/spending';

export interface CurrencyDetectionResult {
  currency: CurrencyCode;
  confidence: number;
  reason: string;
}

const SYMBOL_TO_CURRENCY: Array<{ pattern: RegExp; currency: CurrencyCode; reason: string }> = [
  { pattern: /฿|\bTHB\b|baht/i, currency: 'THB', reason: 'thai-baht-symbol-or-code' },
  { pattern: /₹|\bINR\b|rupee/i, currency: 'INR', reason: 'indian-rupee-symbol-or-code' },
  { pattern: /\bKRW\b|₩|won/i, currency: 'KRW', reason: 'krw-symbol-or-code' },
  { pattern: /\bHKD\b/i, currency: 'HKD', reason: 'hkd-code' },
  { pattern: /¥|\bJPY\b|yen/i, currency: 'JPY', reason: 'yen-symbol-or-code' },
  { pattern: /\bCNY\b|RMB|yuan/i, currency: 'CNY', reason: 'yuan-code' },
  { pattern: /\bEUR\b|€/i, currency: 'EUR', reason: 'euro-symbol-or-code' },
  { pattern: /\bCHF\b/i, currency: 'CHF', reason: 'chf-code' },
  { pattern: /\bGBP\b|£/i, currency: 'GBP', reason: 'gbp-symbol-or-code' },
  { pattern: /\bAUD\b/i, currency: 'AUD', reason: 'aud-code' },
  { pattern: /\bCAD\b/i, currency: 'CAD', reason: 'cad-code' },
  { pattern: /\bNZD\b/i, currency: 'NZD', reason: 'nzd-code' },
  { pattern: /\bSGD\b/i, currency: 'SGD', reason: 'sgd-code' },
  { pattern: /\bMXN\b/i, currency: 'MXN', reason: 'mxn-code' },
  { pattern: /\bBRL\b|R\$/i, currency: 'BRL', reason: 'brl-symbol-or-code' },
  { pattern: /\bPLN\b|zł/i, currency: 'PLN', reason: 'pln-symbol-or-code' },
  { pattern: /\bSEK\b/i, currency: 'SEK', reason: 'sek-code' },
  { pattern: /\bNOK\b/i, currency: 'NOK', reason: 'nok-code' },
  { pattern: /\bDKK\b/i, currency: 'DKK', reason: 'dkk-code' },
  { pattern: /\bUSD\b|\$/i, currency: 'USD', reason: 'usd-symbol-or-code' },
];

const USD_BASE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  THB: 35.6,
  INR: 83.2,
  JPY: 149.0,
  CNY: 7.2,
  AUD: 1.52,
  CAD: 1.35,
  SGD: 1.35,
  MXN: 17.0,
  CHF: 0.88,
  NZD: 1.64,
  HKD: 7.8,
  KRW: 1325,
  SEK: 10.6,
  NOK: 10.8,
  DKK: 6.9,
  PLN: 4.0,
  BRL: 5.0,
};

export function detectCurrencyFromPriceText(priceText: string | null | undefined, fallback: CurrencyCode): CurrencyDetectionResult {
  if (!priceText) {
    return { currency: fallback, confidence: 0.35, reason: 'no-price-text-fallback' };
  }

  const hit = SYMBOL_TO_CURRENCY.find(({ pattern }) => pattern.test(priceText));
  if (hit) {
    return { currency: hit.currency, confidence: 0.92, reason: hit.reason };
  }

  return { currency: fallback, confidence: 0.4, reason: 'no-symbol-fallback-home-currency' };
}

export function inferCurrencyFromCuisine(cuisineKey: string | null | undefined, fallback: CurrencyCode): CurrencyDetectionResult {
  const key = (cuisineKey || '').toLowerCase();
  const map: Record<string, CurrencyCode> = {
    thai: 'THB',
    indian: 'INR',
    japanese: 'JPY',
    chinese: 'CNY',
    mexican: 'MXN',
    italian: 'EUR',
    french: 'EUR',
    mediterranean: 'EUR',
    american: 'USD',
  };

  if (!map[key]) {
    return { currency: fallback, confidence: 0.3, reason: 'cuisine-unknown-fallback' };
  }

  return { currency: map[key], confidence: 0.65, reason: 'cuisine-inference' };
}

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number | null {
  if (!Number.isFinite(amount)) return null;
  if (from === to) return Number(amount.toFixed(2));

  const fromRate = USD_BASE_RATES[from];
  const toRate = USD_BASE_RATES[to];
  if (!fromRate || !toRate) return null;

  const usd = amount / fromRate;
  const converted = usd * toRate;
  return Number(converted.toFixed(2));
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    THB: '฿',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    MXN: 'MX$',
    CHF: 'CHF',
    NZD: 'NZ$',
    HKD: 'HK$',
    KRW: '₩',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    BRL: 'R$',
  };

  return symbols[currency] || currency;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return `${getCurrencySymbol(currency)}${Number(amount.toFixed(2)).toFixed(2)}`;
}
