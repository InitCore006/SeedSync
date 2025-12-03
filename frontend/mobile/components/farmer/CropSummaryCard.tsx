import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { CROP_STATUS_CONFIG } from '@/lib/constants/crops';
import { Crop } from '@/types/crop.types';

interface CropSummaryCardProps {
  crop: Crop;
  compact?: boolean;
}

export default function CropSummaryCard({ crop, compact = false }: CropSummaryCardProps) {
  const router = useRouter();
  const statusConfig = CROP_STATUS_CONFIG[crop.status as keyof typeof CROP_STATUS_CONFIG] || {
    label: crop.status,
    icon: 'leaf',
    color: colors.gray[500],
    bgColor: withOpacity(colors.gray[500], 0.1),
  };

  const handlePress = () => {
    router.push(`/(farmer)/crops/${crop.id}` as any);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactIcon, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {crop.crop_type_display}
          </Text>
          <Text style={styles.compactDetails} numberOfLines={1}>
            {crop.variety} • {crop.planted_area} acres
          </Text>
        </View>
        <View style={[styles.compactStatus, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.compactStatusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{crop.crop_type_display}</Text>
          <Text style={styles.variety}>{crop.variety}</Text>
          <Text style={styles.cropId}>ID: {crop.crop_id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="resize-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{crop.planted_area} acres</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {new Date(crop.planting_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{crop.district}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  variety: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  cropId: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactDetails: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  compactStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  compactStatusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
});