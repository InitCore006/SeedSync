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
  }): Promise<AxiosResponse<ApiSuccess<Payment[]>>> => {
    return api.get(ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params });
  },

  /**
   * Get wallet balance and summary
   */
  getMyWallet: (): Promise<AxiosResponse<ApiSuccess<{
    balance: string;
    pending_payments: string;
    total_earned: string;
    currency: string;
  }>>> => {
    return api.get(ENDPOINTS.PAYMENTS.MY_WALLET);
  },

  /**
   * Get payment details by ID
   */
  getPaymentDetail: (id: number): Promise<AxiosResponse<ApiSuccess<Payment>>> => {
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

  /**
   * Process wallet payment
   */
  processWalletPayment: (paymentId: string): Promise<AxiosResponse<ApiSuccess<any>>> => {
    return api.post('/wallets/process_payment/', { payment_id: paymentId });
  },

  /**
   * Get pending payments (for payer)
   */
  getPendingPayments: (): Promise<AxiosResponse<ApiSuccess<Payment[]>>> => {
    return api.get('/wallets/pending_payments/');
  },

  /**
   * Get farmer earnings and payment history
   */
  getFarmerEarnings: (): Promise<AxiosResponse<ApiSuccess<{
    payments: Payment[];
    summary: {
      total_earnings: string;
      pending_payments: string;
      total_payments: number;
      completed_payments: number;
    };
  }>>> => {
    return api.get(ENDPOINTS.PAYMENTS.FARMER_EARNINGS);
  },

  /**
   * Get payment by ID (alternative method)
   */
  getPaymentById: (id: number): Promise<AxiosResponse<ApiSuccess<Payment>>> => {
    return api.get(ENDPOINTS.PAYMENTS.DETAIL(id));
  },
};
