import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCrops } from '@/hooks/useCrops';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

const { width } = Dimensions.get('window');

export default function FarmAnalyticsScreen() {
  const { analytics, fetchAnalytics, isLoading } = useCrops();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  if (isLoading && !analytics) {
    return <LoadingSpinner />;
  }

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analytics data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMetricCard = (icon: string, label: string, value: string, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <View style={styles.metricContent}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  const renderPerformanceBar = (cropName: string, value: number, maxValue: number, color: string) => {
    const percentage = (value / maxValue) * 100;
    return (
      <View style={styles.barContainer} key={cropName}>
        <Text style={styles.barLabel}>{cropName}</Text>
        <View style={styles.barWrapper}>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.barValue}>{value.toFixed(1)}</Text>
        </View>
      </View>
    );
  };

  const maxYield = Math.max(...analytics.cropPerformance.map((c) => c.yield));
  const maxRevenue = Math.max(...analytics.cropPerformance.map((c) => c.revenue));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Farm Analytics</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {/* Overview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewIcon}>🌾</Text>
                <Text style={styles.overviewValue}>{analytics.totalCrops}</Text>
                <Text style={styles.overviewLabel}>Total Crops</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewIcon}>🌱</Text>
                <Text style={styles.overviewValue}>{analytics.activeCrops}</Text>
                <Text style={styles.overviewLabel}>Active Crops</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewIcon}>📏</Text>
                <Text style={styles.overviewValue}>{analytics.totalArea}</Text>
                <Text style={styles.overviewLabel}>Total Acres</Text>
              </View>
            </View>
          </View>

          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            {renderMetricCard(
              '📊',
              'Average Yield',
              `${analytics.avgYield.toFixed(1)} quintals/acre`,
              colors.primary
            )}
            {renderMetricCard(
              '💰',
              'Total Revenue',
              `₹${analytics.totalRevenue.toLocaleString('en-IN')}`,
              colors.success
            )}
            {renderMetricCard(
              '📈',
              'Profit Margin',
              `${analytics.profitMargin.toFixed(1)}%`,
              colors.secondary
            )}
            {renderMetricCard(
              '🌱',
              'Soil Health Index',
              `${analytics.soilHealthIndex}/100`,
              colors.accent
            )}
            {renderMetricCard(
              '💧',
              'Water Efficiency',
              `${analytics.waterUsageEfficiency}%`,
              colors.primary
            )}
          </View>

          {/* Crop Performance - Yield */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop Performance - Yield</Text>
            <View style={styles.chartContainer}>
              {analytics.cropPerformance.map((crop) =>
                renderPerformanceBar(crop.cropName, crop.yield, maxYield, colors.primary)
              )}
            </View>
          </View>

          {/* Crop Performance - Revenue */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue by Crop</Text>
            <View style={styles.chartContainer}>
              {analytics.cropPerformance.map((crop) =>
                renderPerformanceBar(
                  crop.cropName,
                  crop.revenue / 1000,
                  maxRevenue / 1000,
                  colors.success
                )
              )}
            </View>
          </View>

          {/* Profit Margins */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profit Margins by Crop</Text>
            <View style={styles.profitGrid}>
              {analytics.cropPerformance.map((crop, index) => (
                <View key={index} style={styles.profitCard}>
                  <Text style={styles.profitCrop}>{crop.cropName}</Text>
                  <Text
                    style={[
                      styles.profitValue,
                      {
                        color:
                          crop.profitMargin >= 40
                            ? colors.success
                            : crop.profitMargin >= 30
                            ? colors.warning
                            : colors.error,
                      },
                    ]}
                  >
                    {crop.profitMargin.toFixed(1)}%
                  </Text>
                  <Text style={styles.profitLabel}>Profit Margin</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Seasonal Trends */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seasonal Trends</Text>
            {analytics.seasonalTrends.map((season, index) => (
              <View key={index} style={styles.seasonCard}>
                <View style={styles.seasonHeader}>
                  <Text style={styles.seasonName}>{season.season}</Text>
                  <Text style={styles.seasonRevenue}>
                    ₹{season.revenue.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.seasonStats}>
                  <View style={styles.seasonStat}>
                    <Text style={styles.seasonStatLabel}>Avg Yield</Text>
                    <Text style={styles.seasonStatValue}>{season.avgYield} Q</Text>
                  </View>
                  <View style={styles.seasonStat}>
                    <Text style={styles.seasonStatLabel}>Revenue</Text>
                    <Text style={styles.seasonStatValue}>
                      ₹{(season.revenue / 1000).toFixed(0)}K
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>💡</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Top Performer</Text>
                <Text style={styles.insightText}>
                  {analytics.cropPerformance[0]?.cropName} has the highest profit margin at{' '}
                  {analytics.cropPerformance[0]?.profitMargin.toFixed(1)}%
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>🌱</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Soil Health</Text>
                <Text style={styles.insightText}>
                  Your soil health index is {analytics.soilHealthIndex}/100.{' '}
                  {analytics.soilHealthIndex >= 75
                    ? 'Excellent condition!'
                    : 'Consider soil enrichment.'}
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>💧</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Water Efficiency</Text>
                <Text style={styles.insightText}>
                  Water usage efficiency at {analytics.waterUsageEfficiency}%.{' '}
                  {analytics.waterUsageEfficiency >= 80
                    ? 'Great water management!'
                    : 'Optimize irrigation schedule.'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  overviewIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  overviewValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 2,
  },
  overviewLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  metricIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  barContainer: {
    marginBottom: spacing.md,
  },
  barLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barBackground: {
    flex: 1,
    height: 24,
    backgroundColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  barValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    width: 50,
    textAlign: 'right',
  },
  profitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profitCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  profitCrop: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  profitValue: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: 2,
  },
  profitLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  seasonCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seasonName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  seasonRevenue: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },
  seasonStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  seasonStat: {
    flex: 1,
  },
  seasonStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  seasonStatValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.h4,
    color: colors.text.secondary,
  },
});