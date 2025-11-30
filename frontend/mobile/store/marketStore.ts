import { create } from 'zustand';
import {
  MarketPrice,
  PriceHistory,
  Market,
  PriceAlert,
  TradeDemand,
  MyListing,
  MarketNews,
  CropAnalytics,
  GovernmentScheme,
  MSPInfo,
  Crop,
} from '@/types/market.types';
import { marketService } from '@/services/market.service';

interface MarketState {
  // State
  crops: Crop[];
  prices: MarketPrice[];
  priceHistory: { [cropId: string]: PriceHistory[] };
  markets: Market[];
  priceAlerts: PriceAlert[];
  tradeDemands: TradeDemand[];
  myListings: MyListing[];
  marketNews: MarketNews[];
  cropAnalytics: { [cropId: string]: CropAnalytics };
  governmentSchemes: GovernmentScheme[];
  mspInfo: MSPInfo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCrops: () => Promise<void>;
  fetchPrices: (filters?: any) => Promise<void>;
  fetchPriceHistory: (cropId: string, days?: number) => Promise<void>;
  fetchNearbyMarkets: (latitude: number, longitude: number) => Promise<void>;
  fetchPriceAlerts: (userId: string) => Promise<void>;
  createPriceAlert: (alert: any) => Promise<void>;
  deletePriceAlert: (alertId: string) => Promise<void>;
  fetchTradeDemands: (filters?: any) => Promise<void>;
  createTradeListing: (listing: any) => Promise<void>;
  fetchMyListings: (userId: string) => Promise<void>;
  fetchMarketNews: () => Promise<void>;
  fetchCropAnalytics: (cropId: string) => Promise<void>;
  fetchGovernmentSchemes: (state?: string) => Promise<void>;
  fetchMSPInfo: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  // Initial state
  crops: [],
  prices: [],
  priceHistory: {},
  markets: [],
  priceAlerts: [],
  tradeDemands: [],
  myListings: [],
  marketNews: [],
  cropAnalytics: {},
  governmentSchemes: [],
  mspInfo: [],
  isLoading: false,
  error: null,

  // Fetch crops
  fetchCrops: async () => {
    try {
      set({ isLoading: true, error: null });
      const crops = await marketService.getCrops();
      set({ crops, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch crops', isLoading: false });
    }
  },

  // Fetch prices
  fetchPrices: async (filters?: any) => {
    try {
      set({ isLoading: true, error: null });
      const prices = await marketService.getMarketPrices(filters);
      set({ prices, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch prices', isLoading: false });
    }
  },

  // Fetch price history
  fetchPriceHistory: async (cropId: string, days: number = 30) => {
    try {
      set({ isLoading: true, error: null });
      const history = await marketService.getPriceHistory(cropId, days);
      set((state) => ({
        priceHistory: { ...state.priceHistory, [cropId]: history },
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch price history', isLoading: false });
    }
  },

  // Fetch nearby markets
  fetchNearbyMarkets: async (latitude: number, longitude: number) => {
    try {
      set({ isLoading: true, error: null });
      const markets = await marketService.getNearbyMarkets(latitude, longitude);
      set({ markets, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch markets', isLoading: false });
    }
  },

  // Fetch price alerts
  fetchPriceAlerts: async (userId: string) => {
    try {
      const alerts = await marketService.getPriceAlerts(userId);
      set({ priceAlerts: alerts });
    } catch (error: any) {
      console.error('Failed to fetch price alerts:', error);
    }
  },

  // Create price alert
  createPriceAlert: async (alert: any) => {
    try {
      const newAlert = await marketService.createPriceAlert(alert);
      set((state) => ({
        priceAlerts: [...state.priceAlerts, newAlert],
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create price alert' });
    }
  },

  // Delete price alert
  deletePriceAlert: async (alertId: string) => {
    try {
      await marketService.deletePriceAlert(alertId);
      set((state) => ({
        priceAlerts: state.priceAlerts.filter((alert) => alert.id !== alertId),
      }));
    } catch (error: any) {
      console.error('Failed to delete price alert:', error);
    }
  },

  // Fetch trade demands
  fetchTradeDemands: async (filters?: any) => {
    try {
      set({ isLoading: true, error: null });
      const demands = await marketService.getTradeDemands(filters);
      set({ tradeDemands: demands, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch trade demands', isLoading: false });
    }
  },

  // Create trade listing
  createTradeListing: async (listing: any) => {
    try {
      const newListing = await marketService.createTradeListing(listing);
      set((state) => ({
        tradeDemands: [newListing, ...state.tradeDemands],
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create listing' });
    }
  },

  // Fetch my listings
  fetchMyListings: async (userId: string) => {
    try {
      const listings = await marketService.getMyListings(userId);
      set({ myListings: listings });
    } catch (error: any) {
      console.error('Failed to fetch listings:', error);
    }
  },

  // Fetch market news
  fetchMarketNews: async () => {
    try {
      const news = await marketService.getMarketNews();
      set({ marketNews: news });
    } catch (error: any) {
      console.error('Failed to fetch market news:', error);
    }
  },

  // Fetch crop analytics
  fetchCropAnalytics: async (cropId: string) => {
    try {
      set({ isLoading: true, error: null });
      const analytics = await marketService.getCropAnalytics(cropId);
      set((state) => ({
        cropAnalytics: { ...state.cropAnalytics, [cropId]: analytics },
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch analytics', isLoading: false });
    }
  },

  // Fetch government schemes
  fetchGovernmentSchemes: async (state?: string) => {
    try {
      const schemes = await marketService.getGovernmentSchemes(state);
      set({ governmentSchemes: schemes });
    } catch (error: any) {
      console.error('Failed to fetch government schemes:', error);
    }
  },

  // Fetch MSP info
  fetchMSPInfo: async () => {
    try {
      const mspInfo = await marketService.getMSPInfo();
      set({ mspInfo });
    } catch (error: any) {
      console.error('Failed to fetch MSP info:', error);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      crops: [],
      prices: [],
      priceHistory: {},
      markets: [],
      priceAlerts: [],
      tradeDemands: [],
      myListings: [],
      marketNews: [],
      cropAnalytics: {},
      governmentSchemes: [],
      mspInfo: [],
      isLoading: false,
      error: null,
    }),
}));