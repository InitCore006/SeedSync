import { useEffect } from 'react';
import { useFarmerStore } from '@/store/farmerStore';
import { useAuth } from './useAuth';

export const useFarmer = () => {
  const { user, isFarmer } = useAuth();
  
  const {
    farmer,
    dashboard,
    isProfileComplete,
    plots,
    activeCrops,
    cropCalendar,
    memberships,
    isLoading,
    error,
    loadFarmerProfile,
    loadDashboard,
    updateFarmer,
    loadPlots,
    createPlot,
    updatePlot,
    deletePlot,
    loadActiveCrops,
    loadCropCalendar,
    createCropPlan,
    loadMemberships,
  } = useFarmerStore();

  // Auto-load farmer profile when user is a farmer
  useEffect(() => {
    if (isFarmer && user && !farmer) {
      loadFarmerProfile();
    }
  }, [isFarmer, user, farmer]);

  return {
    // Data
    farmer,
    dashboard,
    isProfileComplete,
    plots,
    activeCrops,
    cropCalendar,
    memberships,
    
    // State
    isLoading,
    error,
    
    // Actions
    loadFarmerProfile,
    loadDashboard,
    updateFarmer,
    loadPlots,
    createPlot,
    updatePlot,
    deletePlot,
    loadActiveCrops,
    loadCropCalendar,
    createCropPlan,
    loadMemberships,
    
    // Helper methods
    getTotalLandArea: () => farmer?.total_land_area || 0,
    getIrrigatedLand: () => farmer?.irrigated_land || 0,
    getRainFedLand: () => farmer?.rain_fed_land || 0,
    getFarmerCategory: () => farmer?.farmer_category || 'marginal',
    hasKCC: () => farmer?.has_kisan_credit_card || false,
    hasPMFBY: () => farmer?.has_pmfby_insurance || false,
    hasPMKisan: () => farmer?.has_pm_kisan || false,
  };
};