import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Detection } from '@/types/ai.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface DetectionCardProps {
  detection: Detection;
}

export default function DetectionCard({ detection }: DetectionCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.secondary;
      default:
        return colors.accent;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disease':
        return '🦠';
      case 'pest':
        return '🐛';
      case 'nutrient':
        return '🧪';
      case 'environmental':
        return '🌡️';
      default:
        return '⚠️';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{getTypeIcon(detection.type)}</Text>
          <View style={styles.headerText}>
            <Text style={styles.name}>{detection.name}</Text>
            <Text style={styles.category}>{detection.category}</Text>
          </View>
        </View>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: `${getSeverityColor(detection.severity)}20` },
          ]}
        >
          <Text style={[styles.severityText, { color: getSeverityColor(detection.severity) }]}>
            {detection.severity.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{detection.description}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text style={styles.metricValue}>{detection.confidence}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Affected Area</Text>
          <Text style={styles.metricValue}>{detection.affectedArea}%</Text>
        </View>
      </View>

      {detection.symptoms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms:</Text>
          {detection.symptoms.map((symptom, index) => (
            <Text key={index} style={styles.listItem}>
              • {symptom}
            </Text>
          ))}
        </View>
      )}

      {detection.causes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Possible Causes:</Text>
          {detection.causes.map((cause, index) => (
            <Text key={index} style={styles.listItem}>
              • {cause}
            </Text>
          ))}
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
    fontSize: 32,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  category: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
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
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  listItem: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
    marginLeft: spacing.sm,
  },
});