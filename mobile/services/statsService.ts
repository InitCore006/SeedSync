import api from './api';

export interface FarmerStats {
  total_lots_created: number;
  total_quantity_sold_quintals: number;
  total_earnings: number;
  total_farmland_acres: number;
  farmland_count: number;
  active_crops: number;
  active_lots?: number;
  pending_bids?: number;
}

export interface LogisticsStats {
  total_vehicles: number;
  total_shipments: number;
  active_shipments: number;
  completed_shipments: number;
  is_verified: boolean;
}

class StatsService {
  async getFarmerStats(farmerId: number): Promise<FarmerStats> {
    try {
      const response = await api.get(`/api/farmers/profiles/${farmerId}/stats/`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch farmer stats');
    } catch (error: any) {
      console.error('Error fetching farmer stats:', error);
      throw error;
    }
  }

  async getLogisticsStats(logisticsId: number): Promise<LogisticsStats> {
    try {
      const response = await api.get(`/api/logistics/partners/${logisticsId}/stats/`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch logistics stats');
    } catch (error: any) {
      console.error('Error fetching logistics stats:', error);
      throw error;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatNumber(num: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    }).format(num);
  }

  formatQuintals(quintals: number): string {
    return `${this.formatNumber(quintals, 2)} Q`;
  }

  formatAcres(acres: number): string {
    return `${this.formatNumber(acres, 2)} acres`;
  }
}

export const statsService = new StatsService();
