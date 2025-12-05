import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { AxiosResponse } from 'axios';

export const fpoAPI = {
  // Get nearby FPOs
  getNearbyFPOs: (
    latitude: number,
    longitude: number,
    radius: number = 50
  ): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.FPO.NEARBY, {
      params: { latitude, longitude, radius },
    });
  },
};
