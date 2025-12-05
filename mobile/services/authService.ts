import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { AuthResponse, RegisterData, LoginCredentials, UserProfile } from '@/types/api';
import { AxiosResponse } from 'axios';

export const authAPI = {
  // Register new user
  register: (data: RegisterData): Promise<AxiosResponse<AuthResponse>> => {
    return api.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  // Send OTP for registration
  sendOTP: (phone_number: string): Promise<AxiosResponse<{ message: string }>> => {
    return api.post(ENDPOINTS.AUTH.SEND_OTP, { phone_number });
  },

  // Send OTP for login
  sendLoginOTP: (phone_number: string): Promise<AxiosResponse<{ message: string }>> => {
    return api.post(ENDPOINTS.AUTH.SEND_LOGIN_OTP, { phone_number });
  },

  // Verify OTP
  verifyOTP: (data: { phone_number: string; otp: string }): Promise<AxiosResponse<{ message: string }>> => {
    return api.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
  },

  // Login with phone and OTP
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => {
    return api.post(ENDPOINTS.AUTH.LOGIN, credentials);
  },

  // Get user profile
  getProfile: (): Promise<AxiosResponse<UserProfile>> => {
    return api.get(ENDPOINTS.AUTH.PROFILE);
  },

  // Update user profile
  updateProfile: (data: Partial<UserProfile>): Promise<AxiosResponse<UserProfile>> => {
    return api.patch(ENDPOINTS.AUTH.PROFILE, data);
  },
};
