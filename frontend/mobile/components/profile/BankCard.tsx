import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { BankDetails } from '@/types/profile.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface BankCardProps {
  account: BankDetails;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

export default function BankCard({ account, onEdit, onDelete, onSetPrimary }: BankCardProps) {
  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return `XXXX XXXX ${accountNumber.slice(-4)}`;
  };

  const handleMoreOptions = () => {
    const options = [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit', onPress: onEdit },
    ];

    if (!account.isPrimary) {
      options.push({ text: 'Set as Primary', onPress: onSetPrimary });
    }

    options.push({ text: 'Delete', onPress: onDelete, style: 'destructive' } as any);

    Alert.alert('Account Options', 'Choose an action:', options as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.bankIcon}>🏦</Text>
          <View>
            <Text style={styles.bankName}>{account.bankName}</Text>
            <Text style={styles.accountType}>
              {account.accountType === 'savings' ? 'Savings' : 'Current'} Account
            </Text>
          </View>
        </View>
        <Pressable style={styles.moreButton} onPress={handleMoreOptions}>
          <Text style={styles.moreIcon}>⋮</Text>
        </Pressable>
      </View>

      {/* Account Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number</Text>
          <Text style={styles.detailValue}>{maskAccountNumber(account.accountNumber)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>IFSC Code</Text>
          <Text style={styles.detailValue}>{account.ifscCode}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Branch</Text>
          <Text style={styles.detailValue}>{account.branchName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Holder</Text>
          <Text style={styles.detailValue}>{account.accountHolderName}</Text>
        </View>
      </View>

      {/* Status Badges */}
      <View style={styles.badges}>
        {account.isPrimary && (
          <View style={[styles.badge, styles.primaryBadge]}>
            <Text style={styles.badgeText}>⭐ Primary</Text>
          </View>
        )}
        {account.isVerified ? (
          <View style={[styles.badge, styles.verifiedBadge]}>
            <Text style={styles.badgeText}>✓ Verified</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.pendingBadge]}>
            <Text style={styles.badgeText}>⏳ Pending Verification</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  bankName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  accountType: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  moreIcon: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadge: {
    backgroundColor: `${colors.accent}20`,
  },
  verifiedBadge: {
    backgroundColor: `${colors.success}20`,
  },
  pendingBadge: {
    backgroundColor: `${colors.warning}20`,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
});