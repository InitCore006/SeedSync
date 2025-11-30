import { useEffect } from 'react';
import { useCropStore } from '@/store/cropStore';

export const useCrops = () => {
  const {
    crops,
    activeCrops,
    selectedCrop,
    activities,
    harvests,
    analytics,
    isLoading,
    error,
    fetchAllCrops,
    fetchActiveCrops,
    fetchCropById,
    addCrop,
    updateCrop,
    deleteCrop,
    fetchCropActivities,
    addActivity,
    fetchHarvestRecords,
    addHarvest,
    fetchAnalytics,
    setSelectedCrop,
    clearError
  } = useCropStore();

  // Auto-fetch all crops on mount
  useEffect(() => {
    fetchAllCrops();
    fetchActiveCrops();
  }, []);

  return {
    // State
    crops,
    activeCrops,
    selectedCrop,
    activities,
    harvests,
    analytics,
    isLoading,
    error,

    // Actions
    fetchAllCrops,
    fetchActiveCrops,
    fetchCropById,
    addCrop,
    updateCrop,
    deleteCrop,
    fetchCropActivities,
    addActivity,
    fetchHarvestRecords,
    addHarvest,
    fetchAnalytics,
    setSelectedCrop,
    clearError
  };
};