import { supabase } from '@/src/lib/supabase';

export type TranslationHealthRating = 'healthy' | 'moderate' | 'indulgent';

export interface TranslatedMenuItem {
  original: string;
  translated: string;
  phonetic: string;
  health: TranslationHealthRating;
  ingredients: string[];
  allergens: string[];
  price?: string;
  confidence: number;
}

export interface OrderingPhrase {
  english: string;
  original: string;
  phonetic: string;
  context: 'ordering' | 'paying' | 'thanking' | 'general';
}

export interface TranslationResult {
  success: boolean;
  detectedLanguage: string;
  languageCode: string;
  translatedItems: TranslatedMenuItem[];
  orderingPhrases: OrderingPhrase[];
  culturalTips: string[];
  confidence: number;
  error?: string;
}

interface RawTranslationResponse {
  detectedLanguage?: string;
  languageCode?: string;
  items?: Array<{
    original?: string;
    translated?: string;
    phonetic?: string;
    health?: TranslationHealthRating;
    ingredients?: string[];
    allergens?: string[];
    price?: string;
    confidence?: number;
  }>;
  orderingPhrases?: Array<{
    english?: string;
    original?: string;
    phonetic?: string;
    context?: OrderingPhrase['context'];
  }>;
  culturalTips?: string[];
  confidence?: number;
}

function normalizeResult(raw: RawTranslationResponse): TranslationResult {
  const translatedItems: TranslatedMenuItem[] = (raw.items ?? []).map((item) => ({
    original: item.original ?? 'Unknown item',
    translated: item.translated ?? 'Translation unavailable',
    phonetic: item.phonetic ?? '',
    health: item.health ?? 'moderate',
    ingredients: item.ingredients ?? [],
    allergens: item.allergens ?? [],
    price: item.price,
    confidence: typeof item.confidence === 'number' ? item.confidence : 0.75,
  }));

  const orderingPhrases: OrderingPhrase[] = (raw.orderingPhrases ?? []).map((p) => ({
    english: p.english ?? '',
    original: p.original ?? '',
    phonetic: p.phonetic ?? '',
    context: p.context ?? 'general',
  }));

  return {
    success: true,
    detectedLanguage: raw.detectedLanguage ?? 'Unknown',
    languageCode: raw.languageCode ?? 'unknown',
    translatedItems,
    orderingPhrases,
    culturalTips: raw.culturalTips ?? [],
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.8,
  };
}

export async function translateMenu(imageUrl: string, userLanguage = 'en'): Promise<TranslationResult> {
  const { data, error } = await supabase.functions.invoke('translate-menu', {
    body: { imageUrl, userLanguage },
  });

  if (error) {
    return {
      success: false,
      detectedLanguage: 'Unknown',
      languageCode: 'unknown',
      translatedItems: [],
      orderingPhrases: [],
      culturalTips: [],
      confidence: 0,
      error: error.message,
    };
  }

  return normalizeResult((data ?? {}) as RawTranslationResponse);
}
