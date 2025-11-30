import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WalletBalance } from '@/types/wallet.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface BalanceCardProps {
  balance: WalletBalance;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💰</Text>
        <Text style={styles.headerTitle}>Wallet Balance</Text>
      </View>

      {/* Main Balance */}
      <View style={styles.mainBalance}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.balanceAmount}>
            {balance.available.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Balance Breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: colors.warning }]} />
          <View style={styles.breakdownContent}>
            <Text style={styles.breakdownLabel}>Pending</Text>
            <Text style={styles.breakdownValue}>₹{balance.pending.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: colors.primary }]} />
          <View style={styles.breakdownContent}>
            <Text style={styles.breakdownLabel}>Total</Text>
            <Text style={styles.breakdownValue}>₹{balance.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  mainBalance: {
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.surface,
    marginRight: spacing.xs,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.surface,
  },
  breakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: spacing.sm,
  },
  breakdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownLabel: {
    ...typography.caption,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  breakdownValue: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.sm,
  },
});