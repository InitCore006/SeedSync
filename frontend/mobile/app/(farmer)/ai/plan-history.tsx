import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import EmptyState from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function PlanHistoryScreen() {
  const { cropPlans, getPlanHistory, isLoading } = useAI();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'kharif' | 'rabi' | 'zaid'>('all');

  useEffect(() => {
    getPlanHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getPlanHistory();
    setRefreshing(false);
  };

  const filteredPlans = cropPlans.filter((plan) => {
    if (filter === 'all') return true;
    return plan.season.toLowerCase() === filter;
  });

  const getFilterCount = (season: string) => {
    if (season === 'all') return cropPlans.length;
    return cropPlans.filter((p) => p.season.toLowerCase() === season).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSeasonIcon = (season: string) => {
    switch (season.toLowerCase()) {
      case 'kharif':
        return '🌧️';
      case 'rabi':
        return '❄️';
      case 'zaid':
        return '☀️';
      default:
        return '🌾';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season.toLowerCase()) {
      case 'kharif':
        return colors.primary;
      case 'rabi':
        return colors.secondary;
      case 'zaid':
        return colors.warning;
      default:
        return colors.accent;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Plan History</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({getFilterCount('all')})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'kharif' && styles.filterTabActive]}
          onPress={() => setFilter('kharif')}
        >
          <Text style={[styles.filterText, filter === 'kharif' && styles.filterTextActive]}>
            Kharif ({getFilterCount('kharif')})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'rabi' && styles.filterTabActive]}
          onPress={() => setFilter('rabi')}
        >
          <Text style={[styles.filterText, filter === 'rabi' && styles.filterTextActive]}>
            Rabi ({getFilterCount('rabi')})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'zaid' && styles.filterTabActive]}
          onPress={() => setFilter('zaid')}
        >
          <Text style={[styles.filterText, filter === 'zaid' && styles.filterTextActive]}>
            Zaid ({getFilterCount('zaid')})
          </Text>
        </Pressable>
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner />
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Plans Found"
          description="Create your first AI crop plan to see it here"
          actionLabel="Create Plan"
          onAction={() => router.push('/(farmer)/ai/crop-planner')}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cropPlans.length}</Text>
                <Text style={styles.statLabel}>Total Plans</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  ₹
                  {(
                    cropPlans.reduce((sum, plan) => sum + plan.expectedRevenue, 0) / 100000
                  ).toFixed(1)}
                  L
                </Text>
                <Text style={styles.statLabel}>Total Revenue</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {cropPlans.reduce((sum, plan) => sum + plan.recommendations.length, 0)}
                </Text>
                <Text style={styles.statLabel}>Crop Recommendations</Text>
              </View>
            </View>

            {filteredPlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={styles.planCard}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/ai/plan-detail',
                    params: { planId: plan.id },
                  })
                }
              >
                <View style={styles.planHeader}>
                  <View style={styles.planHeaderLeft}>
                    <View style={styles.seasonBadge}>
                      <Text style={styles.seasonIcon}>{getSeasonIcon(plan.season)}</Text>
                      <Text
                        style={[
                          styles.seasonText,
                          { color: getSeasonColor(plan.season) },
                        ]}
                      >
                        {plan.season.toUpperCase()} {plan.year}
                      </Text>
                    </View>
                    <Text style={styles.planDate}>{formatDate(plan.createdAt)}</Text>
                  </View>
                  <Text style={styles.planArrow}>›</Text>
                </View>

                <View style={styles.planLocation}>
                  <Text style={styles.planLocationIcon}>📍</Text>
                  <Text style={styles.planLocationText}>
                    {plan.location.district}, {plan.location.state}
                  </Text>
                </View>

                <View style={styles.planDetails}>
                  <View style={styles.planDetail}>
                    <Text style={styles.planDetailLabel}>Area:</Text>
                    <Text style={styles.planDetailValue}>{plan.area} acres</Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Text style={styles.planDetailLabel}>Soil Type:</Text>
                    <Text style={styles.planDetailValue}>{plan.soilType}</Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Text style={styles.planDetailLabel}>Irrigation:</Text>
                    <Text style={styles.planDetailValue}>
                      {plan.irrigationAvailable ? '✓ Available' : '✗ Not Available'}
                    </Text>
                  </View>
                </View>

                <View style={styles.planMetrics}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricIcon}>💰</Text>
                    <Text style={styles.metricLabel}>Expected Revenue</Text>
                    <Text style={styles.metricValue}>
                      ₹{(plan.expectedRevenue / 1000).toFixed(0)}K
                    </Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricIcon}>🌾</Text>
                    <Text style={styles.metricLabel}>Crops</Text>
                    <Text style={styles.metricValue}>{plan.recommendations.length}</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <Text style={styles.metricIcon}>⚠️</Text>
                    <Text style={styles.metricLabel}>Risk Level</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getRiskColor(plan.riskAssessment.overallRisk) },
                      ]}
                    >
                      {plan.riskAssessment.overallRisk.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.planFooter}>
                  <View style={styles.topCropsContainer}>
                    <Text style={styles.topCropsLabel}>Top Recommendations:</Text>
                    <View style={styles.topCropsChips}>
                      {plan.recommendations.slice(0, 3).map((rec, index) => (
                        <View key={index} style={styles.cropChip}>
                          <Text style={styles.cropChipText}>{rec.cropName}</Text>
                        </View>
                      ))}
                      {plan.recommendations.length > 3 && (
                        <View style={styles.cropChip}>
                          <Text style={styles.cropChipText}>
                            +{plan.recommendations.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planHeaderLeft: {
    flex: 1,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seasonIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  seasonText: {
    ...typography.body,
    fontWeight: '700',
  },
  planDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  planArrow: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  planLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  planLocationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  planLocationText: {
    ...typography.body,
    color: colors.text.primary,
  },
  planDetails: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDetailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  planDetailValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  planMetrics: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  planFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  topCropsContainer: {},
  topCropsLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  topCropsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  cropChip: {
    backgroundColor: `${colors.primary}15`,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cropChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
});