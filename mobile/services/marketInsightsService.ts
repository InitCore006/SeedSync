import api from './api';
import { AxiosResponse } from 'axios';

export interface TopCrop {
  crop: string;
  average_price: string;
  market_demand: string;
}

export interface Recommendation {
  action: 'Wait & Watch' | 'Sell Soon' | 'Flexible' | 'Monitor Market';
  message: string;
  suggestion?: string;
  best_time_to_sell?: string;
}

export interface MarketSummary {
  total_market_value: string;
  average_price: string;
  total_quantity: string;
  total_transactions: number;
}

export interface FarmerInsights {
  summary: MarketSummary;
  price_today: string;
  price_expected_30_days: string;
  recommendation: Recommendation;
  top_crops_by_price: TopCrop[];
  seasonal_tip: string;
  best_season: string;
}

export interface MarketForecastResponse {
  success: boolean;
  role: string;
  insights: FarmerInsights;
}

export interface PriceRange {
  min: string;
  max: string;
}

export interface CropForecast {
  crop: string;
  current_price: string;
  expected_price_30_days: string;
  price_change: string;
  trend: 'BULLISH' | 'BEARISH' | 'STABLE';
  recommendation: string;
  price_range: PriceRange;
}

export interface AllCropsForecastResponse {
  success: boolean;
  total_crops: number;
  forecasts: CropForecast[];
  market_summary: {
    bullish_crops: string[];
    bearish_crops: string[];
    stable_crops: string[];
  };
  quick_insights: {
    buy_now: string[];
    wait_for_better_prices: string[];
    neutral: string[];
  };
}

export interface DemandForecastResponse {
  success: boolean;
  forecast: {
    current_demand: string;
    expected_demand: string;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    total_30_days: string;
  };
}

export const marketInsightsService = {
  /**
   * Get market forecast based on user role
   */
  getMarketForecast: async (
    role: 'fpo' | 'retailer' | 'processor' | 'farmer'
  ): Promise<MarketForecastResponse> => {
    try {
      const response: AxiosResponse<MarketForecastResponse> = await api.get(
        '/advisories/market-forecast/', 
        { params: { role } }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch market forecast'
      );
    }
  },

  /**
   * Get price forecasts for all crops
   */
  getAllCropsForecast: async (
    days: number = 30,
    topCrops: number = 5
  ): Promise<AllCropsForecastResponse> => {
    try {
      const response: AxiosResponse<AllCropsForecastResponse> = await api.get(
        '/advisories/all-crops-forecast/',
        { params: { days, top_crops: topCrops } }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch all crops forecast'
      );
    }
  },

  /**
   * Get forecast for a specific crop
   */
  getCropForecast: async (
    cropType: string,
    days: number = 30
  ): Promise<{ success: boolean; forecast: CropForecast }> => {
    try {
      const response = await api.get(
        '/advisories/crop-forecast/',
        { params: { crop_type: cropType, days } }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch crop forecast'
      );
    }
  },

  /**
   * Get demand forecast
   */
  getDemandForecast: async (): Promise<DemandForecastResponse> => {
    try {
      const response: AxiosResponse<DemandForecastResponse> = await api.get(
        '/advisories/quick/demand/'
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch demand forecast'
      );
    }
  },
};
