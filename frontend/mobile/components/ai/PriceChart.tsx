import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PricePoint } from '@/types/ai.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.md * 4;
const CHART_HEIGHT = 200;

interface PriceChartProps {
  data: PricePoint[];
  title: string;
}

export default function PriceChart({ data, title }: PriceChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>₹{maxPrice}</Text>
          <Text style={styles.axisLabel}>₹{Math.round((maxPrice + minPrice) / 2)}</Text>
          <Text style={styles.axisLabel}>₹{minPrice}</Text>
        </View>

        <View style={styles.chartArea}>
          {data.map((point, index) => {
            const heightPercentage = ((point.price - minPrice) / priceRange) * 100;
            const barHeight = (CHART_HEIGHT * heightPercentage) / 100;
            const barWidth = CHART_WIDTH / data.length - 8;

            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: getTrendColor(point.trend),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {formatDate(point.date)}
                </Text>
                <Text style={styles.barPrice}>₹{point.price}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legendContainer}>
        {data.slice(-3).map((point, index) => (
          <View key={index} style={styles.legendItem}>
            <Text style={styles.legendIcon}>{getTrendIcon(point.trend)}</Text>
            <Text style={styles.legendText}>
              {formatDate(point.date)}: ₹{point.price}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 60,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 5,
  },
  barLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  barPrice: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.primary,
  },
  legendContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyState: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});