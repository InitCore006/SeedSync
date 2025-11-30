import { create } from 'zustand';
import { WalletBalance, Transaction, PaymentMethod } from '@/types/wallet.types';

interface WalletState {
  balance: WalletBalance;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBalance: (balance: WalletBalance) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: { available: 0, pending: 0, total: 0 },
  transactions: [],
  paymentMethods: [],
  isLoading: false,
  error: null,

  setBalance: (balance) => set({ balance }),
  
  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  
  setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));