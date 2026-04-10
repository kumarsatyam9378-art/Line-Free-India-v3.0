"use client";

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import NavigationButtons from '@/components/vendor/NavigationButtons';
import { z } from 'zod';

export default function OnboardingStep({ params }: { params: { step: string } }) {
  const stepNumber = parseInt(params.step, 10) || 1;
  const { currentStep, setStep, updateFormData, formData, saveProgress } = useOnboardingStore();
  const [isValid, setIsValid] = useState(false);

  // Sync route param with store
  useEffect(() => {
    if (currentStep !== stepNumber) {
      setStep(stepNumber);
    }
  }, [stepNumber, currentStep, setStep]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  // Dummy validation for step changes
  useEffect(() => {
    // Ideally this evaluates a Zod schema based on the current step
    setIsValid(true); 
  }, [formData, stepNumber]);

  return (
    <div className="flex-1 flex flex-col pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {stepNumber === 1 && "Basic Information"}
        {stepNumber === 2 && "Select Category"}
        {stepNumber > 2 && `Step ${stepNumber} Setup`}
      </h2>
      
      <div className="flex-1">
        {stepNumber === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                placeholder="E.g., Sharma Sweets"
                value={formData.basic?.name || ''}
                onChange={(e) => updateFormData('basic', { name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                placeholder="New Delhi"
                value={formData.basic?.city || ''}
                onChange={(e) => updateFormData('basic', { city: e.target.value })}
              />
            </div>
          </div>
        )}

        {stepNumber === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Food & Restaurant', 'Healthcare', 'Beauty & Wellness', 'Education', 'Retail'].map(cat => (
              <div 
                key={cat}
                onClick={() => updateFormData('category', { selected: cat })}
                className={`p-4 border rounded-xl cursor-pointer text-center hover:bg-blue-50 transition-colors ${formData.category?.selected === cat ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3"></div>
                <span className="text-sm font-medium text-gray-800">{cat}</span>
              </div>
            ))}
          </div>
        )}
        
        {stepNumber > 2 && (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
            <p className="text-gray-500 mb-2">Form fields for Step {stepNumber} will go here.</p>
            <p className="text-xs text-gray-400">Add the required schemas and inputs</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6">
        <NavigationButtons 
          currentStep={stepNumber} 
          totalSteps={10} 
          isValid={isValid} 
        />
      </div>
    </div>
  );
}
