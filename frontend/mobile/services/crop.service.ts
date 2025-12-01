import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  Crop,
  CropInput,
  CropObservation,
  HarvestRecord,
  CropStatistics,
  CropFormData,
} from '@/types/crop.types';

export const cropService = {
  // ==================== CROPS ====================
  
  async getAllCrops(): Promise<Crop[]> {
    const response = await apiClient.get<Crop[]>(API_ENDPOINTS.CROPS.LIST);
    return response.data;
  },

  async getMyCrops(): Promise<Crop[]> {
    const response = await apiClient.get<Crop[]>(API_ENDPOINTS.CROPS.MY_CROPS);
    return response.data;
  },

  async getCropById(id: string): Promise<Crop> {
    const response = await apiClient.get<Crop>(API_ENDPOINTS.CROPS.DETAIL(id));
    return response.data;
  },

  async createCrop(data: CropFormData): Promise<Crop> {
    const response = await apiClient.post<Crop>(API_ENDPOINTS.CROPS.CREATE, data);
    return response.data;
  },

  async updateCrop(id: string, data: Partial<CropFormData>): Promise<Crop> {
    const response = await apiClient.patch<Crop>(API_ENDPOINTS.CROPS.UPDATE(id), data);
    return response.data;
  },

  async deleteCrop(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CROPS.DELETE(id));
  },

  async getStatistics(): Promise<CropStatistics> {
    const response = await apiClient.get<CropStatistics>(API_ENDPOINTS.CROPS.STATISTICS);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Crop> {
    const response = await apiClient.post<Crop>(
      API_ENDPOINTS.CROPS.UPDATE_STATUS(id),
      { status }
    );
    return response.data;
  },

  async getCropTimeline(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.CROPS.TIMELINE(id));
    return response.data;
  },

  // ==================== INPUTS ====================
  
  async getCropInputs(cropId: string): Promise<CropInput[]> {
    const response = await apiClient.get<CropInput[]>(
      API_ENDPOINTS.CROPS.INPUT_BY_CROP,
      { params: { crop_id: cropId } }
    );
    return response.data;
  },

  async addCropInput(data: Partial<CropInput>): Promise<CropInput> {
    const response = await apiClient.post<CropInput>(API_ENDPOINTS.CROPS.INPUTS, data);
    return response.data;
  },

  async getInputCostSummary(cropId?: string): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.CROPS.INPUT_COST_SUMMARY,
      cropId ? { params: { crop_id: cropId } } : undefined
    );
    return response.data;
  },

  // ==================== OBSERVATIONS ====================
  
  async getCropObservations(cropId: string): Promise<CropObservation[]> {
    const response = await apiClient.get<CropObservation[]>(
      API_ENDPOINTS.CROPS.OBSERVATION_BY_CROP,
      { params: { crop_id: cropId } }
    );
    return response.data;
  },

  async addObservation(data: Partial<CropObservation>): Promise<CropObservation> {
    const response = await apiClient.post<CropObservation>(
      API_ENDPOINTS.CROPS.OBSERVATIONS,
      data
    );
    return response.data;
  },

  async getDiseaseAlerts(days: number = 7): Promise<CropObservation[]> {
    const response = await apiClient.get<CropObservation[]>(
      API_ENDPOINTS.CROPS.DISEASE_ALERTS,
      { params: { days } }
    );
    return response.data;
  },

  // ==================== HARVESTS ====================
  
  async getHarvestRecords(cropId?: string): Promise<HarvestRecord[]> {
    const response = await apiClient.get<HarvestRecord[]>(
      API_ENDPOINTS.CROPS.HARVESTS,
      cropId ? { params: { crop: cropId } } : undefined
    );
    return response.data;
  },

  async addHarvest(data: Partial<HarvestRecord>): Promise<HarvestRecord> {
    const response = await apiClient.post<HarvestRecord>(
      API_ENDPOINTS.CROPS.HARVESTS,
      data
    );
    return response.data;
  },

  async getHarvestStatistics(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.CROPS.HARVEST_STATISTICS);
    return response.data;
  },
};