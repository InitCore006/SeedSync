import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SoilMoisture } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface SoilMoistureCardProps {
  soilMoisture: SoilMoisture;
}

const SoilMoistureCard: React.FC<SoilMoistureCardProps> = ({ soilMoisture }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'very-dry':
        return '#D32F2F';
      case 'dry':
        return '#F57C00';
      case 'optimal':
        return colors.success;
      case 'wet':
        return '#2196F3';
      case 'saturated':
        return '#1565C0';
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'very-dry':
        return 'Very Dry';
      case 'dry':
        return 'Dry';
      case 'optimal':
        return 'Optimal';
      case 'wet':
        return 'Wet';
      case 'saturated':
        return 'Saturated';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'very-dry':
        return '🏜️';
      case 'dry':
        return '🌵';
      case 'optimal':
        return '✅';
      case 'wet':
        return '💧';
      case 'saturated':
        return '💦';
      default:
        return '🌱';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Soil Moisture</Text>
        <Text style={styles.icon}>{getStatusIcon(soilMoisture.status)}</Text>
      </View>

      <View style={styles.levelContainer}>
        <View style={styles.levelBar}>
          <View
            style={[
              styles.levelProgress,
              {
                width: `${soilMoisture.level}%`,
                backgroundColor: getStatusColor(soilMoisture.status),
              },
            ]}
          />
        </View>
        <Text style={styles.levelText}>{soilMoisture.level}%</Text>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(soilMoisture.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(soilMoisture.status) }]}
          >
            {getStatusLabel(soilMoisture.status)}
          </Text>
        </View>
      </View>

      {soilMoisture.irrigationRecommended && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationIcon}>💧</Text>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Irrigation Recommended</Text>
            {soilMoisture.daysUntilIrrigation && (
              <Text style={styles.recommendationText}>
                Consider irrigation within {soilMoisture.daysUntilIrrigation} days
              </Text>
            )}
          </View>
        </View>
      )}

      {!soilMoisture.irrigationRecommended && soilMoisture.status === 'optimal' && (
        <View style={styles.optimalContainer}>
          <Text style={styles.optimalIcon}>✅</Text>
          <Text style={styles.optimalText}>Soil moisture is at optimal level</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  icon: {
    fontSize: 32,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  levelProgress: {
    height: '100%',
    borderRadius: 6,
  },
  levelText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    minWidth: 45,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
  },
  recommendationContainer: {
    flexDirection: 'row',
    backgroundColor: `${colors.primary}15`,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  recommendationText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  optimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.success}15`,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  optimalIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  optimalText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
});

export default SoilMoistureCard;