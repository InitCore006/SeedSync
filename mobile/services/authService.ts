import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { AuthResponse, RegisterData, LoginCredentials, UserProfile, User } from '@/types/api';
import { AxiosResponse } from 'axios';

export const authAPI = {
  // Register new user (returns user_id, phone_number, message - NOT full auth)
  register: (data: RegisterData): Promise<AxiosResponse<{ user_id: string; phone_number: string; message: string; otp_expires_at: string }>> => {
    return api.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  // Send OTP for registration (with purpose parameter)
  sendOTP: (phone_number: string, purpose: 'registration' | 'login' = 'registration'): Promise<AxiosResponse<{ message: string; phone_number: string; otp_expires_at: string }>> => {
    return api.post(ENDPOINTS.AUTH.SEND_OTP, { phone_number, purpose });
  },

  // Send OTP for login (with purpose parameter)
  sendLoginOTP: (phone_number: string): Promise<AxiosResponse<{ message: string; phone_number: string; otp_expires_at: string }>> => {
    return api.post(ENDPOINTS.AUTH.SEND_OTP, { phone_number, purpose: 'login' });
  },

  // Verify OTP (returns user and tokens)
  verifyOTP: (data: { phone_number: string; otp: string; purpose?: 'registration' | 'login' }): Promise<AxiosResponse<{ user: User; tokens: { access: string; refresh: string }; message: string }>> => {
    return api.post(ENDPOINTS.AUTH.VERIFY_OTP, { ...data, purpose: data.purpose || 'registration' });
  },

  // Login with phone and OTP
  login: (credentials: LoginCredentials): Promise<AxiosResponse<{ user: User; tokens: { access: string; refresh: string }; message: string }>> => {
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
