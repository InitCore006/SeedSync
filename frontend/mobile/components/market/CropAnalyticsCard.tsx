import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CropAnalytics } from '@/types/market.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface CropAnalyticsCardProps {
  analytics: CropAnalytics;
}

const CropAnalyticsCard: React.FC<CropAnalyticsCardProps> = ({ analytics }) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return colors.success;
    if (change < 0) return colors.error;
    return colors.text.secondary;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string) => {
    const colors: { [key: string]: string } = {
      high: '#4CAF50',
      medium: '#FF9800',
      low: '#F44336',
      surplus: '#2196F3',
      balanced: '#4CAF50',
      deficit: '#F44336',
    };
    return colors[trend] || '#607D8B';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{analytics.cropName} Analytics</Text>

      {/* Current Price */}
      <View style={styles.currentPrice}>
        <Text style={styles.label}>Current Market Price</Text>
        <Text style={styles.price}>₹{analytics.currentPrice}</Text>
      </View>

      {/* Price Changes */}
      <View style={styles.changesSection}>
        <View style={styles.changeCard}>
          <Text style={styles.changeIcon}>{getChangeIcon(analytics.weeklyChange)}</Text>
          <Text style={styles.changeLabel}>Weekly</Text>
          <Text style={[styles.changeValue, { color: getChangeColor(analytics.weeklyChange) }]}>
            {analytics.weeklyChange > 0 ? '+' : ''}
            {analytics.weeklyChange.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.changeCard}>
          <Text style={styles.changeIcon}>{getChangeIcon(analytics.monthlyChange)}</Text>
          <Text style={styles.changeLabel}>Monthly</Text>
          <Text
            style={[styles.changeValue, { color: getChangeColor(analytics.monthlyChange) }]}
          >
            {analytics.monthlyChange > 0 ? '+' : ''}
            {analytics.monthlyChange.toFixed(2)}%
          </Text>
        </View>

        <View style={styles.changeCard}>
          <Text style={styles.changeIcon}>{getChangeIcon(analytics.yearlyChange)}</Text>
          <Text style={styles.changeLabel}>Yearly</Text>
          <Text style={[styles.changeValue, { color: getChangeColor(analytics.yearlyChange) }]}>
            {analytics.yearlyChange > 0 ? '+' : ''}
            {analytics.yearlyChange.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Price Range */}
      <View style={styles.rangeSection}>
        <Text style={styles.sectionTitle}>Price Range</Text>
        <View style={styles.rangeContainer}>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>High</Text>
            <Text style={styles.rangeValue}>₹{analytics.highestPrice}</Text>
          </View>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>Average</Text>
            <Text style={styles.rangeValue}>₹{analytics.averagePrice}</Text>
          </View>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>Low</Text>
            <Text style={styles.rangeValue}>₹{analytics.lowestPrice}</Text>
          </View>
        </View>
      </View>

      {/* Market Trends */}
      <View style={styles.trendsSection}>
        <Text style={styles.sectionTitle}>Market Trends</Text>
        <View style={styles.trendRow}>
          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Demand</Text>
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: `${getTrendColor(analytics.demandTrend)}20` },
              ]}
            >
              <Text style={[styles.trendText, { color: getTrendColor(analytics.demandTrend) }]}>
                {analytics.demandTrend.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.trendItem}>
            <Text style={styles.trendLabel}>Supply</Text>
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: `${getTrendColor(analytics.supplyTrend)}20` },
              ]}
            >
              <Text style={[styles.trendText, { color: getTrendColor(analytics.supplyTrend) }]}>
                {analytics.supplyTrend.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Forecast */}
      <View style={styles.forecastSection}>
        <Text style={styles.sectionTitle}>Price Forecast</Text>
        <View style={styles.forecastContainer}>
          <View style={styles.forecastItem}>
            <Text style={styles.forecastLabel}>Next Week</Text>
            <Text style={styles.forecastValue}>₹{analytics.forecast.nextWeek}</Text>
          </View>
          <View style={styles.forecastDivider} />
          <View style={styles.forecastItem}>
            <Text style={styles.forecastLabel}>Next Month</Text>
            <Text style={styles.forecastValue}>₹{analytics.forecast.nextMonth}</Text>
          </View>
        </View>
        <View style={styles.confidenceBar}>
          <Text style={styles.confidenceLabel}>Confidence:</Text>
          <View style={styles.confidenceTrack}>
            <View
              style={[
                styles.confidenceProgress,
                { width: `${analytics.forecast.confidence}%` },
              ]}
            />
          </View>
          <Text style={styles.confidenceValue}>{analytics.forecast.confidence}%</Text>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>💡 Insights</Text>
        <Text style={styles.insightText}>{analytics.seasonalPattern}</Text>
        {analytics.bestSellingMonths.length > 0 && (
          <View style={styles.bestMonths}>
            <Text style={styles.bestMonthsLabel}>Best months to sell:</Text>
            <Text style={styles.bestMonthsText}>{analytics.bestSellingMonths.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Volatility */}
      <View style={styles.volatilitySection}>
        <View style={styles.volatilityHeader}>
          <Text style={styles.volatilityLabel}>Volatility Index</Text>
          <Text style={styles.volatilityValue}>{analytics.volatilityIndex.toFixed(1)}</Text>
        </View>
        <View style={styles.volatilityBar}>
          <View
            style={[
              styles.volatilityProgress,
              {
                width: `${Math.min(analytics.volatilityIndex * 10, 100)}%`,
                backgroundColor:
                  analytics.volatilityIndex > 7
                    ? colors.error
                    : analytics.volatilityIndex > 4
                    ? colors.warning
                    : colors.success,
              },
            ]}
          />
        </View>
        <Text style={styles.volatilityHint}>
          {analytics.volatilityIndex > 7
            ? 'High volatility - Prices fluctuate significantly'
            : analytics.volatilityIndex > 4
            ? 'Moderate volatility - Some price fluctuations'
            : 'Low volatility - Stable prices'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  currentPrice: {
    backgroundColor: `${colors.primary}10`,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  changesSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  changeCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  changeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  changeValue: {
    ...typography.body,
    fontWeight: '700',
  },
  rangeSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  rangeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
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
  trendsSection: {
    marginBottom: spacing.md,
  },
  trendRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  trendItem: {
    flex: 1,
  },
  trendLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  trendBadge: {
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  trendText: {
    ...typography.caption,
    fontWeight: '700',
  },
  forecastSection: {
    marginBottom: spacing.md,
  },
  forecastContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  forecastItem: {
    flex: 1,
    alignItems: 'center',
  },
  forecastDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  forecastLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  forecastValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  confidenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  confidenceTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  confidenceValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  insightsSection: {
    backgroundColor: `${colors.accent}10`,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  insightText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  bestMonths: {
    marginTop: spacing.xs,
  },
  bestMonthsLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  bestMonthsText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.accent,
  },
  volatilitySection: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
  },
  volatilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  volatilityLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  volatilityValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  volatilityBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  volatilityProgress: {
    height: '100%',
    borderRadius: 4,
  },
  volatilityHint: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default CropAnalyticsCard;