import { create } from 'zustand';
import {
  FarmerRegistrationStep1,
  FarmerRegistrationStep2,
  FarmerRegistrationStep3,
} from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { setTokens } from '@/lib/api/client';
import { userStorage } from '@/lib/utils/storage';
import { router } from 'expo-router';

interface RegistrationState {
  // State
  currentStep: number;
  phoneNumber: string;
  phoneVerified: boolean;
  step1Data: FarmerRegistrationStep1 | null;
  step2Data: FarmerRegistrationStep2 | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  setPhoneVerified: (verified: boolean) => void;
  sendPhoneOTP: (phone: string) => Promise<void>;
  verifyPhoneOTP: (otp: string) => Promise<void>;
  submitStep1: (data: FarmerRegistrationStep1) => Promise<void>;
  submitStep2: (data: FarmerRegistrationStep2) => Promise<void>;
  submitStep3: (data: FarmerRegistrationStep3) => Promise<void>;
  loadProgress: () => Promise<void>;
  clearRegistration: () => Promise<void>;
  clearError: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // ============================================================================
  // INITIAL STATE
  // ============================================================================
  currentStep: 0,
  phoneNumber: '',
  phoneVerified: false,
  step1Data: null,
  step2Data: null,
  isLoading: false,
  error: null,

  // ============================================================================
  // SETTERS
  // ============================================================================
  setPhoneNumber: (phone: string) => {
    set({ phoneNumber: phone });
  },

  setPhoneVerified: (verified: boolean) => {
    set({ phoneVerified: verified });
  },

  clearError: () => {
    set({ error: null });
  },

  // ============================================================================
  // PHONE VERIFICATION (Using verify-phone endpoint)
  // ============================================================================
  sendPhoneOTP: async (phone: string) => {
    set({ isLoading: true, error: null });

    try {
      // Use verify-phone endpoint (checks if already registered + sends OTP)
      const response = await authService.verifyPhone({
        phone_number: phone,
      });

      set({
        phoneNumber: phone,
        isLoading: false,
      });

      console.log('✅ OTP sent successfully:', response);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        'Failed to send OTP. Please try again.';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  verifyPhoneOTP: async (otp: string) => {
    const { phoneNumber } = get();
    set({ isLoading: true, error: null });

    try {
      // Use unified verify-otp with purpose: REGISTRATION
      const response = await authService.verifyOTP({
        phone_number: phoneNumber,
        otp,
        purpose: 'REGISTRATION',
      });

      if (response.verified) {
        set({
          phoneVerified: true,
          currentStep: 1,
          isLoading: false,
        });

        router.push('/(auth)/registration/step1-personal');
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        'Invalid OTP. Please try again.';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // ============================================================================
  // REGISTRATION STEPS
  // ============================================================================
  submitStep1: async (data: FarmerRegistrationStep1) => {
    set({ isLoading: true, error: null });

    try {
      await authService.farmerRegistrationStep1(data);

      set({
        step1Data: data,
        currentStep: 2,
        isLoading: false,
      });

      router.push('/(auth)/registration/step2-location');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        'Failed to save personal details. Please try again.';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  submitStep2: async (data: FarmerRegistrationStep2) => {
    set({ isLoading: true, error: null });

    try {
      await authService.farmerRegistrationStep2(data);

      set({
        step2Data: data,
        currentStep: 3,
        isLoading: false,
      });

      router.push('/(auth)/registration/step3-banking');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        'Failed to save farm details. Please try again.';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  submitStep3: async (data: FarmerRegistrationStep3) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.farmerRegistrationStep3(data);

      // Save tokens
      await setTokens(response.tokens.access, response.tokens.refresh);

      // Save user data
      await userStorage.saveUser(response.user);

      // Clear registration data
      set({
        currentStep: 0,
        phoneNumber: '',
        phoneVerified: false,
        step1Data: null,
        step2Data: null,
        isLoading: false,
      });

      router.replace('/(auth)/registration/success');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        'Registration failed. Please try again.';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // ============================================================================
  // LOAD PROGRESS
  // ============================================================================
  loadProgress: async () => {
    set({ isLoading: true });

    try {
      const progress = await authService.getRegistrationProgress();

      set({
        phoneVerified: progress.phone_verified,
        step1Data: progress.step1_data,
        step2Data: progress.step2_data,
        currentStep: progress.current_step,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load registration progress:', error);
      set({ isLoading: false });
    }
  },

  // ============================================================================
  // CLEAR REGISTRATION
  // ============================================================================
  clearRegistration: async () => {
    set({ isLoading: true });

    try {
      await authService.clearRegistrationSession();

      set({
        currentStep: 0,
        phoneNumber: '',
        phoneVerified: false,
        step1Data: null,
        step2Data: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to clear registration:', error);
      set({ isLoading: false });
    }
  },
}));