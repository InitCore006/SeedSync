import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { ScanResult } from '@/types/ai.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface ScanResultCardProps {
  scan: ScanResult;
  onPress: () => void;
}

export default function ScanResultCard({ scan, onPress }: ScanResultCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'critical':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={{ uri: scan.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.cropName}>{scan.cropName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(scan.overallStatus)}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(scan.overallStatus) }]}>
              {scan.overallStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>{formatDate(scan.timestamp)}</Text>

        {scan.growthStage && (
          <Text style={styles.growthStage}>Growth Stage: {scan.growthStage}</Text>
        )}

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Health Score</Text>
            <Text style={[styles.metricValue, { color: getHealthColor(scan.healthScore) }]}>
              {scan.healthScore}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={styles.metricValue}>{scan.confidence}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Issues</Text>
            <Text style={styles.metricValue}>{scan.detections.length}</Text>
          </View>
        </View>

        {scan.detections.length > 0 && (
          <View style={styles.detectionsContainer}>
            <Text style={styles.detectionsTitle}>Detected Issues:</Text>
            {scan.detections.slice(0, 2).map((detection) => (
              <View key={detection.id} style={styles.detectionItem}>
                <View style={styles.detectionDot} />
                <Text style={styles.detectionText} numberOfLines={1}>
                  {detection.name} - {detection.severity}
                </Text>
              </View>
            ))}
            {scan.detections.length > 2 && (
              <Text style={styles.moreText}>
                +{scan.detections.length - 2} more issues
              </Text>
            )}
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
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
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
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  growthStage: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  metricValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  detectionsContainer: {
    marginTop: spacing.sm,
  },
  detectionsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    marginRight: spacing.sm,
  },
  detectionText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  moreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});