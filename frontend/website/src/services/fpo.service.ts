import api from './api';
import { FPO, ApiResponse } from '../types';

export const fpoService = {
  // Multi-step registration
  registerStep1: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/fpos/register/step1/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 1 failed' };
    }
  },

  registerStep2: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/fpos/register/step2/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 2 failed' };
    }
  },

  registerStep3: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/fpos/register/step3/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 3 failed' };
    }
  },

  // Single-step registration
  register: async (data: any): Promise<ApiResponse<FPO>> => {
    try {
      const response = await api.post('/fpos/register/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Registration failed' };
    }
  },

  // Get my FPO
  getMyFPO: async (): Promise<ApiResponse<FPO>> => {
    try {
      const response = await api.get('/fpos/fpos/my_fpo/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch FPO' };
    }
  },

  // Get all FPOs
  getAllFPOs: async (filters?: Record<string, string>): Promise<ApiResponse<FPO[]>> => {
    try {
      const response = await api.get('/fpos/fpos/', { params: filters });
      return { data: response.data.results || response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch FPOs' };
    }
  },
};