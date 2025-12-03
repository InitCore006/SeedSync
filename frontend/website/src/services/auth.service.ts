import api from './api';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>> => {
    try {
      const response = await api.post('/users/register/', data);
      
      // Store tokens
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
      }
      
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 
               error.response?.data?.error || 
               'Registration failed' 
      };
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>> => {
    try {
      const response = await api.post('/users/login/', credentials);
      
      // Store tokens
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
      }
      
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 
               error.response?.data?.error || 
               'Login failed' 
      };
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/users/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/users/me/');
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.patch('/users/me/', data);
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 'Update failed' 
      };
    }
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword,
      });
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 'Password change failed' 
      };
    }
  },

  // Verify phone OTP
  verifyPhone: async (otp: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/users/verify-otp/', { otp });
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 'Verification failed' 
      };
    }
  },

  // Resend OTP
  resendOTP: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post('/users/resend-otp/');
      return { data: response.data };
    } catch (error: any) {
      return { 
        error: error.response?.data?.message || 'Failed to resend OTP' 
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  // Get current user from storage
  getCurrentUser: (): User | null => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.user || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  // Refresh access token
  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await api.post('/users/token/refresh/', {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  },
};