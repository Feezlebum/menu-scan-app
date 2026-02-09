import { create } from 'zustand';
import type { MenuItem, TopPick, ScanResult } from '@/src/lib/scanService';

interface ScanStore {
  // Current scan state
  isScanning: boolean;
  scanError: string | null;
  
  // Results
  currentResult: ScanResult | null;
  selectedItem: MenuItem | null;
  
  // Actions
  startScan: () => void;
  setScanResult: (result: ScanResult) => void;
  setScanError: (error: string) => void;
  setSelectedItem: (item: MenuItem | null) => void;
  clearScan: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  isScanning: false,
  scanError: null,
  currentResult: null,
  selectedItem: null,

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

  setSelectedItem: (item) => set({
    selectedItem: item,
  }),

  clearScan: () => set({ 
    isScanning: false, 
    scanError: null, 
    currentResult: null,
    selectedItem: null,
  }),
}));
