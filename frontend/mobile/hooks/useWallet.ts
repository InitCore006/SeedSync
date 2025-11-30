import { useEffect, useCallback } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { walletService } from '@/services/wallet.service';

export const useWallet = () => {
  const {
    balance,
    transactions,
    paymentMethods,
    isLoading,
    error,
    setBalance,
    setTransactions,
    addTransaction,
    setPaymentMethods,
    setLoading,
    setError,
  } = useWalletStore();

  const loadWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [balanceData, transactionsData, methodsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
        walletService.getPaymentMethods(),
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData);
      setPaymentMethods(methodsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, [setBalance, setTransactions, setPaymentMethods, setLoading, setError]);

  const addMoneyToWallet = useCallback(
    async (amount: number, methodId: string) => {
      try {
        setLoading(true);
        setError(null);
        
        const transaction = await walletService.addMoney(amount, methodId);
        addTransaction(transaction);
        
        // Reload balance
        const newBalance = await walletService.getBalance();
        setBalance(newBalance);
        
        return transaction;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add money');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addTransaction, setBalance, setLoading, setError]
  );

  const withdrawMoney = useCallback(
    async (amount: number, methodId: string) => {
      try {
        setLoading(true);
        setError(null);
        
        const transaction = await walletService.withdraw(amount, methodId);
        addTransaction(transaction);
        
        // Reload balance
        const newBalance = await walletService.getBalance();
        setBalance(newBalance);
        
        return transaction;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to withdraw money');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addTransaction, setBalance, setLoading, setError]
  );

  useEffect(() => {
    loadWalletData();
  }, []);

  return {
    balance,
    transactions,
    paymentMethods,
    isLoading,
    error,
    loadWalletData,
    addMoneyToWallet,
    withdrawMoney,
  };
};