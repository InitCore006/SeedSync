import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { GovernmentScheme } from '@/types/scheme.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface SchemeCardProps {
  scheme: GovernmentScheme;
  onPress: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export default function SchemeCard({
  scheme,
  onPress,
  onBookmark,
  isBookmarked,
}: SchemeCardProps) {
  const getCategoryColor = () => {
    const colors_map: Record<string, string> = {
      subsidy: colors.success,
      loan: colors.accent,
      insurance: colors.primary,
      training: colors.warning,
      equipment: '#8B4513',
      infrastructure: '#FF6B6B',
      marketing: '#4ECDC4',
      other: colors.text.secondary,
    };
    return colors_map[scheme.category] || colors.text.secondary;
  };

  const getLaunchedByColor = () => {
    return scheme.launchedBy === 'Central' ? colors.primary : colors.accent;
  };

  const handleApply = () => {
    Linking.openURL(scheme.applicationUrl);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{scheme.icon}</Text>
        </View>

        <View style={styles.headerContent}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${getCategoryColor()}20` },
            ]}
          >
            <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
              {scheme.category.toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.launchBadge,
              { backgroundColor: `${getLaunchedByColor()}20` },
            ]}
          >
            <Text
              style={[styles.launchText, { color: getLaunchedByColor() }]}
            >
              {scheme.launchedBy}
            </Text>
          </View>
        </View>

        {/* Bookmark Button */}
        {onBookmark && (
          <Pressable style={styles.bookmarkButton} onPress={onBookmark}>
            <Text style={styles.bookmarkIcon}>
              {isBookmarked ? '🔖' : '📑'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Name */}
      <Text style={styles.name}>{scheme.name}</Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {scheme.description}
      </Text>

      {/* Authority */}
      <View style={styles.authorityContainer}>
        <Text style={styles.authorityIcon}>🏛️</Text>
        <Text style={styles.authorityText}>{scheme.authority}</Text>
      </View>

      {/* Benefits Preview */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Key Benefits:</Text>
        {scheme.benefits.slice(0, 2).map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText} numberOfLines={1}>
              {benefit}
            </Text>
          </View>
        ))}
        {scheme.benefits.length > 2 && (
          <Text style={styles.moreBenefits}>
            +{scheme.benefits.length - 2} more benefits
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {scheme.helplineNumber && (
          <View style={styles.helplineContainer}>
            <Text style={styles.helplineIcon}>📞</Text>
            <Text style={styles.helplineText}>{scheme.helplineNumber}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            pressed && styles.applyButtonPressed,
          ]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Apply Now →</Text>
        </Pressable>
      </View>

      {/* Last Date Warning */}
      {scheme.lastDate && (
        <View style={styles.lastDateContainer}>
          <Text style={styles.lastDateIcon}>⏰</Text>
          <Text style={styles.lastDateText}>
            Last Date: {new Date(scheme.lastDate).toLocaleDateString()}
          </Text>
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  launchBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  launchText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  name: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  authorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  authorityIcon: {
    fontSize: 14,
  },
  authorityText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  benefitsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  benefitsTitle: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: spacing.xs,
  },
  benefitBullet: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  benefitText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  moreBenefits: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  helplineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helplineIcon: {
    fontSize: 14,
  },
  helplineText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  applyButtonPressed: {
    opacity: 0.7,
  },
  applyButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  lastDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    borderRadius: 8,
    padding: spacing.xs,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  lastDateIcon: {
    fontSize: 14,
  },
  lastDateText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
});