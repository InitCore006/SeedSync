/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from './axios'
import type {
  LoginCredentials,
  LoginResponse,
  User,
  OTPRequest,
  OTPVerification,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
} from '@/types/auth'

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post('/api/users/auth/login/', credentials)
    return data
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<{
    data: { access: string };
    access: string;
  }> => {
    const { data } = await axiosInstance.post('/api/users/auth/token/refresh/', {
      refresh: refreshToken,
    })
    return data
  },


  // Get Current User Profile
  getCurrentUser: async (): Promise<User> => {
    const { data } = await axiosInstance.get('/api/users/profile/')
    return data
  },

  // Update User Profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const { data } = await axiosInstance.patch('/api/users/profile/', profileData)
    return data
  },

  // Change Password
  changePassword: async (passwords: PasswordChangeRequest): Promise<void> => {
    await axiosInstance.post('/api/users/auth/password/change/', passwords)
  },

  // Request Password Reset
  requestPasswordReset: async (request: PasswordResetRequest): Promise<void> => {
    await axiosInstance.post('/api/users/auth/password/reset/', request)
  },

  // Confirm Password Reset
  confirmPasswordReset: async (data: PasswordResetConfirm): Promise<void> => {
    await axiosInstance.post('/api/users/auth/password/reset/confirm/', data)
  },

  // Send OTP
  sendOTP: async (otpRequest: OTPRequest): Promise<void> => {
    await axiosInstance.post('/api/users/otp/send/', otpRequest)
  },

  // Verify OTP
  verifyOTP: async (verification: OTPVerification): Promise<void> => {
    await axiosInstance.post('/api/users/otp/verify/', verification)
  },

  // Get Dashboard Stats
  getDashboardStats: async (): Promise<any> => {
    const { data } = await axiosInstance.get('/api/users/dashboard/stats/')
    return data
  },
}

// ============================================================================
// FPO REGISTRATION API
// ============================================================================

export const fpoRegistrationAPI = {
  // Step 1: Organization Details
  submitStep1: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/fpo-registration/step1/', formData)
    return data
  },

  // Step 2: Location & Coverage
  submitStep2: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/fpo-registration/step2/', formData)
    return data
  },

  // Step 3: Infrastructure
  submitStep3: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/fpo-registration/step3/', formData)
    return data
  },

  // Step 4: Verification & Banking (Final)
  submitStep4: async (formData: FormData): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/fpo-registration/step4/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}

// ============================================================================
// PROCESSOR REGISTRATION API
// ============================================================================

export const processorRegistrationAPI = {
  submitStep1: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/processor-registration/step1/', formData)
    return data
  },

  submitStep2: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/processor-registration/step2/', formData)
    return data
  },

  submitStep3: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/processor-registration/step3/', formData)
    return data
  },

  submitStep4: async (formData: FormData): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/processor-registration/step4/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  submitStep5: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/processor-registration/step5/', formData)
    return data
  },
}

// ============================================================================
// RETAILER REGISTRATION API
// ============================================================================

export const retailerRegistrationAPI = {
  submitStep1: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/retailer-registration/step1/', formData)
    return data
  },

  submitStep2: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/retailer-registration/step2/', formData)
    return data
  },

  submitStep3: async (formData: FormData): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/retailer-registration/step3/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}

// ============================================================================
// LOGISTICS REGISTRATION API
// ============================================================================

export const logisticsRegistrationAPI = {
  submitStep1: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/logistics-registration/step1/', formData)
    return data
  },

  submitStep2: async (formData: any): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/logistics-registration/step2/', formData)
    return data
  },

  submitStep3: async (formData: FormData): Promise<any> => {
    const { data } = await axiosInstance.post('/api/users/logistics-registration/step3/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}

// ============================================================================
// GOVERNMENT API
// ============================================================================

export const governmentAPI = {
  // Get Pending Approvals
  getPendingApprovals: async (): Promise<any> => {
    const { data } = await axiosInstance.get('/api/users/government/approvals/pending/')
    return data
  },

  // Approve User
  approveUser: async (userId: string): Promise<any> => {
    const { data } = await axiosInstance.post(`/api/users/government/approvals/${userId}/approve/`)
    return data
  },

  // Reject User
  rejectUser: async (userId: string, reason: string): Promise<any> => {
    const { data } = await axiosInstance.post(`/api/users/government/approvals/${userId}/reject/`, {
      action: 'REJECT',
      rejection_reason: reason,
    })
    return data
  },
}