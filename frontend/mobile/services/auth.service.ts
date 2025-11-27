import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  LoginRequest,
  LoginResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  VerifyPhoneOTPRequest,
  VerifyPhoneOTPResponse,
  ChangePasswordRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  FarmerRegistrationStep1,
  FarmerRegistrationStep2,
  FarmerRegistrationStep3,
  RegistrationProgressResponse,
  User,
} from '@/types/auth.types';

export const authService = {
  // ============================================================================
  // LOGIN & LOGOUT
  // ============================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // ============================================================================
  // UNIFIED OTP SYSTEM
  // ============================================================================

  /**
   * Send OTP for any purpose (Registration, Login, Password Reset, Phone Verification)
   */
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      data
    );
    return response.data;
  },

  /**
   * Verify OTP for any purpose
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    );
    return response.data;
  },

  // ============================================================================
  // PHONE VERIFICATION (Registration Flow)
  // ============================================================================

  /**
   * Verify phone number for registration (checks if already registered)
   * Sends OTP if phone is available
   */
  async verifyPhone(data: VerifyPhoneRequest): Promise<VerifyPhoneResponse> {
    const response = await apiClient.post<VerifyPhoneResponse>(
      API_ENDPOINTS.AUTH.VERIFY_PHONE,
      data
    );
    return response.data;
  },

  /**
   * Verify OTP for phone verification during registration
   * Alternative: Use unified verifyOTP with purpose: 'REGISTRATION'
   */
  async verifyPhoneOTP(data: VerifyPhoneOTPRequest): Promise<VerifyPhoneOTPResponse> {
    // Use unified OTP verification
    const response = await apiClient.post<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      {
        phone_number: data.phone_number,
        otp: data.otp,
        purpose: 'REGISTRATION',
      }
    );
    return {
      detail: response.data.detail,
      verified: response.data.verified,
      phone_number: response.data.phone_number,
      next_step: response.data.next_step || '/registration/step1',
      message: response.data.message || 'Phone verified successfully',
    };
  },

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  async changePassword(data: ChangePasswordRequest): Promise<{ detail: string }> {
    const response = await apiClient.post<{ detail: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  async requestPasswordReset(data: PasswordResetRequest): Promise<SendOTPResponse> {
    // Use unified send OTP
    const response = await apiClient.post<SendOTPResponse>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      {
        phone_number: data.phone_number,
        purpose: 'PASSWORD_RESET',
      }
    );
    return response.data;
  },

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ detail: string }> {
    const response = await apiClient.post<{ detail: string }>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM,
      data
    );
    return response.data;
  },

  // ============================================================================
  // FARMER REGISTRATION STEPS
  // ============================================================================

  async farmerRegistrationStep1(data: FarmerRegistrationStep1): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER_REGISTRATION.STEP1,
      data
    );
    return response.data;
  },

  async farmerRegistrationStep2(data: FarmerRegistrationStep2): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER_REGISTRATION.STEP2,
      data
    );
    return response.data;
  },

  async farmerRegistrationStep3(data: FarmerRegistrationStep3): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.FARMER_REGISTRATION.STEP3,
      data
    );
    return response.data;
  },

  async getRegistrationProgress(): Promise<RegistrationProgressResponse> {
    const response = await apiClient.get<RegistrationProgressResponse>(
      API_ENDPOINTS.FARMER_REGISTRATION.PROGRESS
    );
    return response.data;
  },

  async clearRegistrationSession(): Promise<{ detail: string }> {
    const response = await apiClient.post<{ detail: string }>(
      API_ENDPOINTS.FARMER_REGISTRATION.CLEAR_SESSION
    );
    return response.data;
  },

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.USER.DASHBOARD_STATS);
    return response.data;
  },
};