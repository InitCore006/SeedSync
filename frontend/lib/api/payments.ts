/**
 * Payment API Service
 * Handles all payment-related API calls
 */
import { api } from './client';

export interface Payment {
  id: string;
  payment_id: string;
  lot: string;
  bid: string;
  payer_id: string;
  payer_name: string;
  payer_type: 'fpo' | 'processor' | 'retailer';
  payee_id: string;
  payee_name: string;
  payee_account_number: string;
  payee_ifsc_code: string;
  gross_amount: number;
  commission_amount: number;
  commission_percentage: number;
  tax_amount: number;
  net_amount: number;
  payment_method: 'bank_transfer' | 'upi' | 'stripe' | 'razorpay' | 'cash' | 'cheque';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gateway_transaction_id: string;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  stripe_charge_id?: string;
  initiated_at: string;
  completed_at?: string;
  expected_date?: string;
  notes: string;
  receipt_url: string;
  created_at: string;
  updated_at: string;
}

export interface WalletData {
  balance: number;
  pending_payments: number;
  total_earned: number;
  currency: string;
}

export interface StripePaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  publishable_key: string;
}

export const paymentsAPI = {
  /**
   * Get all payments for the current user
   */
  getMyPayments: async () => {
    return api.get<Payment[]>('/payments/payments/my_payments/');
  },

  /**
   * Get wallet balance and summary
   */
  getMyWallet: async () => {
    return api.get<WalletData>('/payments/payments/my_wallet/');
  },

  /**
   * Get single payment details
   */
  getPayment: async (id: string) => {
    return api.get<Payment>(`/payments/${id}/`);
  },

  /**
   * Create Stripe payment intent
   */
  createStripePaymentIntent: async (paymentId: string) => {
    return api.post<StripePaymentIntent>('/payments/stripe/create-intent/', {
      payment_id: paymentId,
    });
  },

  /**
   * Get all payments (admin/filtered view)
   */
  getAllPayments: async (params?: {
    status?: string;
    payer?: string;
    payee?: string;
  }) => {
    return api.get<Payment[]>('/payments/', { params });
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (id: string, status: string, notes?: string) => {
    return api.patch<Payment>(`/payments/${id}/`, {
      status,
      notes,
    });
  },

  /**
   * Upload payment receipt
   */
  uploadReceipt: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    return api.patch<Payment>(`/payments/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Process wallet payment
   */
  processWalletPayment: async (paymentId: string) => {
    return api.post('/payments/wallets/process_payment/', {
      payment_id: paymentId,
    });
  },

  /**
   * Get pending payments (for payer - processor/FPO/retailer)
   */
  getPendingPayments: async () => {
    return api.get<Payment[]>('/payments/wallets/pending_payments/');
  },

  /**
   * Get farmer earnings and payment history
   */
  getFarmerEarnings: async () => {
    return api.get('/payments/wallets/farmer_earnings/');
  },
};
