/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { Retailer, ApiResponse } from '../types';

export const retailerService = {
  // Multi-step registration
  registerStep1: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/retailers/register/step1/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 1 failed' };
    }
  },

  registerStep2: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/retailers/register/step2/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 2 failed' };
    }
  },

  registerStep3: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/retailers/register/step3/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 3 failed' };
    }
  },

  // Single-step registration
  register: async (data: any): Promise<ApiResponse<Retailer>> => {
    try {
      const response = await api.post('/retailers/register/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Registration failed' };
    }
  },

  // Get my retailer profile
  getMyProfile: async (): Promise<ApiResponse<Retailer>> => {
    try {
      const response = await api.get('/retailers/retailers/my_profile/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch profile' };
    }
  },

  // Get all retailers
  getAllRetailers: async (filters?: Record<string, string>): Promise<ApiResponse<Retailer[]>> => {
    try {
      const response = await api.get('/retailers/retailers/', { params: filters });
      return { data: response.data.results || response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch retailers' };
    }
  },

  // Get retailer by ID
  getRetailer: async (id: string): Promise<ApiResponse<Retailer>> => {
    try {
      const response = await api.get(`/retailers/retailers/${id}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch retailer' };
    }
  },

  // Update retailer
  update: async (id: string, data: Partial<any>): Promise<ApiResponse<Retailer>> => {
    try {
      const response = await api.patch(`/retailers/retailers/${id}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Update failed' };
    }
  },
};