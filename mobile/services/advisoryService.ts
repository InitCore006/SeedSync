import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { AxiosResponse } from 'axios';

export const advisoryAPI = {
  // Get weather forecast
  getWeather: (latitude: number, longitude: number): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.ADVISORY.WEATHER, {
      params: { latitude, longitude },
    });
  },

  // Get crop-specific advisory
  getCropAdvisory: (crop_type: string): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.ADVISORY.CROP_ADVISORY, {
      params: { crop_type },
    });
  },
};
