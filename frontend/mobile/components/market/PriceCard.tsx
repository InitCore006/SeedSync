import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MarketPrice } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface PriceCardProps {
  price: MarketPrice;
  onPress?: () => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ price, onPress }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{price.cropName}</Text>
          {price.variety && <Text style={styles.variety}>{price.variety}</Text>}
        </View>
        <View style={styles.trendContainer}>
          <Text style={styles.trendIcon}>{getTrendIcon(price.trend)}</Text>
          <Text style={[styles.trendPercent, { color: getTrendColor(price.trend) }]}>
            {price.priceChangePercent > 0 ? '+' : ''}
            {price.priceChangePercent.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.mainPrice}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price.price}</Text>
            <Text style={styles.unit}>/{price.unit}</Text>
          </View>
        </View>

        <View style={styles.priceRange}>
          <View style={styles.rangeLine}>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Min</Text>
              <Text style={styles.rangeValue}>₹{price.minPrice}</Text>
            </View>
            <View style={styles.rangeDivider} />
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Max</Text>
              <Text style={styles.rangeValue}>₹{price.maxPrice}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.location}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {price.marketName}, {price.district}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(price.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  variety: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendIcon: {
    fontSize: 20,
  },
  trendPercent: {
    ...typography.body,
    fontWeight: '700',
  },
  priceSection: {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  mainPrice: {
    marginBottom: spacing.sm,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  unit: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  priceRange: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  rangeLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  rangeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  rangeValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rangeDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  locationText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default PriceCard;