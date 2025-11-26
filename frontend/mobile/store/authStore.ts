import { create } from 'zustand';
import { authService, tokenManager } from '@/services/api/auth.service';
import type { LoginRequest, LoginResponse } from '@/services/api/auth.service';

export interface AuthState {
  // State
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: LoginResponse['user']) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authService.login(credentials);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Login failed. Please check your credentials.';
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true });
      
      await authService.logout();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear local state even if API call fails
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Load user from storage on app start
  loadUser: async () => {
    try {
      set({ isLoading: true });
      
      const user = await tokenManager.getUser();
      const accessToken = await tokenManager.getAccessToken();
      
      if (user && accessToken) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Load user error:', error);
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set user (for registration flow)
  setUser: (user: LoginResponse['user']) => {
    set({
      user,
      isAuthenticated: true,
      error: null,
    });
  },
}));