import { create } from 'zustand';
import { User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { setTokens, clearTokens } from '@/lib/api/client';
import { userStorage } from '@/lib/utils/storage';
import { router } from 'expo-router';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ============================================================================
  // INITIAL STATE
  // ============================================================================
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ============================================================================
  // LOGIN
  // ============================================================================
  login: async (phoneNumber: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({
        phone_number: phoneNumber,  // Send phone_number, not username
        password,
      });

      // Check if farmer account
      if (response.user.role !== 'FARMER') {
        set({
          isLoading: false,
          error: 'This app is only for farmers. Please use the web platform.',
        });
        return;
      }

      // Save tokens (response has access/refresh directly, not nested)
      await setTokens(response.access, response.refresh);

      // Save user data
      await userStorage.saveUser(response.user);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Navigate to dashboard
      router.replace('/(farmer)');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
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
  // ============================================================================
  // LOGOUT
  // ============================================================================
  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await clearTokens();
      await userStorage.clearUser();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      router.replace('/(auth)/welcome');
    }
  },

  // ============================================================================
  // LOAD USER (On App Start)
  // ============================================================================
  loadUser: async () => {
    set({ isLoading: true });

    try {
      const storedUser = await userStorage.getUser();

      if (storedUser) {
        // Verify with backend
        const user = await authService.getProfile();

        // Update stored user if different
        if (JSON.stringify(user) !== JSON.stringify(storedUser)) {
          await userStorage.saveUser(user);
        }

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Load user error:', error);

      await clearTokens();
      await userStorage.clearUser();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // ============================================================================
  // UPDATE USER
  // ============================================================================
  updateUser: (updatedUser: Partial<User>) => {
    const currentUser = get().user;

    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      userStorage.saveUser(newUser);
      set({ user: newUser });
    }
  },

  // ============================================================================
  // CLEAR ERROR
  // ============================================================================
  clearError: () => {
    set({ error: null });
  },
}));