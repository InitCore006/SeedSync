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
import BalanceCard from '@/components/wallet/BalanceCard';
import TransactionCard from '@/components/wallet/TransactionCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function WalletScreen() {
  const { balance, transactions, isLoading, loadWalletData } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My Wallet</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <>
            {/* Balance Card */}
            <BalanceCard balance={balance} />

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.addMoneyButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => router.push('/(farmer)/wallet/add-money')}
              >
                <Text style={styles.actionIcon}>💵</Text>
                <Text style={styles.actionText}>Add Money</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.withdrawButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => router.push('/(farmer)/wallet/withdraw')}
              >
                <Text style={styles.actionIcon}>🏦</Text>
                <Text style={styles.actionText}>Withdraw</Text>
              </Pressable>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <Pressable onPress={() => router.push('/(farmer)/wallet/transactions')}>
                  <Text style={styles.viewAllText}>View All →</Text>
                </Pressable>
              </View>

              {transactions.slice(0, 5).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => handleTransactionPress(transaction.id)}
                />
              ))}

              {transactions.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              )}
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  addMoneyButton: {
    backgroundColor: `${colors.success}20`,
  },
  withdrawButton: {
    backgroundColor: `${colors.accent}20`,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  transactionsSection: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});