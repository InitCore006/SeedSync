import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  FarmerWithDetails,
  FarmerDashboard,
  UpdateFarmerRequest,
} from '@/types/auth.types';

export const farmerService = {
  // ============================================================================
  // FARMER PROFILE
  // ============================================================================

  async getProfile(): Promise<FarmerWithDetails> {
    const response = await apiClient.get<FarmerWithDetails>(
      API_ENDPOINTS.FARMER.ME
    );
    return response.data;
  },

  async getDashboard(): Promise<FarmerDashboard> {
    const response = await apiClient.get<FarmerDashboard>(
      API_ENDPOINTS.FARMER.DASHBOARD
    );
    return response.data;
  },

  async updateFarmer(id: string, data: UpdateFarmerRequest): Promise<FarmerWithDetails> {
    const response = await apiClient.patch<FarmerWithDetails>(
      API_ENDPOINTS.FARMER.UPDATE(id),
      data
    );
    return response.data;
  },

  // ============================================================================
  // FARM PLOTS
  // ============================================================================

  async getMyPlots() {
    const response = await apiClient.get(API_ENDPOINTS.PLOTS.MY_PLOTS);
    return response.data;
  },

  async createPlot(data: any) {
    const response = await apiClient.post(API_ENDPOINTS.PLOTS.CREATE, data);
    return response.data;
  },

  async updatePlot(id: string, data: any) {
    const response = await apiClient.patch(API_ENDPOINTS.PLOTS.UPDATE(id), data);
    return response.data;
  },

  async deletePlot(id: string) {
    await apiClient.delete(API_ENDPOINTS.PLOTS.DELETE(id));
  },

  // ============================================================================
  // CROP PLANNING
  // ============================================================================

  async getActiveCrops() {
    const response = await apiClient.get(API_ENDPOINTS.CROP_PLANNING.ACTIVE);
    return response.data;
  },

  async getCropCalendar() {
    const response = await apiClient.get(API_ENDPOINTS.CROP_PLANNING.CALENDAR);
    return response.data;
  },

  async createCropPlan(data: any) {
    const response = await apiClient.post(API_ENDPOINTS.CROP_PLANNING.CREATE, data);
    return response.data;
  },

  async updateCropPlan(id: string, data: any) {
    const response = await apiClient.patch(
      API_ENDPOINTS.CROP_PLANNING.UPDATE(id),
      data
    );
    return response.data;
  },

  async updateCropStatus(id: string, status: string) {
    const response = await apiClient.post(
      API_ENDPOINTS.CROP_PLANNING.UPDATE_STATUS(id),
      { status }
    );
    return response.data;
  },

  async recordHarvest(id: string, data: any) {
    const response = await apiClient.post(
      API_ENDPOINTS.CROP_PLANNING.RECORD_HARVEST(id),
      data
    );
    return response.data;
  },

  // ============================================================================
  // FPO MEMBERSHIPS
  // ============================================================================

  async getMyMemberships() {
    const response = await apiClient.get(API_ENDPOINTS.FPO.MY_MEMBERSHIPS);
    return response.data;
  },
};