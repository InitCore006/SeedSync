import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SchemeApplication } from '@/types/scheme.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface ApplicationCardProps {
  application: SchemeApplication;
  schemeName: string;
  onPress?: () => void;
}

export default function ApplicationCard({
  application,
  schemeName,
  onPress,
}: ApplicationCardProps) {
  // Status Configuration
  const getStatusConfig = () => {
    switch (application.status) {
      case 'submitted':
        return {
          color: colors.info,
          bgColor: `${colors.info}15`,
          icon: '📤',
          label: 'Submitted',
        };
      case 'under-review':
        return {
          color: colors.warning,
          bgColor: `${colors.warning}15`,
          icon: '🔍',
          label: 'Under Review',
        };
      case 'approved':
        return {
          color: colors.success,
          bgColor: `${colors.success}15`,
          icon: '✓',
          label: 'Approved',
        };
      case 'rejected':
        return {
          color: colors.error,
          bgColor: `${colors.error}15`,
          icon: '✕',
          label: 'Rejected',
        };
      case 'disbursed':
        return {
          color: colors.primary,
          bgColor: `${colors.primary}15`,
          icon: '💰',
          label: 'Disbursed',
        };
      default:
        return {
          color: colors.gray[500],
          bgColor: colors.gray[100],
          icon: '📋',
          label: 'Unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate Days Since Applied
  const getDaysSinceApplied = () => {
    const appliedDate = new Date(application.appliedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - appliedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>📄</Text>
          <View style={styles.headerContent}>
            <Text style={styles.schemeName} numberOfLines={1}>
              {schemeName}
            </Text>
            <Text style={styles.applicationId}>
              Application ID: {application.applicationNumber || application.id.slice(0, 8)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
        </View>
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusValueContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusValue, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>Applied On</Text>
          <Text style={styles.dateValue}>{formatDate(application.appliedDate)}</Text>
        </View>
      </View>

      {/* Progress Indicator */}
      {(application.status === 'submitted' || application.status === 'under-review') && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: application.status === 'submitted' ? '33%' : '66%',
                  backgroundColor: statusConfig.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {getDaysSinceApplied()} days since application
          </Text>
        </View>
      )}

      {/* Amount Info (if approved/disbursed) */}
      {(application.status === 'approved' || application.status === 'disbursed') &&
        application.approvedAmount && (
          <View style={styles.amountContainer}>
            <View style={styles.amountInfo}>
              <Text style={styles.amountLabel}>
                {application.status === 'disbursed' ? 'Disbursed Amount' : 'Approved Amount'}
              </Text>
              <Text style={styles.amountValue}>₹{application.approvedAmount.toLocaleString('en-IN')}</Text>
            </View>
            {application.status === 'disbursed' && application.disbursedDate && (
              <Text style={styles.disbursedDate}>
                Disbursed on {formatDate(application.disbursedDate)}
              </Text>
            )}
          </View>
        )}

      {/* Remarks (if rejected or has notes) */}
      {application.remarks && (
        <View
          style={[
            styles.remarksContainer,
            application.status === 'rejected' && styles.remarksContainerError,
          ]}
        >
          <Text style={styles.remarksLabel}>
            {application.status === 'rejected' ? 'Rejection Reason' : 'Remarks'}
          </Text>
          <Text
            style={[
              styles.remarksText,
              application.status === 'rejected' && styles.remarksTextError,
            ]}
            numberOfLines={2}
          >
            {application.remarks}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {application.status === 'submitted'
            ? 'Your application is being processed'
            : application.status === 'under-review'
            ? 'Application under review by authorities'
            : application.status === 'approved'
            ? 'Waiting for disbursement'
            : application.status === 'disbursed'
            ? 'Amount disbursed successfully'
            : application.status === 'rejected'
            ? 'You can reapply after addressing the issues'
            : 'Tap to view details'}
        </Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  headerContent: {
    flex: 1,
  },
  schemeName: {
    ...typography.body,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  applicationId: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: 4,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusValue: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '700',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: 4,
  },
  dateValue: {
    ...typography.body,
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  amountContainer: {
    backgroundColor: `${colors.success}08`,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  amountValue: {
    ...typography.h4,
    color: colors.success,
    fontSize: 16,
  },
  disbursedDate: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  remarksContainer: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  remarksContainerError: {
    backgroundColor: `${colors.error}08`,
  },
  remarksLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  remarksText: {
    ...typography.caption,
    color: colors.text.primary,
    fontSize: 12,
    lineHeight: 18,
  },
  remarksTextError: {
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    flex: 1,
    marginRight: spacing.xs,
  },
  viewDetails: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});