import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lot } from '@/types/farmer.types';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius, shadows } from '@lib/constants/spacing';
import { formatCurrency, formatQuantity, formatDate } from '@lib/utils/format';

interface LotCardProps {
  lot: Lot;
  onPress: () => void;
}

export const LotCard: React.FC<LotCardProps> = ({ lot, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return colors.status.active;
      case 'SOLD':
        return colors.status.completed;
      case 'EXPIRED':
        return colors.status.expired;
      case 'DRAFT':
        return colors.status.pending;
      default:
        return colors.gray[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'SOLD':
        return 'Sold';
      case 'EXPIRED':
        return 'Expired';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {lot.images && lot.images.length > 0 ? (
          <Image source={{ uri: lot.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={colors.gray[400]} />
          </View>
        )}

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lot.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(lot.status)}</Text>
        </View>

        {/* Quality Grade Badge */}
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>Grade {lot.quality_grade}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Crop Info */}
        <View style={styles.header}>
          <Text style={styles.cropName}>
            {lot.crop_type} - {lot.variety}
          </Text>
          <Text style={styles.lotNumber}>#{lot.lot_number}</Text>
        </View>

        {/* Quantity & Price */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={16} color={colors.primary[500]} />
            <Text style={styles.infoText}>{formatQuantity(lot.quantity)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color={colors.secondary[500]} />
            <Text style={styles.priceText}>{formatCurrency(lot.reserve_price)}/Q</Text>
          </View>
        </View>

        {/* Location & Date */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={14} color={colors.gray[500]} />
            <Text style={styles.footerText} numberOfLines={1}>
              {lot.pickup_location}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(lot.created_at)}</Text>
        </View>

        {/* Views Count */}
        {lot.views_count > 0 && (
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={14} color={colors.gray[500]} />
            <Text style={styles.viewsText}>{lot.views_count} views</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },

  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: colors.gray[100],
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
  },

  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.inverse,
    textTransform: 'uppercase',
  },

  gradeBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  gradeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.inverse,
  },

  content: {
    padding: spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  cropName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },

  lotNumber: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[500],
    marginLeft: spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },

  priceText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary[500],
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },

  footerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[600],
  },

  dateText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[500],
  },

  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  viewsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[500],
  },
});