import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { Bid, BidCreateData, MyBidsResponse, PaginatedResponse, ApiSuccess } from '@/types/api';
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
  getLotBids: (lotId: string): Promise<AxiosResponse<PaginatedResponse<Bid>>> => {
    return api.get(ENDPOINTS.BIDS.LOT_BIDS(lotId));
  },

  // Get bid details
  getBidDetail: (id: number): Promise<AxiosResponse<Bid>> => {
    return api.get(ENDPOINTS.BIDS.DETAIL(id));
  },

  // Create new bid
  createBid: (data: BidCreateData): Promise<AxiosResponse<Bid>> => {
    return api.post(ENDPOINTS.BIDS.CREATE, data);
  },

  // Accept bid
  acceptBid: (id: number, data?: { farmer_response?: string }): Promise<AxiosResponse<ApiSuccess<Bid>>> => {
    return api.post(ENDPOINTS.BIDS.ACCEPT(id), data || {});
  },

  // Reject bid
  rejectBid: (id: number, data?: { reason?: string }): Promise<AxiosResponse<ApiSuccess<Bid>>> => {
    return api.post(ENDPOINTS.BIDS.REJECT(id), data || {});
  },
};
