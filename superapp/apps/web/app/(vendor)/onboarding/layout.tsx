"use client";

import { useOnboardingStore } from '@/store/onboardingStore';
import StepProgressBar from '@/components/vendor/StepProgressBar';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentStep } = useOnboardingStore();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Panel: Form */}
      <div className="w-full md:w-5/12 bg-white flex flex-col items-center border-r border-gray-200">
        <div className="w-full px-6 py-4 shadow-sm border-b border-gray-100 z-10 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Setup your store</h2>
          <StepProgressBar currentStep={currentStep} totalSteps={10} />
        </div>
        
        <div className="flex-1 w-full p-6 sm:p-8 overflow-y-auto w-full max-w-3xl flex flex-col relative">
          {children}
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="w-full md:w-7/12 flex flex-col bg-gray-100 items-center justify-center p-4">
        {/* Simulate a mobile device preview */}
        <div className="hidden md:flex flex-col w-[375px] h-[812px] border-[14px] border-black rounded-[40px] shadow-2xl relative bg-white overflow-hidden">
          <div className="w-1/2 h-[30px] bg-black absolute top-0 left-1/4 rounded-b-3xl"></div>
          
          {/* Default Preview Content based on store state */}
          <div className="w-full h-full pt-10 px-4 pb-4 overflow-y-auto">
             <div className="text-center text-gray-400 italic mt-20">Live Preview</div>
             <div className="animate-pulse flex space-x-4 mt-8">
               <div className="flex-1 space-y-6 py-1">
                 <div className="h-2 bg-slate-200 rounded"></div>
                 <div className="space-y-3">
                   <div className="grid grid-cols-3 gap-4">
                     <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                     <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                   </div>
                   <div className="h-2 bg-slate-200 rounded"></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
