import { create } from 'zustand';
import { Crop, CropInput, CropObservation, HarvestRecord, CropStatistics } from '@/types/crop.types';
import { cropService } from '@/services/crop.service';

interface CropStore {
  crops: Crop[];
  selectedCrop: Crop | null;
  statistics: CropStatistics | null;
  inputs: CropInput[];
  observations: CropObservation[];
  harvests: HarvestRecord[];
  isLoading: boolean;
  error: string | null;

  fetchMyCrops: () => Promise<void>;
  fetchCropById: (id: string) => Promise<void>;
  createCrop: (data: any) => Promise<Crop>;
  updateCrop: (id: string, data: any) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  updateCropStatus: (id: string, status: string) => Promise<void>;
  
  fetchCropInputs: (cropId: string) => Promise<void>;
  addInput: (data: any) => Promise<void>;
  
  fetchObservations: (cropId: string) => Promise<void>;
  addObservation: (data: any) => Promise<void>;
  
  fetchHarvests: (cropId?: string) => Promise<void>;
  addHarvest: (data: any) => Promise<void>;
  
  setSelectedCrop: (crop: Crop | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useCropStore = create<CropStore>((set, get) => ({
  crops: [],
  selectedCrop: null,
  statistics: null,
  inputs: [],
  observations: [],
  harvests: [],
  isLoading: false,
  error: null,

  fetchMyCrops: async () => {
    set({ isLoading: true, error: null });
    try {
      const crops = await cropService.getMyCrops();
      set({ crops, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch crops', isLoading: false });
    }
  },

  fetchCropById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const crop = await cropService.getCropById(id);
      set({ selectedCrop: crop, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch crop', isLoading: false });
    }
  },

  createCrop: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newCrop = await cropService.createCrop(data);
      set(state => ({
        crops: [newCrop, ...state.crops],
        isLoading: false
      }));
      return newCrop;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add crop', isLoading: false });
      throw error;
    }
  },

  updateCrop: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await cropService.updateCrop(id, data);
      set(state => ({
        crops: state.crops.map(c => c.id === id ? updated : c),
        selectedCrop: state.selectedCrop?.id === id ? updated : state.selectedCrop,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update crop', isLoading: false });
      throw error;
    }
  },

  deleteCrop: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await cropService.deleteCrop(id);
      set(state => ({
        crops: state.crops.filter(c => c.id !== id),
        selectedCrop: state.selectedCrop?.id === id ? null : state.selectedCrop,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete crop', isLoading: false });
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

  updateCropStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await cropService.updateStatus(id, status);
      set(state => ({
        crops: state.crops.map(c => c.id === id ? updated : c),
        selectedCrop: state.selectedCrop?.id === id ? updated : state.selectedCrop,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update status', isLoading: false });
      throw error;
    }
  },

  fetchCropInputs: async (cropId: string) => {
    try {
      const inputs = await cropService.getCropInputs(cropId);
      set({ inputs });
    } catch (error: any) {
      console.error('Failed to fetch inputs:', error);
    }
  },

  addInput: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newInput = await cropService.addCropInput(data);
      set(state => ({
        inputs: [newInput, ...state.inputs],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add input', isLoading: false });
      throw error;
    }
  },

  fetchObservations: async (cropId: string) => {
    try {
      const observations = await cropService.getCropObservations(cropId);
      set({ observations });
    } catch (error: any) {
      console.error('Failed to fetch observations:', error);
    }
  },

  addObservation: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newObs = await cropService.addObservation(data);
      set(state => ({
        observations: [newObs, ...state.observations],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add observation', isLoading: false });
      throw error;
    }
  },

  fetchHarvests: async (cropId?: string) => {
    try {
      const harvests = await cropService.getHarvestRecords(cropId);
      set({ harvests });
    } catch (error: any) {
      console.error('Failed to fetch harvests:', error);
    }
  },

  addHarvest: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newHarvest = await cropService.addHarvest(data);
      set(state => ({
        harvests: [newHarvest, ...state.harvests],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to add harvest', isLoading: false });
      throw error;
    }
  },

  setSelectedCrop: (crop: Crop | null) => set({ selectedCrop: crop }),
  clearError: () => set({ error: null }),
  reset: () => set({
    crops: [],
    selectedCrop: null,
    statistics: null,
    inputs: [],
    observations: [],
    harvests: [],
    isLoading: false,
    error: null
  }),
}));