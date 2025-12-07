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

  // Create new lot
  createLot: (data: {
    crop_type: string;
    crop_master_code?: string;
    crop_variety?: string;
    crop_variety_code?: string;
    quantity_quintals: number;
    quality_grade: string;
    expected_price_per_quintal: number;
    harvest_date: string;
    moisture_content?: number;
    oil_content?: number;
    description?: string;
    location_latitude?: number;
    location_longitude?: number;
    send_to_fpo_warehouse?: boolean;
  }): Promise<AxiosResponse<ProcurementLot>> => {
    return api.post(ENDPOINTS.LOTS.CREATE, data);
  },

  // Update lot
  updateLot: (id: string, data: Partial<ProcurementLot>): Promise<AxiosResponse<ProcurementLot>> => {
    return api.patch(ENDPOINTS.LOTS.UPDATE(id), data);
  },

  // Delete lot
  deleteLot: (id: string): Promise<AxiosResponse<void>> => {
    return api.delete(ENDPOINTS.LOTS.DELETE(id));
  },

  // Upload image
  uploadImage: (lotId: string, imageUri: string): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    return api.post(ENDPOINTS.LOTS.UPLOAD_IMAGE(lotId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get market prices
  getMarketPrices: (crop_type: string): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.LOTS.MARKET_PRICES, {
      params: { crop_type },
    });
  },
};
