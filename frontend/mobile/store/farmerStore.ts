import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Farmer, FarmDetails, Lot, LotStatus } from '@/types/farmer.types';

// Add MarketPrice interface
interface MarketPrice {
  id: string;
  crop_type: string;
  variety?: string;
  price: number;
  unit: string;
  market_name: string;
  date: string;
}

interface FarmerState {
  // Farmer Profile
  farmer: Farmer | null;
  farmDetails: FarmDetails | null;
  isProfileComplete: boolean;
  
  // Lots
  lots: Lot[];
  selectedLot: Lot | null;
  lotsLoading: boolean;
  
  // Market Prices
  marketPrices: MarketPrice[];
  pricesLoading: boolean;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFarmer: (farmer: Farmer) => void;
  setFarmDetails: (details: FarmDetails) => void;
  updateFarmer: (updates: Partial<Farmer>) => void;
  updateFarmDetails: (updates: Partial<FarmDetails>) => void;
  checkProfileCompletion: () => void;
  clearFarmer: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Lot Actions
  loadLots: (status?: LotStatus) => Promise<void>;
  loadLotDetail: (lotId: string) => Promise<void>;
  createLot: (lot: Partial<Lot>) => Promise<void>;
  updateLot: (lotId: string, updates: Partial<Lot>) => Promise<void>;
  deleteLot: (lotId: string) => Promise<void>;
  setSelectedLot: (lot: Lot | null) => void;
  
  // Market Price Actions
  loadMarketPrices: (cropType?: string) => Promise<void>;
}

export const useFarmerStore = create<FarmerState>()(
  persist(
    (set, get) => ({
      // Initial State
      farmer: null,
      farmDetails: null,
      isProfileComplete: false,
      isLoading: false,
      error: null,
      
      // Lots Initial State
      lots: [],
      selectedLot: null,
      lotsLoading: false,

      // Market Prices Initial State
      marketPrices: [],
      pricesLoading: false,

      // ...existing code...

      // Set Farmer
      setFarmer: (farmer) => {
        set({ farmer, error: null });
        get().checkProfileCompletion();
      },

      // Set Farm Details
      setFarmDetails: (details) => {
        set({ farmDetails: details, error: null });
        get().checkProfileCompletion();
      },

      // Update Farmer
      updateFarmer: (updates) => {
        const currentFarmer = get().farmer;
        if (currentFarmer) {
          set({ 
            farmer: { ...currentFarmer, ...updates },
            error: null 
          });
          get().checkProfileCompletion();
        }
      },

      // Update Farm Details
      updateFarmDetails: (updates) => {
        const currentDetails = get().farmDetails;
        if (currentDetails) {
          set({ 
            farmDetails: { ...currentDetails, ...updates },
            error: null 
          });
          get().checkProfileCompletion();
        }
      },

      // Check Profile Completion
      checkProfileCompletion: () => {
        const { farmer, farmDetails } = get();
        
        const isComplete = !!(
          farmer &&
          farmer.name &&
          farmer.phoneNumber &&
          farmer.state &&
          farmer.district &&
          farmDetails &&
          farmDetails.totalArea > 0
        );

        set({ isProfileComplete: isComplete });
      },

      // Clear Farmer (Logout)
      clearFarmer: () => {
        set({
          farmer: null,
          farmDetails: null,
          isProfileComplete: false,
          error: null,
          lots: [],
          selectedLot: null,
          marketPrices: [],
        });
      },

      // Set Loading
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set Error
      setError: (error) => {
        set({ error });
      },
      
      // Lot Actions
      loadLots: async (status?: LotStatus) => {
        set({ lotsLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await api.getLots(status);
          // set({ lots: response.data, lotsLoading: false });
          set({ lotsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load lots',
            lotsLoading: false 
          });
        }
      },

      loadLotDetail: async (lotId: string) => {
        set({ lotsLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await api.getLotDetail(lotId);
          // set({ selectedLot: response.data, lotsLoading: false });
          set({ lotsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load lot detail',
            lotsLoading: false 
          });
        }
      },

      createLot: async (lot: Partial<Lot>) => {
        set({ lotsLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await api.createLot(lot);
          // const newLot = response.data;
          // set({ lots: [...get().lots, newLot], lotsLoading: false });
          set({ lotsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create lot',
            lotsLoading: false 
          });
        }
      },

      updateLot: async (lotId: string, updates: Partial<Lot>) => {
        set({ lotsLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await api.updateLot(lotId, updates);
          // const updatedLot = response.data;
          // set({ 
          //   lots: get().lots.map(lot => lot.id === lotId ? updatedLot : lot),
          //   lotsLoading: false 
          // });
          set({ lotsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update lot',
            lotsLoading: false 
          });
        }
      },

      deleteLot: async (lotId: string) => {
        set({ lotsLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // await api.deleteLot(lotId);
          // set({ 
          //   lots: get().lots.filter(lot => lot.id !== lotId),
          //   lotsLoading: false 
          // });
          set({ lotsLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete lot',
            lotsLoading: false 
          });
        }
      },

      setSelectedLot: (lot: Lot | null) => {
        set({ selectedLot: lot });
      },

      // Market Price Actions
      loadMarketPrices: async (cropType?: string) => {
        set({ pricesLoading: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await api.getMarketPrices(cropType);
          // set({ marketPrices: response.data, pricesLoading: false });
          set({ pricesLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load market prices',
            pricesLoading: false 
          });
        }
      },
    }),
    {
      name: 'farmer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        farmer: state.farmer,
        farmDetails: state.farmDetails,
        isProfileComplete: state.isProfileComplete,
        lots: state.lots,
      }),
    }
  )
);

// Export MarketPrice type for use in other files
export type { MarketPrice };