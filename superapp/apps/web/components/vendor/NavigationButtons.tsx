"use client";

import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'next/navigation';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
}

export default function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  isValid 
}: NavigationButtonsProps) {
  const router = useRouter();
  const { setStep, saveProgress, publish, isLoading } = useOnboardingStore();

  const handleNext = async () => {
    if (!isValid) return;
    
    await saveProgress();
    
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setStep(nextStep);
      router.push(`/onboarding/${nextStep}`);
    } else {
      await publish();
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setStep(prevStep);
      router.push(`/onboarding/${prevStep}`);
    }
  };

  return (
    <div className="flex justify-between items-center w-full max-w-3xl border-t border-gray-200 py-4 mt-6">
      <button
        onClick={handleBack}
        disabled={currentStep === 1 || isLoading}
        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white font-medium disabled:opacity-50"
      >
        Back
      </button>
      
      <button
        onClick={handleNext}
        disabled={!isValid || isLoading}
        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50 flex items-center"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : null}
        {currentStep === totalSteps ? 'Publish Business' : 'Continue'}
      </button>
    </div>
  );
}
