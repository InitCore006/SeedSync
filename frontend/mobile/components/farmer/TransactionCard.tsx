import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/types/farmer.types';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius, shadows } from '@lib/constants/spacing';
import { formatCurrency, formatDate } from '@lib/utils/format';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'FAILED':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'FAILED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.transactionId}>#{transaction.transaction_id}</Text>
          <Text style={styles.buyerName}>{transaction.buyer_name}</Text>
        </View>

        <Ionicons
          name={getStatusIcon(transaction.payment_status)}
          size={24}
          color={getStatusColor(transaction.payment_status)}
        />
      </View>

      {/* Lot Info */}
      <View style={styles.lotInfo}>
        <Text style={styles.lotText}>
          {transaction.lot.crop_type} - {transaction.lot.variety}
        </Text>
        <Text style={styles.quantityText}>{transaction.lot.quantity} Quintals</Text>
      </View>

      {/* Amount Breakdown */}
      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(transaction.amount)}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Platform Fee</Text>
          <Text style={styles.amountValue}>-{formatCurrency(transaction.platform_fee)}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Tax</Text>
          <Text style={styles.amountValue}>-{formatCurrency(transaction.tax)}</Text>
        </View>

        <View style={[styles.amountRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Net Amount</Text>
          <Text style={styles.totalValue}>{formatCurrency(transaction.net_amount)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.dateText}>{formatDate(transaction.created_at)}</Text>

        {transaction.payment_date && (
          <View style={styles.paidBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.paidText}>Paid on {formatDate(transaction.payment_date)}</Text>
          </View>
        )}
      </View>

      {transaction.utr_number && (
        <Text style={styles.utrText}>UTR: {transaction.utr_number}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  titleContainer: {
    flex: 1,
  },

  transactionId: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },

  buyerName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  lotInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },

  lotText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },

  quantityText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },

  amountContainer: {
    marginBottom: spacing.sm,
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  amountLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },

  amountValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },

  totalRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border.light,
    marginTop: spacing.xs,
  },

  totalLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },

  totalValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[500],
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  paidText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
  },

  utrText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
});