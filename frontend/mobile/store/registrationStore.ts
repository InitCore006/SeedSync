import { create } from 'zustand';
import { FarmerRegistrationRequest } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { setTokens } from '@/lib/api/client';
import { userStorage } from '@/lib/utils/storage';
import { router } from 'expo-router';

interface RegistrationState {
  // State
  currentStep: number;
  phoneNumber: string;
  phoneVerified: boolean;
  
  // Form Data (split across steps)
  personalInfo: {
    fullName: string;
    email: string;
    password: string;
    dateOfBirth: string | null;
    gender: 'M' | 'F' | 'O';
    preferredLanguage: string;
    educationLevel: string;
  };
  
  addressInfo: {
    addressLine1: string;
    addressLine2: string;
    village: string;
    block: string;
    district: string;
    state: string;
    pincode: string;
  };
  
  farmInfo: {
    totalLandArea: string;
    irrigatedLand: string;
    rainFedLand: string;
    farmerCategory: 'marginal' | 'small' | 'semi_medium' | 'medium' | 'large';
    casteCategory: 'general' | 'obc' | 'sc' | 'st';
    isFPOMember: boolean;
    primaryFPO: string;
  };
  
  bankInfo: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  
  govtSchemes: {
    hasKCC: boolean;
    kccNumber: string;
    hasPMFBY: boolean;
    pmfbyPolicy: string;
  };
  
  isLoading: boolean;
  error: string | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  
  // Step Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Form Updates
  updatePersonalInfo: (data: Partial<RegistrationState['personalInfo']>) => void;
  updateAddressInfo: (data: Partial<RegistrationState['addressInfo']>) => void;
  updateFarmInfo: (data: Partial<RegistrationState['farmInfo']>) => void;
  updateBankInfo: (data: Partial<RegistrationState['bankInfo']>) => void;
  updateGovtSchemes: (data: Partial<RegistrationState['govtSchemes']>) => void;
  
  // Registration
  registerFarmer: () => Promise<void>;
  clearError: () => void;
  resetRegistration: () => void;
}

const initialPersonalInfo = {
  fullName: '',
  email: '',
  password: '',
  dateOfBirth: null,
  gender: 'M' as const,
  preferredLanguage: 'en',
  educationLevel: '',
};

const initialAddressInfo = {
  addressLine1: '',
  addressLine2: '',
  village: '',
  block: '',
  district: '',
  state: '',
  pincode: '',
};

const initialFarmInfo = {
  totalLandArea: '',
  irrigatedLand: '0',
  rainFedLand: '0',
  farmerCategory: 'marginal' as const,
  casteCategory: 'general' as const,
  isFPOMember: false,
  primaryFPO: '',
};

const initialBankInfo = {
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
};

const initialGovtSchemes = {
  hasKCC: false,
  kccNumber: '',
  hasPMFBY: false,
  pmfbyPolicy: '',
};

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // Initial State
  currentStep: 1,
  phoneNumber: '',
  phoneVerified: false,
  personalInfo: initialPersonalInfo,
  addressInfo: initialAddressInfo,
  farmInfo: initialFarmInfo,
  bankInfo: initialBankInfo,
  govtSchemes: initialGovtSchemes,
  isLoading: false,
  error: null,

  // Basic Actions
  setPhoneNumber: (phone: string) => set({ phoneNumber: phone }),
  clearError: () => set({ error: null }),
  
  resetRegistration: () => set({
    currentStep: 1,
    phoneNumber: '',
    phoneVerified: false,
    personalInfo: initialPersonalInfo,
    addressInfo: initialAddressInfo,
    farmInfo: initialFarmInfo,
    bankInfo: initialBankInfo,
    govtSchemes: initialGovtSchemes,
    error: null,
  }),

  // Step Navigation
  setCurrentStep: (step: number) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  previousStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  // Form Updates
  updatePersonalInfo: (data) => set((state) => ({
    personalInfo: { ...state.personalInfo, ...data }
  })),
  
  updateAddressInfo: (data) => set((state) => ({
    addressInfo: { ...state.addressInfo, ...data }
  })),
  
  updateFarmInfo: (data) => set((state) => ({
    farmInfo: { ...state.farmInfo, ...data }
  })),
  
  updateBankInfo: (data) => set((state) => ({
    bankInfo: { ...state.bankInfo, ...data }
  })),
  
  updateGovtSchemes: (data) => set((state) => ({
    govtSchemes: { ...state.govtSchemes, ...data }
  })),

  // Phone Verification
  sendOTP: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.sendOTP({ phone_number: phone });
      set({ phoneNumber: phone, isLoading: false });
      console.log('✅ OTP sent:', response.message);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send OTP';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  verifyOTP: async (otp: string) => {
    const { phoneNumber } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await authService.verifyRegistrationOTP({ phone_number: phoneNumber, otp });
      if (response.verified) {
        set({ phoneVerified: true, isLoading: false, currentStep: 1 });
        router.push('/(auth)/registration/step1-personal');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Invalid OTP';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Final Registration
  registerFarmer: async () => {
    const { phoneNumber, personalInfo, addressInfo, farmInfo, bankInfo, govtSchemes } = get();
    set({ isLoading: true, error: null });

    const registrationData: FarmerRegistrationRequest = {
      // User fields
      phone_number: phoneNumber,
      password: personalInfo.password,
      password_confirm: personalInfo.password,
      full_name: personalInfo.fullName.trim(),
      email: personalInfo.email.trim() || undefined,
      preferred_language: personalInfo.preferredLanguage,

      // Profile fields
      date_of_birth: personalInfo.dateOfBirth || undefined,
      gender: personalInfo.gender,
      address_line1: addressInfo.addressLine1.trim(),
      address_line2: addressInfo.addressLine2.trim(),
      village: addressInfo.village.trim(),
      block: addressInfo.block.trim(),
      district: addressInfo.district.trim(),
      state: addressInfo.state,
      pincode: addressInfo.pincode.trim(),

      // Bank details
      bank_name: bankInfo.bankName.trim() || undefined,
      account_number: bankInfo.accountNumber.trim() || undefined,
      ifsc_code: bankInfo.ifscCode.trim().toUpperCase() || undefined,
      account_holder_name: bankInfo.accountHolderName.trim() || undefined,
      education_level: personalInfo.educationLevel || undefined,

      // Farmer fields
      total_land_area: parseFloat(farmInfo.totalLandArea),
      irrigated_land: parseFloat(farmInfo.irrigatedLand) || 0,
      rain_fed_land: parseFloat(farmInfo.rainFedLand) || 0,
      farmer_category: farmInfo.farmerCategory,
      caste_category: farmInfo.casteCategory,

      // FPO membership
      is_fpo_member: farmInfo.isFPOMember,
      primary_fpo: farmInfo.isFPOMember && farmInfo.primaryFPO ? farmInfo.primaryFPO : undefined,

      // Government schemes
      has_kisan_credit_card: govtSchemes.hasKCC,
      kcc_number: govtSchemes.hasKCC ? govtSchemes.kccNumber.trim() : undefined,
      has_pmfby_insurance: govtSchemes.hasPMFBY,
      pmfby_policy_number: govtSchemes.hasPMFBY ? govtSchemes.pmfbyPolicy.trim() : undefined,
      has_pm_kisan: false,
    };

    try {
      const response = await authService.registerFarmer(registrationData);
      await setTokens(response.tokens.access, response.tokens.refresh);
      await userStorage.saveUser(response.user);
      
      set({ isLoading: false });
      router.replace('/(auth)/registration/success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Registration failed';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },
}));