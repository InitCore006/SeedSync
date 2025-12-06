import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { TraceabilityData, BlockchainTransaction, ApiSuccess } from '@/types/api';
import { AxiosResponse } from 'axios';

export const blockchainAPI = {
  /**
   * Generate QR code for a lot
   */
  generateQRCode: (lotId: number): Promise<AxiosResponse<{ qr_code_url: string }>> => {
    return api.post(ENDPOINTS.BLOCKCHAIN.GENERATE_QR(lotId));
  },

  /**
   * Get traceability data for a lot
   */
  getTrace: (lotId: number): Promise<AxiosResponse<TraceabilityData>> => {
    return api.get(ENDPOINTS.BLOCKCHAIN.GET_TRACE(lotId));
  },

  /**
   * Get certificate for a lot
   */
  getCertificate: (lotId: number): Promise<AxiosResponse<Blob>> => {
    return api.get(ENDPOINTS.BLOCKCHAIN.GET_CERTIFICATE(lotId), {
      responseType: 'blob',
    });
  },

  /**
   * Add blockchain entry (mock for hackathon)
   */
  addBlockchainEntry: (data: {
    lot_id: number;
    transaction_type: 'created' | 'procured' | 'shipped' | 'received' | 'processed';
    location?: string;
  }): Promise<AxiosResponse<ApiSuccess<BlockchainTransaction>>> => {
    // Mock blockchain transaction - in production this would interact with actual blockchain
    return api.post('/blockchain/add-entry/', data);
  },
};
