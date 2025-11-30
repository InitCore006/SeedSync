import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  LoginRequest,
  LoginResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  FarmerRegistrationRequest,
  FarmerRegistrationResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordResetResponse,
  ChangePasswordRequest,
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
  // PHONE VERIFICATION (Registration Flow)
  // ============================================================================

  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      data
    );
    return response.data;
  },

  async verifyRegistrationOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_REGISTRATION_OTP,
      data
    );
    return response.data;
  },

  // ============================================================================
  // FARMER REGISTRATION (Single Step)
  // ============================================================================

  async registerFarmer(data: FarmerRegistrationRequest): Promise<FarmerRegistrationResponse> {
    const response = await apiClient.post<FarmerRegistrationResponse>(
      API_ENDPOINTS.FARMER.REGISTER,
      data
    );
    return response.data;
  },

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  async changePassword(data: ChangePasswordRequest): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  async requestPasswordReset(data: PasswordResetRequest): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST,
      data
    );
    return response.data;
  },

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>(
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
};