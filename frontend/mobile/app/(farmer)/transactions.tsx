import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/farmer/useTransactions';
import { TransactionCard } from '@/components/farmer/TransactionCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';
import { formatCurrency } from '@lib/utils/format';

const TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
];

export default function TransactionsScreen() {
  const [selectedTab, setSelectedTab] = useState('ALL');

  const {
    transactions,
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    totalEarnings,
    thisMonthEarnings,
    transactionsLoading,
    refreshing,
    refresh,
  } = useTransactions();

  const getFilteredTransactions = () => {
    switch (selectedTab) {
      case 'COMPLETED':
        return completedTransactions;
      case 'PENDING':
        return pendingTransactions;
      case 'FAILED':
        return failedTransactions;
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity onPress={refresh}>
          <Ionicons name="refresh" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Earnings Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalEarnings)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(thisMonthEarnings)}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === item.value && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(item.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === item.value && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Transactions List */}
      {transactionsLoading && !transactions.length ? (
        <LoadingSpinner fullScreen message="Loading transactions..." />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={() => {
                // Navigate to transaction details
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="wallet-outline"
              title="No Transactions"
              description="You don't have any transactions yet. Start selling to see your transactions here."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },

  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },

  summaryContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background.default,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  summaryValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
  },

  tabsContainer: {
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  tabsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: colors.primary[500],
  },

  tabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },

  tabTextActive: {
    color: colors.text.inverse,
  },

  listContent: {
    padding: spacing.lg,
  },
});