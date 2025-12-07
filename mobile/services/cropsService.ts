import api from './api';
import { AxiosResponse } from 'axios';

// ==================== Interfaces ====================

export interface CropMaster {
  id: string;
  crop_code: string;
  crop_name: string;
  crop_name_display: string;
  hindi_name: string;
  scientific_name: string;
  oil_content_percentage: number;
  growing_season: string[];
  maturity_days: number;
  water_requirement: 'low' | 'medium' | 'high';
  suitable_soil_types: string[];
  suitable_states: string[];
  description: string;
  cultivation_tips: string;
  image_url?: string;
}

export interface CropVariety {
  id: string;
  crop_name: string;
  variety_name: string;
  variety_code: string;
  maturity_days: number;
  yield_potential_quintals_per_acre: number;
  oil_content_percentage: number;
  season: string;
  season_display: string;
  suitable_regions: string[];
  disease_resistance: string[];
  seed_rate_kg_per_acre?: number;
  description: string;
}

export interface CropMasterListResponse {
  crops: CropMaster[];
  total: number;
}

export interface CropVarietiesResponse {
  crop_code: string;
  crop_name: string;
  varieties: CropVariety[];
  total: number;
}

export interface VarietyRequestData {
  crop_type: string;
  variety_name: string;
  variety_code?: string;
  source?: string;
  reason: string;
  characteristics?: string;
  region?: string;
}

export interface VarietyRequestResponse {
  id: string;
  crop_type: string;
  crop_type_display: string;
  variety_name: string;
  variety_code: string;
  status: 'pending' | 'approved' | 'rejected' | 'duplicate';
  status_display: string;
  reason: string;
  admin_notes?: string;
  created_at: string;
}

// ==================== API Service ====================

export const cropsAPI = {
  /**
   * Get all government-registered crop masters
   */
  getCropMasters: (): Promise<AxiosResponse<CropMasterListResponse>> => {
    return api.get('/crops/master-list/');
  },

  /**
   * Get varieties for a specific crop by crop code
   */
  getCropVarieties: (cropCode: string): Promise<AxiosResponse<CropVarietiesResponse>> => {
    return api.get(`/crops/varieties-by-code/${cropCode}/`);
  },

  /**
   * Submit a request for a new crop variety
   */
  requestVariety: (data: VarietyRequestData): Promise<AxiosResponse<VarietyRequestResponse>> => {
    return api.post('/crops/variety-requests/', data);
  },

  /**
   * Get farmer's variety requests
   */
  getMyRequests: (): Promise<AxiosResponse<{ results: VarietyRequestResponse[] }>> => {
    return api.get('/crops/variety-requests/my_requests/');
  },
};

// ==================== Helper Functions ====================

export const getCropIcon = (cropName: string): string => {
  const icons: Record<string, string> = {
    soybean: '🫘',
    mustard: '🌼',
    groundnut: '🥜',
    sunflower: '🌻',
    safflower: '🌸',
    sesame: '🌾',
    linseed: '🌿',
    niger: '🌱',
  };
  return icons[cropName.toLowerCase()] || '🌾';
};

export const getWaterRequirementColor = (requirement: string): string => {
  switch (requirement) {
    case 'low':
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

export const formatMaturityDays = (days: number): string => {
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  if (months > 0 && remainingDays > 0) {
    return `${months}m ${remainingDays}d`;
  } else if (months > 0) {
    return `${months} months`;
  } else {
    return `${days} days`;
  }
};
