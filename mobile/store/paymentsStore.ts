import { create } from 'zustand';
import { Payment } from '@/types/api';

interface PaymentsState {
  payments: Payment[];
  selectedPayment: Payment | null;
  isLoading: boolean;
  
  // Actions
  setPayments: (payments: Payment[]) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: number, updates: Partial<Payment>) => void;
  setLoading: (loading: boolean) => void;
  clearPayments: () => void;
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  selectedPayment: null,
  isLoading: false,

  setPayments: (payments) => set({ payments }),
  
  setSelectedPayment: (payment) => set({ selectedPayment: payment }),
  
  addPayment: (payment) => set((state) => ({
    payments: [payment, ...state.payments],
  })),
  
  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map((payment) =>
      payment.id === id ? { ...payment, ...updates } : payment
    ),
    selectedPayment: state.selectedPayment?.id === id
      ? { ...state.selectedPayment, ...updates }
      : state.selectedPayment,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearPayments: () => set({ payments: [], selectedPayment: null }),
}));
