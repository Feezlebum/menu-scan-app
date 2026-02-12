import React from 'react';
import { useRouter } from 'expo-router';
import MenuAnalysisLoading from '@/src/components/loading/MenuAnalysisLoading';
import { useScanStore } from '@/src/stores/scanStore';

export default function MenuAnalysisLoadingScreen() {
  const router = useRouter();
  const { clearScan } = useScanStore();

  const handleComplete = () => {
    // Navigate to results when analysis is complete
    router.replace('/results');
  };

  const handleRetry = () => {
    clearScan();
    router.replace('/(tabs)/scan');
  };

  const handleManual = () => {
    clearScan();
    router.replace('/manual-entry' as any);
  };

  return (
    <MenuAnalysisLoading 
      onComplete={handleComplete}
      onRetry={handleRetry}
      onManualEntry={handleManual}
      estimatedDurationMs={19000}
    />
  );
}