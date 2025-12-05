import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { AxiosResponse } from 'axios';

export const blockchainAPI = {
  // Generate QR code for lot
  generateQR: (lotId: number): Promise<AxiosResponse<any>> => {
    return api.post(ENDPOINTS.BLOCKCHAIN.GENERATE_QR(lotId));
  },

  // Get trace/journey of lot
  getTrace: (lotId: number): Promise<AxiosResponse<any>> => {
    return api.get(ENDPOINTS.BLOCKCHAIN.GET_TRACE(lotId));
  },
};
