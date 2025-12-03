import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Crop,
  CropDetail,
  CropInput,
  CropObservation,
  HarvestRecord,
  CropStatistics,
  CropFormData,
  TimelineEvent,
} from '@/types/crop.types';
import { cropService } from '@/services/crop.service';

interface CropState {
  // Data
  crops: Crop[];
  selectedCrop: CropDetail | null;
  statistics: CropStatistics | null;
  inputs: CropInput[];
  observations: CropObservation[];
  harvests: HarvestRecord[];
  timeline: TimelineEvent[];
  transactions: any[];

  // Loading states
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  // Actions - Crops
  fetchMyCrops: () => Promise<void>;
  fetchCropById: (id: string) => Promise<void>;
  createCrop: (data: CropFormData) => Promise<Crop>;
  updateCrop: (id: string, data: Partial<CropFormData>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  updateCropStatus: (id: string, status: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;

  // Actions - Inputs
  fetchCropInputs: (cropId: string) => Promise<void>;
  addInput: (data: Partial<CropInput>) => Promise<void>;
  getInputCostSummary: (cropId?: string) => Promise<any>;

  // Actions - Observations
  fetchObservations: (cropId: string) => Promise<void>;
  addObservation: (data: Partial<CropObservation>) => Promise<void>;
  getDiseaseAlerts: (days?: number) => Promise<CropObservation[]>;

  // Actions - Harvests
  fetchHarvests: (cropId?: string) => Promise<void>;
  addHarvest: (data: Partial<HarvestRecord>) => Promise<void>;
  getHarvestStatistics: () => Promise<any>;

  // Actions - Timeline
  fetchCropTimeline: (cropId: string) => Promise<void>;

  // Actions - Transactions
  fetchMyTransactions: () => Promise<void>;
  fetchCropTransactions: (cropId: string) => Promise<void>;

  // Utilities
  setSelectedCrop: (crop: CropDetail | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useCropStore = create<CropState>()(
  persist(
    (set, get) => ({
      // Initial State
      crops: [],
      selectedCrop: null,
      statistics: null,
      inputs: [],
      observations: [],
      harvests: [],
      timeline: [],
      transactions: [],
      isLoading: false,
      isLoadingDetail: false,
      error: null,

      // ========================================================================
      // CROP MANAGEMENT
      // ========================================================================

      fetchMyCrops: async () => {
        set({ isLoading: true, error: null });
        try {
          const crops = await cropService.getMyCrops();
          set({ crops, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch crops',
            isLoading: false,
          });
        }
      },

      fetchCropById: async (id: string) => {
        set({ isLoadingDetail: true, error: null });
        try {
          const crop = await cropService.getCropById(id);
          set({ selectedCrop: crop as unknown as CropDetail, isLoadingDetail: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch crop details',
            isLoadingDetail: false,
          });
        }
      },

      createCrop: async (data: CropFormData) => {
        set({ isLoading: true, error: null });
        try {
          const newCrop = await cropService.createCrop(data);
          set((state) => ({
            crops: [newCrop, ...state.crops],
            isLoading: false,
          }));
          return newCrop;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add crop',
            isLoading: false,
          });
          throw error;
        }
      },

      updateCrop: async (id: string, data: Partial<CropFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await cropService.updateCrop(id, data);
          set((state) => ({
            crops: state.crops.map((c) => (c.id === id ? updated : c)),
            selectedCrop:
              state.selectedCrop?.id === id
                ? (updated as unknown as CropDetail)
                : state.selectedCrop,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update crop',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteCrop: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await cropService.deleteCrop(id);
          set((state) => ({
            crops: state.crops.filter((c) => c.id !== id),
            selectedCrop: state.selectedCrop?.id === id ? null : state.selectedCrop,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete crop',
            isLoading: false,
          });
          throw error;
        }
      },

      updateCropStatus: async (id: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await cropService.updateStatus(id, status);
          set((state) => ({
            crops: state.crops.map((c) => (c.id === id ? updated : c)),
            selectedCrop:
              state.selectedCrop?.id === id
                ? (updated as unknown as CropDetail)
                : state.selectedCrop,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update status',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchStatistics: async () => {
        try {
          const statistics = await cropService.getStatistics();
          set({ statistics });
        } catch (error: any) {
          console.error('Failed to fetch statistics:', error);
        }
      },

      // ========================================================================
      // CROP INPUTS
      // ========================================================================

      fetchCropInputs: async (cropId: string) => {
        try {
          const inputs = await cropService.getCropInputs(cropId);
          set({ inputs });
        } catch (error: any) {
          console.error('Failed to fetch inputs:', error);
        }
      },

      addInput: async (data: Partial<CropInput>) => {
        set({ isLoading: true, error: null });
        try {
          const newInput = await cropService.addCropInput(data);
          set((state) => ({
            inputs: [newInput, ...state.inputs],
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add input',
            isLoading: false,
          });
          throw error;
        }
      },

      getInputCostSummary: async (cropId?: string) => {
        try {
          return await cropService.getInputCostSummary(cropId);
        } catch (error: any) {
          console.error('Failed to fetch cost summary:', error);
          return null;
        }
      },

      // ========================================================================
      // CROP OBSERVATIONS
      // ========================================================================

      fetchObservations: async (cropId: string) => {
        try {
          const observations = await cropService.getCropObservations(cropId);
          set({ observations });
        } catch (error: any) {
          console.error('Failed to fetch observations:', error);
        }
      },

      addObservation: async (data: Partial<CropObservation>) => {
        set({ isLoading: true, error: null });
        try {
          const newObs = await cropService.addObservation(data);
          set((state) => ({
            observations: [newObs, ...state.observations],
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add observation',
            isLoading: false,
          });
          throw error;
        }
      },

      getDiseaseAlerts: async (days: number = 7) => {
        try {
          return await cropService.getDiseaseAlerts(days);
        } catch (error: any) {
          console.error('Failed to fetch disease alerts:', error);
          return [];
        }
      },

      // ========================================================================
      // HARVEST RECORDS
      // ========================================================================

      fetchHarvests: async (cropId?: string) => {
        try {
          const harvests = await cropService.getHarvestRecords(cropId);
          set({ harvests });
        } catch (error: any) {
          console.error('Failed to fetch harvests:', error);
        }
      },

      addHarvest: async (data: Partial<HarvestRecord>) => {
        set({ isLoading: true, error: null });
        try {
          const newHarvest = await cropService.addHarvest(data);
          set((state) => ({
            harvests: [newHarvest, ...state.harvests],
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add harvest',
            isLoading: false,
          });
          throw error;
        }
      },

      getHarvestStatistics: async () => {
        try {
          return await cropService.getHarvestStatistics();
        } catch (error: any) {
          console.error('Failed to fetch harvest statistics:', error);
          return null;
        }
      },

      // ========================================================================
      // TIMELINE
      // ========================================================================

      fetchCropTimeline: async (cropId: string) => {
        try {
          const timeline = await cropService.getCropTimeline(cropId);
          set({ timeline });
        } catch (error: any) {
          console.error('Failed to fetch timeline:', error);
        }
      },

      // ========================================================================
      // TRANSACTIONS
      // ========================================================================

      fetchMyTransactions: async () => {
        try {
          const transactions = await cropService.getMyTransactions();
          set({ transactions });
        } catch (error: any) {
          console.error('Failed to fetch transactions:', error);
        }
      },

      fetchCropTransactions: async (cropId: string) => {
        try {
          const transactions = await cropService.getCropTransactions(cropId);
          set({ transactions });
        } catch (error: any) {
          console.error('Failed to fetch crop transactions:', error);
        }
      },

      // ========================================================================
      // UTILITIES
      // ========================================================================

      setSelectedCrop: (crop: CropDetail | null) => set({ selectedCrop: crop }),

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          crops: [],
          selectedCrop: null,
          statistics: null,
          inputs: [],
          observations: [],
          harvests: [],
          timeline: [],
          transactions: [],
          isLoading: false,
          isLoadingDetail: false,
          error: null,
        }),
    }),
    {
      name: 'crop-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        crops: state.crops,
        statistics: state.statistics,
      }),
    }
  )
);