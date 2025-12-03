import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { setTokens, removeTokens } from '@/lib/api/client';
import { authService } from '@/services/auth.service';
import { User, UserWithProfile } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  profile: UserWithProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phoneNumber: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({
            phone_number: phoneNumber,
            password: password,
          });

          await setTokens(response.tokens.access, response.tokens.refresh);

          const profile = await authService.getProfile();

          set({
            user: response.user,
            profile: profile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('✅ Login successful');

          if (response.user.role === 'farmer') {
            router.replace('/(farmer)');
          } else {
            router.replace('/(auth)/login');
          }
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.detail ||
                              'Login failed. Please check your credentials.';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      loadUser: async () => {
        set({ isLoading: true });
        try {
          console.log('📱 Loading user profile...');
          
          const profile = await authService.getProfile();

          set({
            user: {
              id: profile.id,
              phone_number: profile.phone_number,
              full_name: profile.full_name,
              email: profile.email,
              role: profile.role,
              is_active: profile.is_active,
              is_phone_verified: profile.is_phone_verified,
              is_email_verified: profile.is_email_verified,
              is_kyc_verified: profile.is_kyc_verified,
              preferred_language: profile.preferred_language,
              date_joined: profile.date_joined,
              last_login: profile.last_login,
            },
            profile: profile,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ User profile loaded');
        } catch (error: any) {
          console.error('❌ Load user failed:', error);
          
          await removeTokens();
          
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      fetchProfile: async () => {
        try {
          const profile = await authService.getProfile();
          
          set({
            user: {
              id: profile.id,
              phone_number: profile.phone_number,
              full_name: profile.full_name,
              email: profile.email,
              role: profile.role,
              is_active: profile.is_active,
              is_phone_verified: profile.is_phone_verified,
              is_email_verified: profile.is_email_verified,
              is_kyc_verified: profile.is_kyc_verified,
              preferred_language: profile.preferred_language,
              date_joined: profile.date_joined,
              last_login: profile.last_login,
            },
            profile: profile,
          });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          console.log('🚪 Logging out...');
          
          await authService.logout();
          await removeTokens();
          
          set({
            user: null,
            profile: null,
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

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);