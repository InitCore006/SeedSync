import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FarmingRecommendation } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface FarmingRecommendationCardProps {
  recommendation: FarmingRecommendation;
  onPress?: () => void;
}

const FarmingRecommendationCard: React.FC<FarmingRecommendationCardProps> = ({
  recommendation,
  onPress,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'planting':
        return '🌱';
      case 'irrigation':
        return '💧';
      case 'harvesting':
        return '🌾';
      case 'spraying':
        return '🚿';
      case 'fertilizer':
        return '🧪';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatValidUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Valid for ${days} day${days > 1 ? 's' : ''}`;
    }
    return `Valid for ${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getTypeIcon(recommendation.type)}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{recommendation.title}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {getTypeLabel(recommendation.type)}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: `${getPriorityColor(recommendation.priority)}20` },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: getPriorityColor(recommendation.priority) },
                ]}
              >
                {recommendation.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{recommendation.description}</Text>

      {recommendation.weatherBased && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonIcon}>🌤️</Text>
          <Text style={styles.reasonText}>{recommendation.reason}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.validText}>{formatValidUntil(recommendation.validUntil)}</Text>
        {recommendation.weatherBased && (
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherBadgeText}>Weather Based</Text>
          </View>
        )}
      </View>
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
  title: {
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
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  reasonIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  reasonText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  validText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  weatherBadge: {
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weatherBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
  },
});

export default FarmingRecommendationCard;