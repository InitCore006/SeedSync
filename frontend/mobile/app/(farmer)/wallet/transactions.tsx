import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import TransactionCard from '@/components/wallet/TransactionCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

type FilterType = 'all' | 'credit' | 'debit';

export default function TransactionsScreen() {
  const { transactions, isLoading, loadWalletData } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleTransactionPress = (transactionId: string) => {
    router.push({
      pathname: '/(farmer)/wallet/transaction-detail',
      params: { id: transactionId },
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>All Transactions</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Pressable
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterButton, filter === 'credit' && styles.filterButtonActive]}
          onPress={() => setFilter('credit')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'credit' && styles.filterButtonTextActive,
            ]}
          >
            💰 Credit
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterButton, filter === 'debit' && styles.filterButtonActive]}
          onPress={() => setFilter('debit')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'debit' && styles.filterButtonTextActive,
            ]}
          >
            💸 Debit
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && <LoadingSpinner />}

        {!isLoading && filteredTransactions.length === 0 && (
          <EmptyState
            icon="📭"
            title="No transactions found"
            message="Your transaction history will appear here"
          />
        )}

        {!isLoading && filteredTransactions.length > 0 && (
          <>
            <Text style={styles.count}>
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? 's' : ''}
            </Text>
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  count: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
});