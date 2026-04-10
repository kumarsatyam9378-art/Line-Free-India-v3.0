"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center min-w-max px-4">
        {steps.map((step, index) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 z-10 bg-white",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isActive ? "border-primary text-primary" : 
                    "border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step}
                </div>
              </div>
              
              {index < totalSteps - 1 && (
                <div 
                  className={cn(
                    "h-1 w-12 flex-1 mx-2",
                    step < currentStep ? "bg-primary" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
