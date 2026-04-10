import { create } from 'zustand';

type OnboardingState = {
  currentStep: number;
  businessId: string | null;
  formData: Record<string, any>;
  isLoading: boolean;
  errors: Record<string, string>;
  setStep: (step: number) => void;
  updateFormData: (step: string, data: any) => void;
  saveProgress: () => Promise<void>;
  publish: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  businessId: null,
  formData: {},
  isLoading: false,
  errors: {},
  
  setStep: (step) => set({ currentStep: step }),
  
  updateFormData: (stepKey, data) => set((state) => ({
    formData: {
      ...state.formData,
      [stepKey]: {
        ...(state.formData[stepKey] || {}),
        ...data
      }
    }
  })),

  saveProgress: async () => {
    const { formData, businessId } = get();
    set({ isLoading: true });
    try {
      // API call to save progress
      const res = await fetch('/api/vendor/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, formData })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.businessId && !businessId) {
          set({ businessId: data.businessId });
        }
      }
    } catch (error) {
      console.error('Failed to save progress', error);
    } finally {
      set({ isLoading: false });
    }
  },

  publish: async () => {
    const { businessId } = get();
    set({ isLoading: true });
    try {
      await fetch('/api/vendor/business/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
    } catch (error) {
      console.error('Failed to publish', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
