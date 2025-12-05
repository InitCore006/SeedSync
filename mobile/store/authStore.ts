import { create } from 'zustand';
import { User } from '@/types/api';
import { storage } from '@/utils/storage';
import { router } from 'expo-router';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => set({ token }),

  login: async (user, token, refreshToken) => {
    await storage.setAuthToken(token);
    await storage.setRefreshToken(refreshToken);
    await storage.setUserData(user);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await storage.clearAll();
    set({ user: null, token: null, isAuthenticated: false });
    router.replace('/(auth)/login');
  },

  loadStoredAuth: async () => {
    try {
      const [token, userData] = await Promise.all([
        storage.getAuthToken(),
        storage.getUserData(),
      ]);

      if (token && userData) {
        set({ user: userData, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      set({ isLoading: false });
    }
  },
}));
