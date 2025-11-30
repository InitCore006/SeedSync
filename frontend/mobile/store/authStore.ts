import { create } from 'zustand';
import { router } from 'expo-router';
import { apiClient, setTokens, getTokens, removeTokens } from '@/lib/api/client';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}


export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (phoneNumber: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/users/login/', {
        phone_number: phoneNumber,
        password: password,
      });

      const { user, tokens } = response.data;

      // ✅ Store tokens correctly
      await setTokens(tokens.access, tokens.refresh);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('✅ Login successful, redirecting...');

      // Redirect based on user role
      if (user.role === 'farmer') {
        router.replace('/(farmer)');
      } 
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      console.log('📱 Loading user from storage...');
      
      // ✅ Get tokens correctly
      const { accessToken } = await getTokens();

      if (!accessToken) {
        console.log('❌ No access token found');
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      console.log('🔑 Access token found, fetching user profile...');

      // Set token in axios header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Fetch user profile
      const response = await apiClient.get('/users/profile/');
      
      console.log('✅ User profile loaded:', response.data);

      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('❌ Load user failed:', error);
      
      // If token is invalid, clear it
      await removeTokens();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      
      await removeTokens();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      console.log('✅ Logout successful');
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },

  clearError: () => set({ error: null }),
}));









