import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { ProcurementLot, PaginatedResponse } from '@/types/api';
import { AxiosResponse } from 'axios';

export const lotsAPI = {
  // Get all lots
  getLots: (params?: {
    crop_type?: string;
    status?: string;
    quality_grade?: string;
  }): Promise<AxiosResponse<PaginatedResponse<ProcurementLot>>> => {
    return api.get(ENDPOINTS.LOTS.LIST, { params });
  },

  // Get my lots
  getMyLots: (): Promise<AxiosResponse<PaginatedResponse<ProcurementLot>>> => {
    return api.get(ENDPOINTS.LOTS.MY_LOTS);
  },

  // Get marketplace lots
  getMarketplaceLots: (): Promise<AxiosResponse<PaginatedResponse<ProcurementLot>>> => {
    return api.get(ENDPOINTS.LOTS.MARKETPLACE);
  },

  // Get single lot
  getLot: (id: string): Promise<AxiosResponse<ProcurementLot>> => {
    return api.get(ENDPOINTS.LOTS.DETAIL(id));
  },

  // Create new lot with FormData (includes images)
  createLot: (formData: FormData): Promise<AxiosResponse<ProcurementLot>> => {
    return api.post(ENDPOINTS.LOTS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update lot (without images)
  updateLot: (id: string, data: {
    crop_type?: string;
    crop_master_code?: string;
    crop_variety?: string;
    crop_variety_code?: string;
    quantity_quintals?: number;
    quality_grade?: string;
    expected_price_per_quintal?: number;
    harvest_date?: string;
    moisture_content?: number;
    oil_content?: number;
    description?: string;
    storage_conditions?: string;
    organic_certified?: boolean;
    pickup_address?: string;
  }): Promise<AxiosResponse<ProcurementLot>> => {
    return api.patch(ENDPOINTS.LOTS.UPDATE(id), data);
  },

  // Delete lot
  deleteLot: (id: string): Promise<AxiosResponse<void>> => {
    return api.delete(ENDPOINTS.LOTS.DELETE(id));
  },

  // Upload image to existing lot
  uploadImage: (lotId: string, imageUri: string, caption?: string): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);
    
    if (caption) {
      formData.append('caption', caption);
    }

    return api.post(ENDPOINTS.LOTS.UPLOAD_IMAGE(lotId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update lot status
  updateStatus: (id: string, status: string, remarks?: string): Promise<AxiosResponse<any>> => {
    return api.post(`/lots/procurement/${id}/update_status/`, {
      status,
      remarks,
    });
  },
  
  // Increment view count
  incrementViews: (id: string): Promise<AxiosResponse<void>> => {
    return api.post(`/lots/procurement/${id}/increment_views/`, {});
  },

  // Get market prices
  getMarketPrices: (crop_type: string): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.LOTS.MARKET_PRICES, {
      params: { crop_type },
    });
  },
};
