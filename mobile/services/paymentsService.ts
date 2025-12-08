import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { Payment, PaginatedResponse, ApiSuccess } from '@/types/api';
import { AxiosResponse } from 'axios';

export const paymentsAPI = {
  /**
   * Get all payments for the current user
   */
  getMyPayments: (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AxiosResponse<PaginatedResponse<Payment>>> => {
    return api.get(ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params });
  },

  /**
<<<<<<< Updated upstream
   * Get wallet balance and summary
   */
  getMyWallet: (): Promise<AxiosResponse<ApiSuccess<{
    balance: number;
    pending_payments: number;
    total_earned: number;
    currency: string;
  }>>> => {
    return api.get(ENDPOINTS.PAYMENTS.MY_WALLET);
  },

  /**
=======
>>>>>>> Stashed changes
   * Get payment details by ID
   */
  getPaymentDetail: (id: number): Promise<AxiosResponse<Payment>> => {
    return api.get(ENDPOINTS.PAYMENTS.DETAIL(id));
  },

  /**
   * Get all payments (admin/list view)
   */
  getAllPayments: (params?: {
    status?: string;
    payer?: number;
    payee?: number;
  }): Promise<AxiosResponse<PaginatedResponse<Payment>>> => {
    return api.get(ENDPOINTS.PAYMENTS.LIST, { params });
  },

  /**
   * Create a new payment
   */
  createPayment: (data: {
    bid: number;
    payment_method: 'bank_transfer' | 'upi' | 'razorpay';
    advance_payment_percentage?: number;
  }): Promise<AxiosResponse<Payment>> => {
    return api.post(ENDPOINTS.PAYMENTS.CREATE, data);
  },

  /**
   * Verify payment
   */
  verifyPayment: (id: number, data: {
    gateway_transaction_id: string;
  }): Promise<AxiosResponse<ApiSuccess<Payment>>> => {
    return api.post(ENDPOINTS.PAYMENTS.VERIFY(id), data);
  },
};
