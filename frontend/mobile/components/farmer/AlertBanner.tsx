import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RiskFactor } from '@/types/crop.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface AlertBannerProps {
  risk: RiskFactor;
  onPress?: () => void;
}

export default function AlertBanner({ risk, onPress }: AlertBannerProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.secondary;
      default: return colors.accent;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pest': return '🐛';
      case 'disease': return '🦠';
      case 'weather': return '🌧️';
      case 'soil': return '🌱';
      case 'nutrient': return '🧪';
      default: return '⚠️';
    }
  };

  const content = (
    <View style={[styles.container, { borderLeftColor: getSeverityColor(risk.severity) }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(risk.type)}</Text>
          <Text style={styles.severityIcon}>{getSeverityIcon(risk.severity)}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{risk.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{risk.description}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getSeverityColor(risk.severity) }]}>
          <Text style={styles.badgeText}>{risk.severity.toUpperCase()}</Text>
        </View>
      </View>
      {risk.recommendations.length > 0 && (
        <View style={styles.recommendations}>
          <Text style={styles.recommendationsTitle}>Quick Actions:</Text>
          {risk.recommendations.slice(0, 2).map((rec, index) => (
            <Text key={index} style={styles.recommendation}>
              • {rec}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrapper}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  typeIcon: {
    fontSize: 24,
  },
  severityIcon: {
    fontSize: 16,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.surface,
    fontWeight: '700',
  },
  recommendations: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recommendationsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recommendation: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
});