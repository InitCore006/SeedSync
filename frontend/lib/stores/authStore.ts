import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';
import { ENV } from '@/lib/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (user, token, refreshToken) => {
        // Store in localStorage for API client
        if (typeof window !== 'undefined') {
          localStorage.setItem(ENV.TOKEN_KEY, token);
          localStorage.setItem(ENV.REFRESH_TOKEN_KEY, refreshToken);
          localStorage.setItem(ENV.USER_KEY, JSON.stringify(user));
        }
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },
      
      clearAuth: () => {
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ENV.TOKEN_KEY);
          localStorage.removeItem(ENV.REFRESH_TOKEN_KEY);
          localStorage.removeItem(ENV.USER_KEY);
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
