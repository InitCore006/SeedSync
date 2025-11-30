import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Membership } from '@/types/fpo.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface MembershipCardProps {
  membership: Membership;
  fpoName: string;
}

export default function MembershipCard({ membership, fpoName }: MembershipCardProps) {
  const getStatusIcon = () => {
    switch (membership.status) {
      case 'active':
        return '✅';
      case 'applied':
        return '⏳';
      case 'inactive':
        return '⏸️';
      default:
        return '❓';
    }
  };

  const getStatusColor = () => {
    switch (membership.status) {
      case 'active':
        return colors.success;
      case 'applied':
        return colors.warning;
      case 'inactive':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>🤝</Text>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Membership</Text>
          <Text style={styles.fpoName}>{fpoName}</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, { color: getStatusColor() }]}>
            {membership.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Details */}
      {membership.status === 'active' && (
        <>
          {membership.joinedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Joined Date</Text>
              <Text style={styles.detailValue}>
                {new Date(membership.joinedDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {membership.membershipNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Membership Number</Text>
              <Text style={styles.detailValue}>{membership.membershipNumber}</Text>
            </View>
          )}

          {/* Benefits */}
          {membership.benefits.length > 0 && (
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Member Benefits</Text>
              {membership.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitBullet}>•</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {membership.status === 'applied' && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageIcon}>⏳</Text>
          <Text style={styles.messageText}>
            Your membership application is under review. You will be notified once its approved.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
  },
  fpoName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  statusValue: {
    ...typography.body,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  benefitsTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  benefitBullet: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  benefitText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.warning}15`,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  messageIcon: {
    fontSize: 20,
  },
  messageText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
});