import { create } from 'zustand';
import {
  FarmerProfile,
  FarmerRegistrationStep1,
  FarmerRegistrationStep2,
  FarmerRegistrationStep3,
  Lot,
  MarketPrice,
  Transaction,
  FarmerDashboardStats,
} from '@/types/farmer.types';
import { farmerService } from '@/services/farmer.service';

interface FarmerState {
  // Profile
  profile: FarmerProfile | null;
  profileLoading: boolean;

  // Registration
  registrationStep: number;
  registrationData: {
    step1?: FarmerRegistrationStep1;
    step2?: FarmerRegistrationStep2;
    step3?: FarmerRegistrationStep3;
  };

  // Lots
  lots: Lot[];
  lotsLoading: boolean;
  selectedLot: Lot | null;

  // Market Prices
  marketPrices: MarketPrice[];
  pricesLoading: boolean;

  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;

  // Dashboard
  dashboardStats: FarmerDashboardStats | null;
  statsLoading: boolean;

  // Actions
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<FarmerProfile>) => Promise<void>;
  setRegistrationStep: (step: number) => void;
  saveRegistrationData: (step: number, data: any) => void;
  clearRegistrationData: () => void;
  loadLots: (status?: string) => Promise<void>;
  loadLotDetail: (id: string) => Promise<void>;
  createLot: (data: any) => Promise<Lot>;
  updateLot: (id: string, data: Partial<Lot>) => Promise<void>;
  deleteLot: (id: string) => Promise<void>;
  loadMarketPrices: (cropType?: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  reset: () => void;
}

export const useFarmerStore = create<FarmerState>((set, get) => ({
  // ============================================================================
  // INITIAL STATE
  // ============================================================================
  profile: null,
  profileLoading: false,
  registrationStep: 1,
  registrationData: {},
  lots: [],
  lotsLoading: false,
  selectedLot: null,
  marketPrices: [],
  pricesLoading: false,
  transactions: [],
  transactionsLoading: false,
  dashboardStats: null,
  statsLoading: false,

  // ============================================================================
  // PROFILE ACTIONS
  // ============================================================================
  loadProfile: async () => {
    set({ profileLoading: true });

    try {
      const profile = await farmerService.getMyProfile();
      set({ profile, profileLoading: false });
    } catch (error) {
      console.error('Load profile error:', error);
      set({ profileLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: Partial<FarmerProfile>) => {
    set({ profileLoading: true });

    try {
      const updatedProfile = await farmerService.updateProfile(data);
      set({ profile: updatedProfile, profileLoading: false });
    } catch (error) {
      console.error('Update profile error:', error);
      set({ profileLoading: false });
      throw error;
    }
  },

  // ============================================================================
  // REGISTRATION ACTIONS
  // ============================================================================
  setRegistrationStep: (step: number) => {
    set({ registrationStep: step });
  },

  saveRegistrationData: (step: number, data: any) => {
    const currentData = get().registrationData;

    set({
      registrationData: {
        ...currentData,
        [`step${step}`]: data,
      },
    });
  },

  clearRegistrationData: () => {
    set({
      registrationStep: 1,
      registrationData: {},
    });
  },

  // ============================================================================
  // LOTS ACTIONS
  // ============================================================================
  loadLots: async (status?: string) => {
    set({ lotsLoading: true });

    try {
      const response = await farmerService.getMyLots({ status });
      set({ lots: response.results, lotsLoading: false });
    } catch (error) {
      console.error('Load lots error:', error);
      set({ lotsLoading: false });
      throw error;
    }
  },

  loadLotDetail: async (id: string) => {
    set({ lotsLoading: true });

    try {
      const lot = await farmerService.getLotDetail(id);
      set({ selectedLot: lot, lotsLoading: false });
    } catch (error) {
      console.error('Load lot detail error:', error);
      set({ lotsLoading: false });
      throw error;
    }
  },

  createLot: async (data: any) => {
    set({ lotsLoading: true });

    try {
      const newLot = await farmerService.createLot(data);

      // Add to lots list
      const currentLots = get().lots;
      set({
        lots: [newLot, ...currentLots],
        lotsLoading: false,
      });

      return newLot;
    } catch (error) {
      console.error('Create lot error:', error);
      set({ lotsLoading: false });
      throw error;
    }
  },

  updateLot: async (id: string, data: Partial<Lot>) => {
    set({ lotsLoading: true });

    try {
      const updatedLot = await farmerService.updateLot(id, data);

      // Update in lots list
      const currentLots = get().lots;
      const updatedLots = currentLots.map((lot) =>
        lot.id === id ? updatedLot : lot
      );

      set({
        lots: updatedLots,
        selectedLot: get().selectedLot?.id === id ? updatedLot : get().selectedLot,
        lotsLoading: false,
      });
    } catch (error) {
      console.error('Update lot error:', error);
      set({ lotsLoading: false });
      throw error;
    }
  },

  deleteLot: async (id: string) => {
    set({ lotsLoading: true });

    try {
      await farmerService.deleteLot(id);

      // Remove from lots list
      const currentLots = get().lots;
      const updatedLots = currentLots.filter((lot) => lot.id !== id);

      set({
        lots: updatedLots,
        selectedLot: get().selectedLot?.id === id ? null : get().selectedLot,
        lotsLoading: false,
      });
    } catch (error) {
      console.error('Delete lot error:', error);
      set({ lotsLoading: false });
      throw error;
    }
  },

  // ============================================================================
  // MARKET PRICES ACTIONS
  // ============================================================================
  loadMarketPrices: async (cropType?: string) => {
    set({ pricesLoading: true });

    try {
      const prices = await farmerService.getMarketPrices(cropType);
      set({ marketPrices: prices, pricesLoading: false });
    } catch (error) {
      console.error('Load market prices error:', error);
      set({ pricesLoading: false });
      throw error;
    }
  },

  // ============================================================================
  // TRANSACTIONS ACTIONS
  // ============================================================================
  loadTransactions: async () => {
    set({ transactionsLoading: true });

    try {
      const response = await farmerService.getMyTransactions();
      set({ transactions: response.results, transactionsLoading: false });
    } catch (error) {
      console.error('Load transactions error:', error);
      set({ transactionsLoading: false });
      throw error;
    }
  },

  // ============================================================================
  // DASHBOARD ACTIONS
  // ============================================================================
  loadDashboardStats: async () => {
    set({ statsLoading: true });

    try {
      const stats = await farmerService.getDashboardStats();
      set({ dashboardStats: stats, statsLoading: false });
    } catch (error) {
      console.error('Load dashboard stats error:', error);
      set({ statsLoading: false });
      throw error;
    }
  },

  // ============================================================================
  // RESET
  // ============================================================================
  reset: () => {
    set({
      profile: null,
      profileLoading: false,
      registrationStep: 1,
      registrationData: {},
      lots: [],
      lotsLoading: false,
      selectedLot: null,
      marketPrices: [],
      pricesLoading: false,
      transactions: [],
      transactionsLoading: false,
      dashboardStats: null,
      statsLoading: false,
    });
  },
}));