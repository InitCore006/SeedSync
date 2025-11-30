import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import { Transaction } from '@/types/wallet.types';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions } = useWallet();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const found = transactions.find((t) => t.id === id);
    setTransaction(found || null);
  }, [id, transactions]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction Receipt\n\nReference: ${transaction?.referenceNumber}\nAmount: ₹${transaction?.amount}\nDate: ${transaction?.date}\nStatus: ${transaction?.status}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!transaction) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Transaction Details</Text>
        <Pressable onPress={handleShare}>
          <Text style={styles.shareButton}>📤</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>
            {transaction.type === 'credit' ? 'Received' : 'Paid'}
          </Text>
          <Text
            style={[
              styles.amountValue,
              { color: transaction.type === 'credit' ? colors.success : colors.error },
            ]}
          >
            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
          </Text>
          
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor()}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {transaction.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{transaction.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number</Text>
            <Text style={styles.detailValue}>{transaction.referenceNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction.date).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {transaction.category.replace('-', ' ').toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>
              {transaction.type === 'credit' ? 'Credit (Money In)' : 'Debit (Money Out)'}
            </Text>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Text style={styles.helpIcon}>💡</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              If you have any questions about this transaction, please contact support.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...typography.h4,
    color: colors.text.primary,
  },
  shareButton: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  helpIcon: {
    fontSize: 24,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  helpText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});