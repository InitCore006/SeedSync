import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { Bid, MyBidsResponse, PaginatedResponse } from '@/types/api';
import { AxiosResponse } from 'axios';

export const bidsAPI = {
  // Get all bids
  getBids: (): Promise<AxiosResponse<PaginatedResponse<Bid>>> => {
    return api.get(ENDPOINTS.BIDS.LIST);
  },

  // Get my bids (received and sent)
  getMyBids: (): Promise<AxiosResponse<MyBidsResponse>> => {
    return api.get(ENDPOINTS.BIDS.MY_BIDS);
  },

  // Get bids for a specific lot
  getLotBids: (lotId: number): Promise<AxiosResponse<PaginatedResponse<Bid>>> => {
    return api.get(ENDPOINTS.BIDS.LOT_BIDS(lotId));
  },

  // Create new bid
  createBid: (data: {
    lot: number;
    offered_price_per_quintal: number;
    payment_terms?: string;
  }): Promise<AxiosResponse<Bid>> => {
    return api.post(ENDPOINTS.BIDS.CREATE, data);
  },

  // Accept bid
  acceptBid: (id: number): Promise<AxiosResponse<Bid>> => {
    return api.post(ENDPOINTS.BIDS.ACCEPT(id));
  },

  // Reject bid
  rejectBid: (id: number): Promise<AxiosResponse<Bid>> => {
    return api.post(ENDPOINTS.BIDS.REJECT(id));
  },
};
