import { create } from 'zustand';
import type { MenuItem, TopPick, ScanResult } from '@/src/lib/scanService';

interface ScanStore {
  // Current scan state
  isScanning: boolean;
  scanError: string | null;
  
  // Results
  currentResult: ScanResult | null;
  
  // Actions
  startScan: () => void;
  setScanResult: (result: ScanResult) => void;
  setScanError: (error: string) => void;
  clearScan: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  isScanning: false,
  scanError: null,
  currentResult: null,

  startScan: () => set({ 
    isScanning: true, 
    scanError: null,
    currentResult: null,
  }),

  setScanResult: (result) => set({ 
    isScanning: false, 
    currentResult: result,
    scanError: null,
  }),

  setScanError: (error) => set({ 
    isScanning: false, 
    scanError: error,
  }),

  clearScan: () => set({ 
    isScanning: false, 
    scanError: null, 
    currentResult: null,
  }),
}));
