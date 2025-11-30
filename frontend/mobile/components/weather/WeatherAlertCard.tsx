import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WeatherAlert } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface WeatherAlertCardProps {
  alert: WeatherAlert;
  onPress?: () => void;
}

const WeatherAlertCard: React.FC<WeatherAlertCardProps> = ({ alert, onPress }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return '#D32F2F';
      case 'severe':
        return '#F57C00';
      case 'moderate':
        return '#FFA000';
      case 'minor':
        return '#FDD835';
      default:
        return colors.text.secondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'extreme':
        return '🚨';
      case 'severe':
        return '⚠️';
      case 'moderate':
        return '⚡';
      case 'minor':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const content = (
    <View style={[styles.container, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getSeverityIcon(alert.severity)}</Text>
        <View style={styles.headerText}>
          <Text style={styles.event}>{alert.event}</Text>
          <View style={styles.badges}>
            <View
              style={[styles.badge, { backgroundColor: `${getSeverityColor(alert.severity)}20` }]}
            >
              <Text style={[styles.badgeText, { color: getSeverityColor(alert.severity) }]}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {alert.urgency.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {alert.description}
      </Text>

      {alert.affectedAreas.length > 0 && (
        <View style={styles.areasContainer}>
          <Text style={styles.areasLabel}>Affected Areas:</Text>
          <Text style={styles.areasText}>{alert.affectedAreas.join(', ')}</Text>
        </View>
      )}

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>From:</Text>
          <Text style={styles.timeValue}>{formatTime(alert.startTime)}</Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Until:</Text>
          <Text style={styles.timeValue}>{formatTime(alert.endTime)}</Text>
        </View>
      </View>

      {alert.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsLabel}>⚠️ Instructions:</Text>
          <Text style={styles.instructionsText}>{alert.instructions}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  event: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
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
  areasContainer: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  areasLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  areasText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  timeValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  instructionsContainer: {
    backgroundColor: `${colors.warning}15`,
    padding: spacing.sm,
    borderRadius: 8,
  },
  instructionsLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  instructionsText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});

export default WeatherAlertCard;