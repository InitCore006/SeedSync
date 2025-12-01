/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { Processor, ApiResponse } from '../types';

export const processorService = {
  // Multi-step registration
  registerStep1: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/processors/register/step1/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 1 failed' };
    }
  },

  registerStep2: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/processors/register/step2/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 2 failed' };
    }
  },

  registerStep3: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/processors/register/step3/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Step 3 failed' };
    }
  },

  // Single-step registration
  register: async (data: any): Promise<ApiResponse<Processor>> => {
    try {
      const response = await api.post('/processors/register/', data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Registration failed' };
    }
  },

  // Get my processor profile
  getMyProfile: async (): Promise<ApiResponse<Processor>> => {
    try {
      const response = await api.get('/processors/processors/my_profile/');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch profile' };
    }
  },

  // Get all processors
  getAllProcessors: async (filters?: Record<string, string>): Promise<ApiResponse<Processor[]>> => {
    try {
      const response = await api.get('/processors/processors/', { params: filters });
      return { data: response.data.results || response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch processors' };
    }
  },

  // Get processor by ID
  getProcessor: async (id: string): Promise<ApiResponse<Processor>> => {
    try {
      const response = await api.get(`/processors/processors/${id}/`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch processor' };
    }
  },

  // Update processor
  update: async (id: string, data: Partial<any>): Promise<ApiResponse<Processor>> => {
    try {
      const response = await api.patch(`/processors/processors/${id}/`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Update failed' };
    }
  },
};