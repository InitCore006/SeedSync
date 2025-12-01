import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('access_token'),
      isAuthenticated: !!localStorage.getItem('access_token'),
      isLoading: false,

      // Set both user and token (used after login/register)
      setAuth: (user: User, token: string) => {
        localStorage.setItem('access_token', token);
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },

      // Set user only (used when updating profile)
      setUser: (user: User | null) => {
        set({ user });
      },

      // Load user profile from backend
      loadUser: async () => {
        const { token } = get();
        
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        
        try {
          const response = await authService.getProfile();
          
          if (response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            // Token invalid or expired
            get().clearAuth();
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout user
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      // Clear all auth data
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);