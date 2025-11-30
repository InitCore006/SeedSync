import { WalletBalance, Transaction, PaymentMethod } from '@/types/wallet.types';

// Mock data
const MOCK_BALANCE: WalletBalance = {
  available: 45750.50,
  pending: 12000.00,
  total: 57750.50,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 25000,
    category: 'crop-sale',
    description: 'Wheat sale payment',
    date: '2024-11-25',
    status: 'completed',
    referenceNumber: 'TXN1234567890',
  },
  {
    id: '2',
    type: 'credit',
    amount: 15000,
    category: 'subsidy',
    description: 'PM-KISAN subsidy - 3rd installment',
    date: '2024-11-20',
    status: 'completed',
    referenceNumber: 'SUB9876543210',
  },
  {
    id: '3',
    type: 'debit',
    amount: 3500,
    category: 'expense',
    description: 'Fertilizer purchase',
    date: '2024-11-18',
    status: 'completed',
    referenceNumber: 'EXP1122334455',
  },
  {
    id: '4',
    type: 'debit',
    amount: 1200,
    category: 'transport',
    description: 'Transport booking - Delivery to mandi',
    date: '2024-11-15',
    status: 'completed',
    referenceNumber: 'TRP9988776655',
  },
  {
    id: '5',
    type: 'credit',
    amount: 12000,
    category: 'crop-sale',
    description: 'Rice sale payment',
    date: '2024-11-28',
    status: 'pending',
    referenceNumber: 'TXN5544332211',
  },
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    type: 'upi',
    name: 'Google Pay',
    identifier: 'farmer@oksbi',
    isDefault: true,
  },
  {
    id: '2',
    type: 'bank',
    name: 'State Bank of India',
    identifier: '****1234',
    isDefault: false,
  },
];

class WalletService {
  async getBalance(): Promise<WalletBalance> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_BALANCE;
  }

  async getTransactions(): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_TRANSACTIONS;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_PAYMENT_METHODS;
  }

  async addMoney(amount: number, methodId: string): Promise<Transaction> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'credit',
      amount,
      category: 'other',
      description: 'Money added to wallet',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      referenceNumber: `TXN${Date.now()}`,
    };

    return newTransaction;
  }

  async withdraw(amount: number, methodId: string): Promise<Transaction> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'debit',
      amount,
      category: 'other',
      description: 'Money withdrawn from wallet',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      referenceNumber: `WTH${Date.now()}`,
    };

    return newTransaction;
  }
}

export const walletService = new WalletService();