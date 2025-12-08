import api from './api';
import { AxiosResponse } from 'axios';

export interface MarketInsightsResponse {
  data_available: boolean;
  total_orders: number;
  date_range: {
    start: string | null;
    end: string | null;
  };
  market_summary: {
    actual: Record<string, any>;
    forecast: Record<string, any>;
  };
  role_insights: {
    buyer_demand_by_crop?: Record<string, any>;
    state_crop_demand?: Record<string, any>;
    price_trends?: Record<string, any>;
    monthly_demand_seasonality?: Record<string, any>;
    procurement_volume_by_state?: Record<string, any>;
    completion_rates?: Record<string, any>;
  };
  farmer_insights?: {
    market_shortages: Record<string, any>;
    best_price_crops: Record<string, any>;
    forecast_shortages: Record<string, any>;
    forecast_best_prices: Record<string, any>;
  };
}

export const marketInsightsService = {
  /**
   * Get market insights based on user role
   */
  getMarketInsights: async (
    role?: 'fpo' | 'retailer' | 'processor' | 'farmer'
  ): Promise<MarketInsightsResponse> => {
    try {
      const params = role ? { role } : {};
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MarketInsightsResponse;
      }> = await api.get('/advisories/market-insights/', { params });

      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch market insights'
      );
    }
  },
};
