import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Filters {
  state?: string;
  district?: string;
  cropType?: string;
  kycStatus?: string;
  status?: string;
  days?: string;
}

interface GovernmentState {
  // Dashboard filters
  dashboardFilters: {
    cropType?: string;
    year?: number;
  };
  
  // FPO monitoring filters
  fpoFilters: Filters;
  
  // Farmer registry filters
  farmerFilters: Filters;
  
  // Processor monitoring filters
  processorFilters: Filters;
  
  // Retailer analytics filters
  retailerFilters: Filters;
  
  // Supply chain tracking filters
  supplyChainFilters: Filters;
  
  // Procurement analytics filters
  procurementFilters: Filters;
  
  // Market prices filters
  marketPricesFilters: Filters;
  
  // Selected view/tab
  selectedView: string;
  
  // Actions
  setDashboardFilters: (filters: { cropType?: string; year?: number }) => void;
  setFPOFilters: (filters: Filters) => void;
  setFarmerFilters: (filters: Filters) => void;
  setProcessorFilters: (filters: Filters) => void;
  setRetailerFilters: (filters: Filters) => void;
  setSupplyChainFilters: (filters: Filters) => void;
  setProcurementFilters: (filters: Filters) => void;
  setMarketPricesFilters: (filters: Filters) => void;
  setSelectedView: (view: string) => void;
  clearAllFilters: () => void;
  clearFiltersForView: (view: string) => void;
}

const initialFilters: Filters = {
  state: '',
  district: '',
  cropType: '',
  kycStatus: '',
  status: '',
  days: '30',
};

export const useGovernmentStore = create<GovernmentState>()(
  persist(
    (set) => ({
      // Initial state
      dashboardFilters: {},
      fpoFilters: initialFilters,
      farmerFilters: initialFilters,
      processorFilters: initialFilters,
      retailerFilters: initialFilters,
      supplyChainFilters: initialFilters,
      procurementFilters: { ...initialFilters, days: '30' },
      marketPricesFilters: { ...initialFilters, days: '30' },
      selectedView: 'dashboard',
      
      // Actions
      setDashboardFilters: (filters) =>
        set((state) => ({
          dashboardFilters: { ...state.dashboardFilters, ...filters },
        })),
      
      setFPOFilters: (filters) =>
        set((state) => ({
          fpoFilters: { ...state.fpoFilters, ...filters },
        })),
      
      setFarmerFilters: (filters) =>
        set((state) => ({
          farmerFilters: { ...state.farmerFilters, ...filters },
        })),
      
      setProcessorFilters: (filters) =>
        set((state) => ({
          processorFilters: { ...state.processorFilters, ...filters },
        })),
      
      setRetailerFilters: (filters) =>
        set((state) => ({
          retailerFilters: { ...state.retailerFilters, ...filters },
        })),
      
      setSupplyChainFilters: (filters) =>
        set((state) => ({
          supplyChainFilters: { ...state.supplyChainFilters, ...filters },
        })),
      
      setProcurementFilters: (filters) =>
        set((state) => ({
          procurementFilters: { ...state.procurementFilters, ...filters },
        })),
      
      setMarketPricesFilters: (filters) =>
        set((state) => ({
          marketPricesFilters: { ...state.marketPricesFilters, ...filters },
        })),
      
      setSelectedView: (view) =>
        set({ selectedView: view }),
      
      clearAllFilters: () =>
        set({
          dashboardFilters: {},
          fpoFilters: initialFilters,
          farmerFilters: initialFilters,
          processorFilters: initialFilters,
          retailerFilters: initialFilters,
          supplyChainFilters: initialFilters,
          procurementFilters: { ...initialFilters, days: '30' },
          marketPricesFilters: { ...initialFilters, days: '30' },
        }),
      
      clearFiltersForView: (view) =>
        set((state) => {
          const updates: Partial<GovernmentState> = {};
          
          switch (view) {
            case 'dashboard':
              updates.dashboardFilters = {};
              break;
            case 'fpo':
              updates.fpoFilters = initialFilters;
              break;
            case 'farmer':
              updates.farmerFilters = initialFilters;
              break;
            case 'processor':
              updates.processorFilters = initialFilters;
              break;
            case 'retailer':
              updates.retailerFilters = initialFilters;
              break;
            case 'supplyChain':
              updates.supplyChainFilters = initialFilters;
              break;
            case 'procurement':
              updates.procurementFilters = { ...initialFilters, days: '30' };
              break;
            case 'marketPrices':
              updates.marketPricesFilters = { ...initialFilters, days: '30' };
              break;
          }
          
          return updates;
        }),
    }),
    {
      name: 'government-storage',
      partialize: (state) => ({
        dashboardFilters: state.dashboardFilters,
        selectedView: state.selectedView,
      }),
    }
  )
);
