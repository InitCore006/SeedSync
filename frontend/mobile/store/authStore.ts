import { create } from 'zustand';
import { User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { setTokens, clearTokens } from '@lib/api/client';
import { userStorage } from '@lib/utils/storage';

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
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ username, password });

      // Save tokens
      await setTokens(response.access, response.refresh);

      // Save user data
      await userStorage.saveUser(response.user);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
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
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear tokens and user data
      await clearTokens();
      await userStorage.clearUser();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // ============================================================================
  // LOAD USER (On App Start)
  // ============================================================================
  loadUser: async () => {
    set({ isLoading: true });

    try {
      // Try to get user from storage
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

      // Clear invalid session
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

      // Update storage
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