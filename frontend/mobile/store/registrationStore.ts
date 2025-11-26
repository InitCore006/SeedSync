import { create } from 'zustand';
import { farmerRegistrationService } from '@/services/api/auth.service';
import type {
  RegistrationStep1Request,
  RegistrationStep2Request,
  RegistrationStep3Request,
  VerifyPhoneRequest,
  VerifyOTPRequest,
} from '@/services/api/auth.service';

// ============================================================================
// TYPES
// ============================================================================
export interface RegistrationState {
  // Current step (0 = phone, 1 = personal, 2 = farm, 3 = bank)
  currentStep: number;
  
  // Step data
  phoneData: { phone_number: string } | null;
  step1Data: RegistrationStep1Request | null;
  step2Data: RegistrationStep2Request | null;
  step3Data: RegistrationStep3Request | null;
  
  // OTP
  simulatedOTP: string | null;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Actions
  verifyPhone: (data: VerifyPhoneRequest) => Promise<void>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<void>;
  submitStep1: (data: RegistrationStep1Request) => Promise<void>;
  submitStep2: (data: RegistrationStep2Request) => Promise<void>;
  submitStep3: (data: RegistrationStep3Request) => Promise<{ access: string; refresh: string; user: any }>;
  resetRegistration: () => Promise<void>;
  clearError: () => void;
  goToStep: (step: number) => void;
}

// ============================================================================
// STORE
// ============================================================================
export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // Initial State
  currentStep: 0,
  phoneData: null,
  step1Data: null,
  step2Data: null,
  step3Data: null,
  simulatedOTP: null,
  isLoading: false,
  error: null,

  // Verify Phone (Step 0)
  verifyPhone: async (data: VerifyPhoneRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await farmerRegistrationService.verifyPhone(data);
      
      set({
        phoneData: data,
        simulatedOTP: response.simulated_otp || null,
        currentStep: 0.5, // OTP verification step
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to send OTP. Please try again.';
      
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Verify OTP (Step 0.5)
  verifyOTP: async (data: VerifyOTPRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await farmerRegistrationService.verifyOTP(data);
      
      if (response.verified) {
        set({
          currentStep: 1,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Invalid OTP. Please try again.';
      
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Submit Step 1 (Personal Details)
  submitStep1: async (data: RegistrationStep1Request) => {
    try {
      set({ isLoading: true, error: null });
      
      await farmerRegistrationService.submitStep1(data);
      
      set({
        step1Data: data,
        currentStep: 2,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.response?.data?.first_name?.[0] ||
                          error.response?.data?.last_name?.[0] ||
                          'Failed to save personal details. Please try again.';
      
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Submit Step 2 (Farm & Location Details)
  submitStep2: async (data: RegistrationStep2Request) => {
    try {
      set({ isLoading: true, error: null });
      
      await farmerRegistrationService.submitStep2(data);
      
      set({
        step2Data: data,
        currentStep: 3,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.response?.data?.village?.[0] ||
                          error.response?.data?.district?.[0] ||
                          'Failed to save farm details. Please try again.';
      
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Submit Step 3 (Bank Details & Password) - Final Step
  submitStep3: async (data: RegistrationStep3Request) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await farmerRegistrationService.submitStep3(data);
      
      set({
        step3Data: data,
        isLoading: false,
        error: null,
      });
      
      // Return tokens for auth store
      return {
        access: response.access!,
        refresh: response.refresh!,
        user: response.user!,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.response?.data?.password?.[0] ||
                          error.response?.data?.password_confirm?.[0] ||
                          'Failed to complete registration. Please try again.';
      
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Reset Registration
  resetRegistration: async () => {
    try {
      await farmerRegistrationService.clearSession();
      
      set({
        currentStep: 0,
        phoneData: null,
        step1Data: null,
        step2Data: null,
        step3Data: null,
        simulatedOTP: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to clear registration session:', error);
      
      // Clear local state anyway
      set({
        currentStep: 0,
        phoneData: null,
        step1Data: null,
        step2Data: null,
        step3Data: null,
        simulatedOTP: null,
        isLoading: false,
        error: null,
      });
    }
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Go to Step (for navigation)
  goToStep: (step: number) => {
    set({ currentStep: step, error: null });
  },
}));
