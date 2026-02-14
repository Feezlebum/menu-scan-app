import type { CurrencyCode } from '@/src/types/spending';
import { convertCurrency } from '@/src/utils/currency';

interface FxQuote {
  rate: number;
  timestamp: string;
  source: 'frankfurter' | 'fallback';
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const rateCache = new Map<string, { rate: number; ts: number }>();

const cacheKey = (from: CurrencyCode, to: CurrencyCode) => `${from}->${to}`;

export async function getFxRate(from: CurrencyCode, to: CurrencyCode): Promise<FxQuote> {
  if (from === to) {
    return { rate: 1, timestamp: new Date().toISOString(), source: 'fallback' };
  }

  const key = cacheKey(from, to);
  const cached = rateCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { rate: cached.rate, timestamp: new Date(cached.ts).toISOString(), source: 'frankfurter' };
  }

  try {
    const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.rates?.[to]);
      if (Number.isFinite(rate) && rate > 0) {
        rateCache.set(key, { rate, ts: Date.now() });
        return { rate, timestamp: new Date().toISOString(), source: 'frankfurter' };
      }
    }
  } catch {
    // fallback below
  }

  const fallbackConverted = convertCurrency(1, from, to);
  const fallbackRate = fallbackConverted && fallbackConverted > 0 ? fallbackConverted : 1;
  return { rate: fallbackRate, timestamp: new Date().toISOString(), source: 'fallback' };
}

export async function convertWithFx(amount: number, from: CurrencyCode, to: CurrencyCode) {
  if (!Number.isFinite(amount)) return null;
  const quote = await getFxRate(from, to);
  const converted = Number((amount * quote.rate).toFixed(2));
  return {
    converted,
    rate: quote.rate,
    timestamp: quote.timestamp,
    source: quote.source,
  };
}
