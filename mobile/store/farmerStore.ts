import { create } from 'zustand';
import { FarmerProfile } from '@/types/api';

interface FarmerState {
  profile: FarmerProfile | null;
  stats: {
    total_lots_created: number;
    total_quantity_sold_quintals: number;
    total_earnings: number;
    total_farmland_acres: number;
    farmland_count: number;
    active_crops: number;
    active_lots: number;
    pending_bids: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: FarmerProfile | null) => void;
  updateProfile: (updates: Partial<FarmerProfile>) => void;
  setStats: (stats: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useFarmerStore = create<FarmerState>((set, get) => ({
  profile: null,
  stats: null,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({ profile, error: null }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null,
  })),
  
  setStats: (stats) => set({ stats }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearProfile: () => set({ profile: null, stats: null, error: null }),
  
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { farmersAPI } = await import('@/services/farmersService');
      const response = await farmersAPI.getMyProfile();
      
      // Unwrap ApiSuccess response: response.data.data || response.data
      const profileData = response.data.data || response.data;
      
      set({ profile: profileData, isLoading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch farmer profile:', error);
      set({ 
        error: error?.response?.data?.message || 'Failed to fetch profile',
        isLoading: false 
      });
    }
  },
  
  fetchStats: async () => {
    try {
      const { farmersAPI } = await import('@/services/farmersService');
      const response = await farmersAPI.getStats();
      
      // Unwrap ApiSuccess response if needed
      const statsData = response.data.data || response.data;
      
      set({ stats: statsData });
    } catch (error: any) {
      console.error('Failed to fetch farmer stats:', error);
      set({ error: error?.response?.data?.message || 'Failed to fetch stats' });
    }
  },
}));
