import api from './api';
import { ENDPOINTS } from '@/constants/config';
import {
  FarmerProfile,
  FarmerProfileCreateData,
  MandiPrice,
  MSPRecord,
  WeatherData,
  WeatherAlert,
  CropAdvisory,
  DiseaseDetectionResult,
  FPOProfile,
  PaginatedResponse,
  ApiSuccess,
} from '@/types/api';
import { AxiosResponse } from 'axios';

export const farmersAPI = {
  // ============================================
  // FARMER PROFILE
  // ============================================

  /**
   * Get my farmer profile
   */
  getMyProfile: (): Promise<AxiosResponse<ApiSuccess<FarmerProfile>>> => {
    return api.get(ENDPOINTS.FARMERS.MY_PROFILE);
  },

  /**
   * Create farmer profile (after registration)
   */
  createProfile: (data: FarmerProfileCreateData): Promise<AxiosResponse<ApiSuccess<FarmerProfile>>> => {
    return api.post(ENDPOINTS.FARMERS.PROFILE, data);
  },

  /**
   * Update farmer profile
   */
  updateProfile: (id: string, data: FormData | Partial<FarmerProfile>): Promise<AxiosResponse<ApiSuccess<FarmerProfile>>> => {
    return api.put(`${ENDPOINTS.FARMERS.PROFILE}${id}/`, data, {
      headers: data instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });
  },

  /**
   * Get farmer statistics
   */
  getStats: (): Promise<
    AxiosResponse<{
      total_lots_created: number;
      total_quantity_sold_quintals: number;
      total_earnings: number;
      total_farmland_acres: number;
      farmland_count: number;
      active_crops: number;
      active_lots: number;
      pending_bids: number;
    }>
  > => {
    return api.get(ENDPOINTS.FARMERS.MY_STATS);
  },

  // ============================================
  // MARKET PRICES
  // ============================================

  /**
   * Get live mandi prices
   */
  getMarketPrices: (params: {
    crop_type: string;
    state?: string;
    district?: string;
  }): Promise<
    AxiosResponse<{
      mandi_prices: MandiPrice[];
      msp_records: MSPRecord[];
      price_trend: Array<{ date: string; modal_price: number }>;
    }>
  > => {
    return api.get(ENDPOINTS.FARMERS.MARKET_PRICES, { params });
  },

  // ============================================
  // WEATHER ADVISORY
  // ============================================

  /**
   * Get 5-day weather forecast
   */
  getWeatherAdvisory: (params: {
    latitude: number;
    longitude: number;
  }): Promise<
    AxiosResponse<{
      forecast: WeatherData[];
      alerts: WeatherAlert[];
      crop_advisory: CropAdvisory[];
    }>
  > => {
    return api.get(ENDPOINTS.FARMERS.WEATHER_ADVISORY, { params });
  },

  // ============================================
  // DISEASE DETECTION
  // ============================================

  /**
   * Detect crop disease from image
   */
  detectDisease: (imageUri: string, cropType: string): Promise<AxiosResponse<DiseaseDetectionResult>> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'disease.jpg';

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    formData.append('crop_type', cropType);

    return api.post(ENDPOINTS.FARMERS.DISEASE_DETECTION, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get disease detection history
   */
  getDiseaseHistory: (): Promise<
    AxiosResponse<
      Array<{
        id: number;
        crop_type: string;
        detected_disease: string;
        confidence_score: number;
        thumbnail_image: string;
        detected_at: string;
      }>
    >
  > => {
    return api.get('/farmers/disease-history/');
  },

  // ============================================
  // NEARBY FPO FINDER
  // ============================================

  /**
   * Get nearby FPOs
   */
  getNearbyFPOs: (params: {
    latitude: number;
    longitude: number;
    radius_km?: number;
  }): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.FARMERS.NEARBY_FPOS, { params });
  },

  /**
   * Send join request to FPO
   */
  sendFPOJoinRequest: (data: {
    fpo_id: string;
    message?: string;
  }): Promise<AxiosResponse<any>> => {
    return api.post(ENDPOINTS.FARMERS.NEARBY_FPOS, data);
  },

  /**
   * Get my FPO join requests
   */
  getMyJoinRequests: (): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.FARMERS.JOIN_REQUESTS);
  },

  // ============================================
  // YIELD PREDICTION
  // ============================================

  /**
   * Get yield prediction
   */
  getYieldPrediction: (data: {
    crop_type: string;
    land_acres: number;
    soil_type?: string;
    season?: string;
  }): Promise<
    AxiosResponse<{
      predicted_yield_quintals: number;
      confidence: number;
      factors: string[];
    }>
  > => {
    return api.post(ENDPOINTS.FARMERS.YIELD_PREDICTION, data);
  },

  // ============================================
  // FARMLAND MANAGEMENT
  // ============================================

  /**
   * Get all farmlands
   */
  getFarmlands: (): Promise<AxiosResponse<PaginatedResponse<any>>> => {
    return api.get(ENDPOINTS.FARMERS.FARMLANDS);
  },

  /**
   * Add new farmland
   */
  addFarmland: (data: {
    land_name: string;
    area_acres: number;
    soil_type: string;
    irrigation_available: boolean;
    latitude?: number;
    longitude?: number;
  }): Promise<AxiosResponse<any>> => {
    return api.post(ENDPOINTS.FARMERS.FARMLANDS, data);
  },
};
