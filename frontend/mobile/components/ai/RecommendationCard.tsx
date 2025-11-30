import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Recommendation } from '@/types/ai.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      default:
        return colors.accent;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'immediate':
        return '🚨';
      case 'preventive':
        return '🛡️';
      case 'long-term':
        return '📅';
      default:
        return '💡';
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>{getTypeIcon(recommendation.type)}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>{recommendation.title}</Text>
              <Text style={styles.timeframe}>{recommendation.timeframe}</Text>
            </View>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: `${getPriorityColor(recommendation.priority)}20` },
            ]}
          >
            <Text
              style={[styles.priorityText, { color: getPriorityColor(recommendation.priority) }]}
            >
              {recommendation.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </Pressable>

      <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
        {recommendation.description}
      </Text>

      {recommendation.estimatedCost && (
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Estimated Cost:</Text>
          <Text style={styles.costValue}>₹{recommendation.estimatedCost.toLocaleString('en-IN')}</Text>
        </View>
      )}

      {expanded && (
        <>
          <View style={styles.outcomeContainer}>
            <Text style={styles.outcomeLabel}>Expected Outcome:</Text>
            <Text style={styles.outcomeText}>{recommendation.expectedOutcome}</Text>
          </View>

          {recommendation.treatments.length > 0 && (
            <View style={styles.treatmentsSection}>
              <Text style={styles.sectionTitle}>Treatment Options:</Text>
              {recommendation.treatments.map((treatment) => (
                <View key={treatment.id} style={styles.treatmentCard}>
                  <View style={styles.treatmentHeader}>
                    <Text style={styles.treatmentName}>{treatment.name}</Text>
                    <View
                      style={[
                        styles.treatmentTypeBadge,
                        {
                          backgroundColor:
                            treatment.type === 'organic'
                              ? `${colors.success}20`
                              : `${colors.secondary}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.treatmentTypeText,
                          {
                            color: treatment.type === 'organic' ? colors.success : colors.secondary,
                          },
                        ]}
                      >
                        {treatment.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {treatment.dosage && (
                    <Text style={styles.treatmentDetail}>Dosage: {treatment.dosage}</Text>
                  )}
                  <Text style={styles.treatmentDetail}>Application: {treatment.application}</Text>
                  <Text style={styles.treatmentDetail}>Frequency: {treatment.frequency}</Text>

                  {treatment.cost && (
                    <Text style={styles.treatmentCost}>
                      Cost: ₹{treatment.cost.toLocaleString('en-IN')}
                    </Text>
                  )}

                  {treatment.precautions.length > 0 && (
                    <View style={styles.precautionsSection}>
                      <Text style={styles.precautionsTitle}>Precautions:</Text>
                      {treatment.precautions.map((precaution, index) => (
                        <Text key={index} style={styles.precautionText}>
                          • {precaution}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandButton}>
        <Text style={styles.expandText}>{expanded ? 'Show Less' : 'Show More'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  timeframe: {
    ...typography.caption,
    color: colors.accent,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  costLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  costValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  outcomeContainer: {
    backgroundColor: `${colors.success}10`,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  outcomeLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  outcomeText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  treatmentsSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  treatmentCard: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  treatmentName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  treatmentTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  treatmentTypeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  treatmentDetail: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  treatmentCost: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  precautionsSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  precautionsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 4,
  },
  precautionText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginLeft: spacing.sm,
  },
  expandButton: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  expandText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});