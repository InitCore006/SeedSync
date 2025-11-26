import { create } from 'zustand';

interface RegistrationState {
  // Current step (1-3)
  currentStep: number;

  // Step data
  step1Data: any;
  step2Data: any;
  step3Data: any;

  // Phone verification
  phoneNumber: string;
  phoneVerified: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  saveStepData: (step: number, data: any) => void;
  setPhoneNumber: (phone: string) => void;
  setPhoneVerified: (verified: boolean) => void;
  reset: () => void;
  getAllData: () => any;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // ============================================================================
  // INITIAL STATE
  // ============================================================================
  currentStep: 1,
  step1Data: null,
  step2Data: null,
  step3Data: null,
  phoneNumber: '',
  phoneVerified: false,

  // ============================================================================
  // STEP NAVIGATION
  // ============================================================================
  setStep: (step: number) => {
    if (step >= 1 && step <= 3) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const currentStep = get().currentStep;
    if (currentStep < 3) {
      set({ currentStep: currentStep + 1 });
    }
  },

  previousStep: () => {
    const currentStep = get().currentStep;
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  // ============================================================================
  // SAVE STEP DATA
  // ============================================================================
  saveStepData: (step: number, data: any) => {
    set({ [`step${step}Data`]: data });
  },

  // ============================================================================
  // PHONE VERIFICATION
  // ============================================================================
  setPhoneNumber: (phone: string) => {
    set({ phoneNumber: phone });
  },

  setPhoneVerified: (verified: boolean) => {
    set({ phoneVerified: verified });
  },

  // ============================================================================
  // GET ALL DATA
  // ============================================================================
  getAllData: () => {
    const { step1Data, step2Data, step3Data } = get();
    return {
      ...step1Data,
      ...step2Data,
      ...step3Data,
    };
  },

  // ============================================================================
  // RESET
  // ============================================================================
  reset: () => {
    set({
      currentStep: 1,
      step1Data: null,
      step2Data: null,
      step3Data: null,
      phoneNumber: '',
      phoneVerified: false,
    });
  },
}));