export type TransactionType = 'credit' | 'debit';
export type TransactionCategory = 
  | 'crop-sale'
  | 'subsidy'
  | 'loan'
  | 'expense'
  | 'transport'
  | 'other';

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  referenceNumber?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'bank' | 'card';
  name: string;
  identifier: string; // UPI ID, Account Number, Card last 4 digits
  isDefault: boolean;
}