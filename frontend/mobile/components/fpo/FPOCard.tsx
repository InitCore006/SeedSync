import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FPO } from '@/types/fpo.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface FPOCardProps {
  fpo: FPO;
  onPress: () => void;
}

export default function FPOCard({ fpo, onPress }: FPOCardProps) {
  const getTypeIcon = () => {
    switch (fpo.type) {
      case 'producer-company':
        return '🏢';
      case 'cooperative':
        return '🤝';
      case 'self-help-group':
        return '👥';
      default:
        return '🏛️';
    }
  };

  const getTypeColor = () => {
    switch (fpo.type) {
      case 'producer-company':
        return colors.primary;
      case 'cooperative':
        return colors.accent;
      case 'self-help-group':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
          <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor()}20` }]}>
            <Text style={[styles.typeText, { color: getTypeColor() }]}>
              {fpo.type.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Name */}
      <Text style={styles.name}>{fpo.name}</Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {fpo.description}
      </Text>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>
          {fpo.location}, {fpo.district}, {fpo.state}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{fpo.memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{fpo.established}</Text>
          <Text style={styles.statLabel}>Established</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>₹{fpo.membershipFee}</Text>
          <Text style={styles.statLabel}>Fee</Text>
        </View>
      </View>

      {/* Services */}
      <View style={styles.servicesContainer}>
        {fpo.services.slice(0, 3).map((service, index) => (
          <View key={index} style={styles.serviceBadge}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
        {fpo.services.length > 3 && (
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceText}>+{fpo.services.length - 3} more</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.contactContainer}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={styles.contactText}>{fpo.phoneNumber}</Text>
        </View>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
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
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 14,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  serviceBadge: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactIcon: {
    fontSize: 14,
  },
  contactText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  viewDetails: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});