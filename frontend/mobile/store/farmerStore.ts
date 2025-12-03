import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { farmerService } from '@/services/farmer.service';
import { Farmer, FarmerDashboard } from '@/types/farmer.types';

interface FarmerState {
  farmer: Farmer | null;
  dashboard: FarmerDashboard | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFarmerProfile: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  clearFarmer: () => void;
}

export const useFarmerStore = create<FarmerState>()(
  persist(
    (set, get) => ({
      farmer: null,
      dashboard: null,
      isLoading: false,
      error: null,

      loadFarmerProfile: async () => {
        // Prevent multiple simultaneous calls
        if (get().isLoading) {
          console.log('⏳ Farmer profile already loading, skipping...');
          return;
        }

        set({ isLoading: true, error: null });
        try {
          console.log('🔄 Loading farmer profile...');
          const farmer = await farmerService.getProfile();
          console.log('✅ Farmer profile loaded:', farmer);
          set({ farmer, isLoading: false });
        } catch (error: any) {
          console.error('❌ Failed to load farmer profile:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.detail ||
                              error.message || 
                              'Failed to load farmer profile';
          set({ 
            error: errorMessage, 
            isLoading: false,
            farmer: null 
          });
        }
      },

      loadDashboard: async () => {
        if (get().isLoading) {
          console.log('⏳ Dashboard already loading, skipping...');
          return;
        }

        set({ isLoading: true, error: null });
        try {
          console.log('🔄 Loading farmer dashboard...');
          const dashboard = await farmerService.getDashboard();
          console.log('✅ Farmer dashboard loaded:', dashboard);
          set({ dashboard, isLoading: false });
        } catch (error: any) {
          console.error('❌ Failed to load dashboard:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.detail ||
                              error.message || 
                              'Failed to load dashboard';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
        }
      },

      clearFarmer: () => {
        set({ 
          farmer: null, 
          dashboard: null, 
          isLoading: false, 
          error: null 
        });
      },
    }),
    {
      name: 'farmer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        farmer: state.farmer,
        dashboard: state.dashboard,
      }),
    }
  )
);