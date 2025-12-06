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
  
  // Actions
  setProfile: (profile: FarmerProfile | null) => void;
  updateProfile: (updates: Partial<FarmerProfile>) => void;
  setStats: (stats: any) => void;
  setLoading: (loading: boolean) => void;
  clearProfile: () => void;
}

export const useFarmerStore = create<FarmerState>((set) => ({
  profile: null,
  stats: null,
  isLoading: false,

  setProfile: (profile) => set({ profile }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null,
  })),
  
  setStats: (stats) => set({ stats }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearProfile: () => set({ profile: null, stats: null }),
}));
