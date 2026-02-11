import React from 'react';
import { useRouter } from 'expo-router';
import MenuAnalysisLoading from '@/src/components/loading/MenuAnalysisLoading';

export default function MenuAnalysisLoadingScreen() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate to results when analysis is complete
    router.replace('/results');
  };

  return (
    <MenuAnalysisLoading 
      onComplete={handleComplete}
      estimatedDurationMs={19000}
    />
  );
}