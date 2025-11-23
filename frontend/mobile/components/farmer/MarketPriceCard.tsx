import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketPrice } from '@/types/farmer.types';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius, shadows } from '@lib/constants/spacing';
import { formatCurrency, formatDate } from '@lib/utils/format';

interface MarketPriceCardProps {
  price: MarketPrice;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({ price }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{price.crop_type}</Text>
          {price.variety && <Text style={styles.variety}>{price.variety}</Text>}
        </View>

        {/* Trend Badge */}
        <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor(price.trend)}15` }]}>
          <Ionicons name={getTrendIcon(price.trend)} size={16} color={getTrendColor(price.trend)} />
          <Text style={[styles.trendText, { color: getTrendColor(price.trend) }]}>
            {price.change_percentage > 0 ? '+' : ''}
            {price.change_percentage}%
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={colors.gray[500]} />
        <Text style={styles.locationText}>
          {price.market_location}, {price.state}
        </Text>
      </View>

      {/* Prices */}
      <View style={styles.pricesContainer}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Min</Text>
          <Text style={styles.priceValue}>{formatCurrency(price.min_price)}</Text>
        </View>

        <View style={[styles.priceItem, styles.modalPriceItem]}>
          <Text style={styles.priceLabel}>Modal</Text>
          <Text style={[styles.priceValue, styles.modalPrice]}>
            {formatCurrency(price.modal_price)}
          </Text>
        </View>

        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Max</Text>
          <Text style={styles.priceValue}>{formatCurrency(price.max_price)}</Text>
        </View>
      </View>

      {/* Date */}
      <Text style={styles.dateText}>Updated: {formatDate(price.price_date)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  cropInfo: {
    flex: 1,
  },

  cropName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },

  variety: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  trendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  locationText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[600],
  },

  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },

  priceItem: {
    alignItems: 'center',
    flex: 1,
  },

  modalPriceItem: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border.light,
  },

  priceLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  priceValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },

  modalPrice: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[500],
  },

  dateText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray[500],
    textAlign: 'right',
  },
});