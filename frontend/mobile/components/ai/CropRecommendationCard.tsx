import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CropRecommendation } from '@/types/ai.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface CropRecommendationCardProps {
  recommendation: CropRecommendation;
  onSelect?: () => void;
}

export default function CropRecommendationCard({
  recommendation,
  onSelect,
}: CropRecommendationCardProps) {
  const getWaterIcon = (requirement: string) => {
    switch (requirement) {
      case 'high':
        return '💧💧💧';
      case 'medium':
        return '💧💧';
      case 'low':
        return '💧';
      default:
        return '💧';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.secondary;
  };

  return (
    <Pressable
      style={[
        styles.container,
        { borderLeftColor: getSuitabilityColor(recommendation.suitabilityScore) },
      ]}
      onPress={onSelect}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.cropName}>{recommendation.cropName}</Text>
          <Text style={styles.variety}>{recommendation.variety}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.scoreValue,
              { color: getSuitabilityColor(recommendation.suitabilityScore) },
            ]}
          >
            {recommendation.suitabilityScore}
          </Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricIcon}>📊</Text>
          <Text style={styles.metricValue}>{recommendation.expectedYield} Q</Text>
          <Text style={styles.metricLabel}>Expected Yield</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricIcon}>💰</Text>
          <Text style={styles.metricValue}>
            ₹{(recommendation.expectedRevenue / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.metricLabel}>Revenue</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricIcon}>📈</Text>
          <Text style={[styles.metricValue, { color: colors.success }]}>
            {recommendation.profitMargin}%
          </Text>
          <Text style={styles.metricLabel}>Profit</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricIcon}>⏱️</Text>
          <Text style={styles.metricValue}>{recommendation.duration}d</Text>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>{getWaterIcon(recommendation.waterRequirement)}</Text>
          <Text style={styles.detailText}>Water: {recommendation.waterRequirement}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📦</Text>
          <Text
            style={[
              styles.detailText,
              { color: getDemandColor(recommendation.marketDemand) },
            ]}
          >
            Demand: {recommendation.marketDemand}
          </Text>
        </View>
      </View>

      <View style={styles.investmentRow}>
        <Text style={styles.investmentLabel}>Investment Required:</Text>
        <Text style={styles.investmentValue}>
          ₹{recommendation.investmentRequired.toLocaleString('en-IN')}
        </Text>
      </View>

      {recommendation.reasons.length > 0 && (
        <View style={styles.reasonsSection}>
          <Text style={styles.reasonsTitle}>Why This Crop:</Text>
          {recommendation.reasons.slice(0, 2).map((reason, index) => (
            <Text key={index} style={styles.reasonText}>
              ✓ {reason}
            </Text>
          ))}
        </View>
      )}

      {recommendation.risks.length > 0 && (
        <View style={styles.risksSection}>
          <Text style={styles.risksTitle}>Risks to Consider:</Text>
          {recommendation.risks.slice(0, 2).map((risk, index) => (
            <Text key={index} style={styles.riskText}>
              ⚠ {risk}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 2,
  },
  variety: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  scoreValue: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: 2,
  },
  scoreLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricBox: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  investmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  investmentLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  investmentValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  reasonsSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reasonsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.xs,
  },
  reasonText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  risksSection: {
    marginTop: spacing.xs,
  },
  risksTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  riskText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});