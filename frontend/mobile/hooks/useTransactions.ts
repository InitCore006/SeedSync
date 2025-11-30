import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  lot_number: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payment_method: string;
  created_at: string;
  buyer_name?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for now
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      lot_number: 'LOT-2024-001',
      amount: 45000,
      status: 'COMPLETED',
      payment_method: 'Bank Transfer',
      created_at: new Date().toISOString(),
      buyer_name: 'Rajesh Trading Co.',
    },
    {
      id: '2',
      lot_number: 'LOT-2024-002',
      amount: 32000,
      status: 'PENDING',
      payment_method: 'UPI',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      buyer_name: 'Kumar Exports',
    },
    {
      id: '3',
      lot_number: 'LOT-2024-003',
      amount: 28000,
      status: 'PROCESSING',
      payment_method: 'Bank Transfer',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      buyer_name: 'Singh Traders',
    },
  ];

  const loadTransactions = async () => {
    setTransactionsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Load transactions error:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Filter transactions by status
  const completedTransactions = transactions.filter(
    (t) => t.status === 'COMPLETED'
  );
  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING');
  const failedTransactions = transactions.filter((t) => t.status === 'FAILED');

  // Calculate earnings
  const totalEarnings = completedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const thisMonthEarnings = completedTransactions
    .filter((t) => {
      const transactionDate = new Date(t.created_at);
      const now = new Date();
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    totalEarnings,
    thisMonthEarnings,
    transactionsLoading,
    refreshing,
    refresh,
    loadTransactions,
  };
};