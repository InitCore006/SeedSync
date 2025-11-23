import { apiClient } from '@lib/api/client';
import { API_ENDPOINTS } from '@lib/api/endpoints';
import {
  LoginRequest,
  LoginResponse,
  OTPVerificationRequest,
  OTPVerificationResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ChangePasswordRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
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
      // Continue with local logout even if API call fails
    }
  },

  // ============================================================================
  // OTP VERIFICATION
  // ============================================================================

  async sendOTP(data: OTPVerificationRequest): Promise<OTPVerificationResponse> {
    const response = await apiClient.post<OTPVerificationResponse>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      data
    );
    return response.data;
  },

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    );
    return response.data;
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

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ detail: string }> {
    const response = await apiClient.post<{ detail: string }>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST,
      data
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