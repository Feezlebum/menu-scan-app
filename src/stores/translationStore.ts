import { create } from 'zustand';
import type { TranslationResult } from '@/src/lib/translationService';

interface TranslationStore {
  isTranslating: boolean;
  translationError: string | null;
  currentTranslation: TranslationResult | null;
  setTranslating: () => void;
  setTranslationResult: (result: TranslationResult) => void;
  setTranslationError: (message: string) => void;
  clearTranslation: () => void;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  isTranslating: false,
  translationError: null,
  currentTranslation: null,

  setTranslating: () => set({ isTranslating: true, translationError: null }),
  setTranslationResult: (result) => set({ isTranslating: false, translationError: null, currentTranslation: result }),
  setTranslationError: (message) => set({ isTranslating: false, translationError: message }),
  clearTranslation: () => set({ isTranslating: false, translationError: null, currentTranslation: null }),
}));
