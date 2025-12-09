import { create } from 'zustand';
import { Shipment, LogisticsPartner, Vehicle } from '@/types/api';

interface LogisticsState {
  // Profile
  profile: LogisticsPartner | null;
  vehicles: Vehicle[];
  
  // Shipments
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  activeShipments: Shipment[];
  tripHistory: Shipment[];
  
  // Stats
  stats: {
    total_vehicles: number;
    total_shipments: number;
    active_shipments: number;
    completed_shipments: number;
    is_verified: boolean;
  } | null;
  
  // Earnings
  earnings: {
    total_earnings: number;
    current_month_earnings: number;
    pending_payments: number;
    average_earning_per_trip: number;
  } | null;
  
  isLoading: boolean;
  error: string | null;
  
  // Actions - Profile
  setProfile: (profile: LogisticsPartner | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  
  // Actions - Shipments
  setShipments: (shipments: Shipment[]) => void;
  setSelectedShipment: (shipment: Shipment | null) => void;
  setActiveShipments: (shipments: Shipment[]) => void;
  setTripHistory: (trips: Shipment[]) => void;
  updateShipment: (id: number, updates: Partial<Shipment>) => void;
  
  // Actions - Stats & Earnings
  setStats: (stats: any) => void;
  setEarnings: (earnings: any) => void;
  
  // General actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
}

export const useLogisticsStore = create<LogisticsState>((set, get) => ({
  // Initial state
  profile: null,
  vehicles: [],
  shipments: [],
  selectedShipment: null,
  activeShipments: [],
  tripHistory: [],
  stats: null,
  earnings: null,
  isLoading: false,
  error: null,

  // Profile actions
  setProfile: (profile) => set({ profile, error: null }),
  
  setVehicles: (vehicles) => set({ vehicles }),
  
  addVehicle: (vehicle) => set((state) => ({
    vehicles: [...state.vehicles, vehicle],
  })),

  // Shipment actions
  setShipments: (shipments) => set({ shipments }),
  
  setSelectedShipment: (shipment) => set({ selectedShipment: shipment }),
  
  setActiveShipments: (shipments) => set({ activeShipments: shipments }),
  
  setTripHistory: (trips) => set({ tripHistory: trips }),
  
  updateShipment: (id, updates) => set((state) => ({
    shipments: state.shipments.map((shipment) =>
      shipment.id === id ? { ...shipment, ...updates } : shipment
    ),
    activeShipments: state.activeShipments.map((shipment) =>
      shipment.id === id ? { ...shipment, ...updates } : shipment
    ),
    tripHistory: state.tripHistory.map((shipment) =>
      shipment.id === id ? { ...shipment, ...updates } : shipment
    ),
    selectedShipment: state.selectedShipment?.id === id
      ? { ...state.selectedShipment, ...updates }
      : state.selectedShipment,
  })),

  // Stats & Earnings actions
  setStats: (stats) => set({ stats }),
  
  setEarnings: (earnings) => set({ earnings }),

  // General actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { logisticsAPI } = await import('@/services/logisticsService');
      const response = await logisticsAPI.getMyProfile();
      
      // Unwrap ApiSuccess response: response.data.data || response.data
      const profileData = response.data.data || response.data;
      
      set({ profile: profileData, isLoading: false, error: null });
    } catch (error: any) {
      console.error('Failed to fetch logistics profile:', error);
      set({ 
        error: error?.response?.data?.message || 'Failed to fetch profile',
        isLoading: false 
      });
    }
  },
  
  fetchStats: async () => {
    try {
      const { logisticsAPI } = await import('@/services/logisticsService');
      const response = await logisticsAPI.getStats();
      
      // Unwrap ApiSuccess response if needed
      const statsData = response.data.data || response.data;
      
      set({ stats: statsData });
    } catch (error: any) {
      console.error('Failed to fetch logistics stats:', error);
      set({ error: error?.response?.data?.message || 'Failed to fetch stats' });
    }
  },
  
  clearData: () => set({
    profile: null,
    vehicles: [],
    shipments: [],
    selectedShipment: null,
    activeShipments: [],
    tripHistory: [],
    stats: null,
    earnings: null,
    error: null,
  }),
}));
