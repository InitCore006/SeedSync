import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  FarmerRegistrationRequest,
  FarmerRegistrationResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResetResponse,
  User,
  UserWithProfile,
  UpdateUserRequest,
  UpdateProfileRequest,
} from '@/types/auth.types';

export const authService = {
  // ============================================================================
  // AUTHENTICATION
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

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  // ============================================================================
  // OTP VERIFICATION
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
  // FARMER REGISTRATION (Complete)
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

  async forgotPassword(data: ForgotPasswordRequest): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  async getProfile(): Promise<UserWithProfile> {
    const response = await apiClient.get<UserWithProfile>(API_ENDPOINTS.USER.ME);
    return response.data;
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<User>(
      API_ENDPOINTS.USER.UPDATE,
      data
    );
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserWithProfile> {
    const response = await apiClient.patch<UserWithProfile>(
      API_ENDPOINTS.USER.PROFILE,
      { profile: data }
    );
    return response.data;
  },
};