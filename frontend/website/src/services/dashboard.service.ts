import api from './api';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardService = {
  // Admin Dashboard
  getAdminStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await api.get('/users/admin/statistics/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch stats' };
    }
  },

  // FPO Dashboard
  getFPOStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await api.get('/fpos/fpos/statistics/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch stats' };
    }
  },

  // Retailer Dashboard
  getRetailerStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await api.get('/retailers/retailers/statistics/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch stats' };
    }
  },

  // Processor Dashboard
  getProcessorStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await api.get('/processors/processors/statistics/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch stats' };
    }
  },
};