import { create } from 'zustand';
import { Crop, CropActivity, HarvestRecord, FarmAnalytics } from '@/types/crop.types';
import { cropService } from '@/services/crop.service';

interface CropStore {
  // State
  crops: Crop[];
  activeCrops: Crop[];
  selectedCrop: Crop | null;
  activities: CropActivity[];
  harvests: HarvestRecord[];
  analytics: FarmAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllCrops: () => Promise<void>;
  fetchActiveCrops: () => Promise<void>;
  fetchCropById: (cropId: string) => Promise<void>;
  addCrop: (cropData: Partial<Crop>) => Promise<void>;
  updateCrop: (cropId: string, updates: Partial<Crop>) => Promise<void>;
  deleteCrop: (cropId: string) => Promise<void>;
  fetchCropActivities: (cropId: string) => Promise<void>;
  addActivity: (activityData: Partial<CropActivity>) => Promise<void>;
  fetchHarvestRecords: (cropId?: string) => Promise<void>;
  addHarvest: (harvestData: Partial<HarvestRecord>) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  setSelectedCrop: (crop: Crop | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useCropStore = create<CropStore>((set, get) => ({
  // Initial State
  crops: [],
  activeCrops: [],
  selectedCrop: null,
  activities: [],
  harvests: [],
  analytics: null,
  isLoading: false,
  error: null,

  // Fetch all crops
  fetchAllCrops: async () => {
    set({ isLoading: true, error: null });
    try {
      const crops = await cropService.getAllCrops();
      set({ crops, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch active crops
  fetchActiveCrops: async () => {
    set({ isLoading: true, error: null });
    try {
      const activeCrops = await cropService.getActiveCrops();
      set({ activeCrops, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch crop by ID
  fetchCropById: async (cropId: string) => {
    set({ isLoading: true, error: null });
    try {
      const crop = await cropService.getCropById(cropId);
      set({ selectedCrop: crop, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add new crop
  addCrop: async (cropData: Partial<Crop>) => {
    set({ isLoading: true, error: null });
    try {
      const newCrop = await cropService.addCrop(cropData);
      set(state => ({
        crops: [...state.crops, newCrop],
        activeCrops: [...state.activeCrops, newCrop],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Update crop
  updateCrop: async (cropId: string, updates: Partial<Crop>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCrop = await cropService.updateCrop(cropId, updates);
      set(state => ({
        crops: state.crops.map(c => c.id === cropId ? updatedCrop : c),
        activeCrops: state.activeCrops.map(c => c.id === cropId ? updatedCrop : c),
        selectedCrop: state.selectedCrop?.id === cropId ? updatedCrop : state.selectedCrop,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Delete crop
  deleteCrop: async (cropId: string) => {
    set({ isLoading: true, error: null });
    try {
      await cropService.deleteCrop(cropId);
      set(state => ({
        crops: state.crops.filter(c => c.id !== cropId),
        activeCrops: state.activeCrops.filter(c => c.id !== cropId),
        selectedCrop: state.selectedCrop?.id === cropId ? null : state.selectedCrop,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch crop activities
  fetchCropActivities: async (cropId: string) => {
    set({ isLoading: true, error: null });
    try {
      const activities = await cropService.getCropActivities(cropId);
      set({ activities, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add activity
  addActivity: async (activityData: Partial<CropActivity>) => {
    set({ isLoading: true, error: null });
    try {
      const newActivity = await cropService.addCropActivity(activityData);
      set(state => ({
        activities: [newActivity, ...state.activities],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch harvest records
  fetchHarvestRecords: async (cropId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const harvests = await cropService.getHarvestRecords(cropId);
      set({ harvests, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Add harvest
  addHarvest: async (harvestData: Partial<HarvestRecord>) => {
    set({ isLoading: true, error: null });
    try {
      const newHarvest = await cropService.addHarvestRecord(harvestData);
      set(state => ({
        harvests: [newHarvest, ...state.harvests],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch analytics
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await cropService.getFarmAnalytics();
      set({ analytics, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set selected crop
  setSelectedCrop: (crop: Crop | null) => {
    set({ selectedCrop: crop });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      crops: [],
      activeCrops: [],
      selectedCrop: null,
      activities: [],
      harvests: [],
      analytics: null,
      isLoading: false,
      error: null
    });
  }
}));