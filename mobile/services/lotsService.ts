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

  // Get single lot
  getLot: (id: number): Promise<AxiosResponse<ProcurementLot>> => {
    return api.get(ENDPOINTS.LOTS.DETAIL(id));
  },

  // Create new lot
  createLot: (data: {
    crop_type: string;
    quantity_quintals: number;
    quality_grade: string;
    expected_price_per_quintal: number;
    harvest_date: string;
    moisture_content?: number;
    oil_content?: number;
    storage_location: string;
  }): Promise<AxiosResponse<ProcurementLot>> => {
    return api.post(ENDPOINTS.LOTS.CREATE, data);
  },

  // Update lot
  updateLot: (id: number, data: Partial<ProcurementLot>): Promise<AxiosResponse<ProcurementLot>> => {
    return api.patch(ENDPOINTS.LOTS.UPDATE(id), data);
  },

  // Delete lot
  deleteLot: (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(ENDPOINTS.LOTS.DELETE(id));
  },

  // Upload image
  uploadImage: (lotId: number, imageUri: string): Promise<AxiosResponse<any>> => {
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
