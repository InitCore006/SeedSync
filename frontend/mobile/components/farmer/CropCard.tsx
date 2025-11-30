import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Crop } from '@/types/crop.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface CropCardProps {
  crop: Crop;
  onPress: () => void;
}

export default function CropCard({ crop, onPress }: CropCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing': return colors.success;
      case 'flowering': return colors.primary;
      case 'harvesting': return colors.warning;
      case 'harvested': return colors.secondary;
      case 'failed': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Crop Image */}
      <View style={styles.imageContainer}>
        {crop.images.length > 0 ? (
          <Image source={{ uri: crop.images[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>🌾</Text>
          </View>
        )}
        
        {/* Health Score Badge */}
        <View style={[styles.badge, { backgroundColor: crop.healthScore >= 80 ? colors.success : crop.healthScore >= 50 ? colors.warning : colors.error }]}>
          <Text style={styles.badgeText}>{crop.healthScore}%</Text>
        </View>
      </View>

      {/* Crop Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{crop.name}</Text>
          <View style={[styles.status, { backgroundColor: `${getStatusColor(crop.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(crop.status) }]}>
              {getStatusLabel(crop.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.variety}>{crop.variety}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${crop.growthStage.percentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{crop.growthStage.percentage}%</Text>
        </View>

        <Text style={styles.stage}>{crop.growthStage.current}</Text>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Area</Text>
            <Text style={styles.statValue}>{crop.area} {crop.areaUnit}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Days Left</Text>
            <Text style={styles.statValue}>{crop.growthStage.daysRemaining}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Expected</Text>
            <Text style={styles.statValue}>{crop.expectedYield} Q</Text>
          </View>
        </View>

        {/* Risk Indicators */}
        {crop.riskFactors.length > 0 && (
          <View style={styles.riskContainer}>
            <Text style={styles.riskText}>⚠️ {crop.riskFactors.length} Active Alert(s)</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  status: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  variety: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    width: 40,
  },
  stage: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  riskContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: `${colors.warning}15`,
    borderRadius: 6,
  },
  riskText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
});