import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface EligibilityCheckerProps {
  criteria: string[];
  isEligible?: boolean;
}

export default function EligibilityChecker({
  criteria,
  isEligible,
}: EligibilityCheckerProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.title}>Eligibility Criteria</Text>
      </View>

      {/* Criteria List */}
      <View style={styles.criteriaList}>
        {criteria.map((criterion, index) => (
          <View key={index} style={styles.criterionItem}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.criterionText}>{criterion}</Text>
          </View>
        ))}
      </View>

      {/* Eligibility Status */}
      {isEligible !== undefined && (
        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor: isEligible
                ? `${colors.success}15`
                : `${colors.error}15`,
            },
          ]}
        >
          <Text style={styles.statusIcon}>
            {isEligible ? '✅' : '❌'}
          </Text>
          <Text
            style={[
              styles.statusText,
              { color: isEligible ? colors.success : colors.error },
            ]}
          >
            {isEligible
              ? 'You are eligible for this scheme!'
              : 'You may not be eligible for this scheme'}
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
    gap: spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  criteriaList: {
    gap: spacing.sm,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  criterionText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
});