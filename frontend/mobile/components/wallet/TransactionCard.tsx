import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Transaction } from '@/types/wallet.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      'crop-sale': '🌾',
      'subsidy': '🏛️',
      'loan': '💳',
      'expense': '🛒',
      'transport': '🚛',
      'other': '💰',
    };
    return icons[transaction.category] || '💰';
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={({ pressed }) => [
        styles.container,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon()}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description}>{transaction.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString()}</Text>
          {transaction.referenceNumber && (
            <>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.reference}>{transaction.referenceNumber}</Text>
            </>
          )}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: transaction.type === 'credit' ? colors.success : colors.error },
          ]}
        >
          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  metaDivider: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  reference: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});