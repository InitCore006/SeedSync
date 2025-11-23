import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/common/useAuth';
import { useFarmerStore } from '@/store/farmerStore';
import { StatCard } from '@/components/farmer/StatCard';
import { LotCard } from '@/components/farmer/LotCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';
import { formatCurrency } from '@lib/utils/format';

export default function FarmerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    dashboardStats,
    statsLoading,
    lots,
    lotsLoading,
    loadDashboardStats,
    loadLots,
  } = useFarmerStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadDashboardStats(), loadLots('ACTIVE')]);
    } catch (error) {
      console.error('Load dashboard error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (statsLoading && !dashboardStats) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const activeLots = lots.filter((lot) => lot.status === 'ACTIVE').slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.first_name || 'Farmer'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(farmer)/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        {dashboardStats && (
          <View style={styles.statsGrid}>
            <StatCard
              icon="cube-outline"
              iconColor={colors.primary[500]}
              label="Active Lots"
              value={dashboardStats.active_lots}
              style={styles.statCard}
            />
            <StatCard
              icon="checkmark-circle-outline"
              iconColor={colors.success}
              label="Sold Lots"
              value={dashboardStats.sold_lots}
              style={styles.statCard}
            />
            <StatCard
              icon="cash-outline"
              iconColor={colors.secondary[500]}
              label="Total Earnings"
              value={formatCurrency(dashboardStats.total_earnings)}
              style={styles.statCardFull}
            />
            <StatCard
              icon="trending-up-outline"
              iconColor={colors.warning}
              label="This Month"
              value={formatCurrency(dashboardStats.this_month_earnings)}
              trend={{
                value: 12.5,
                isPositive: true,
              }}
              style={styles.statCard}
            />
            <StatCard
              icon="bar-chart-outline"
              iconColor={colors.info}
              label="Avg Price/Q"
              value={formatCurrency(dashboardStats.avg_price_per_quintal)}
              style={styles.statCard}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(farmer)/create-lot')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name="add-circle" size={32} color={colors.primary[500]} />
              </View>
              <Text style={styles.actionText}>Create Lot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(farmer)/market')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.secondary[100] }]}>
                <Ionicons name="trending-up" size={32} color={colors.secondary[500]} />
              </View>
              <Text style={styles.actionText}>Market Prices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(farmer)/warehouse')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="business" size={32} color={colors.warning} />
              </View>
              <Text style={styles.actionText}>Warehouse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(farmer)/transport')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="car" size={32} color={colors.info} />
              </View>
              <Text style={styles.actionText}>Transport</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Lots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Lots</Text>
            {activeLots.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(farmer)/lots')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {lotsLoading ? (
            <LoadingSpinner message="Loading lots..." />
          ) : activeLots.length > 0 ? (
            activeLots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                onPress={() => router.push(`/(farmer)/lots/${lot.id}`)}
              />
            ))
          ) : (
            <EmptyState
              icon="cube-outline"
              title="No Active Lots"
              description="You don't have any active lots. Create your first lot to start selling."
              actionLabel="Create Lot"
              onAction={() => router.push('/(farmer)/create-lot')}
            />
          )}
        </View>

        {/* Advisory Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advisory & Insights</Text>
          <View style={styles.advisoryCard}>
            <Ionicons name="sunny" size={32} color={colors.warning} />
            <View style={styles.advisoryContent}>
              <Text style={styles.advisoryTitle}>Weather Alert</Text>
              <Text style={styles.advisoryText}>
                Moderate rainfall expected in the next 3 days. Plan your harvesting accordingly.
              </Text>
            </View>
          </View>

          <View style={styles.advisoryCard}>
            <Ionicons name="leaf" size={32} color={colors.success} />
            <View style={styles.advisoryContent}>
              <Text style={styles.advisoryTitle}>Crop Advisory</Text>
              <Text style={styles.advisoryText}>
                Best time to sow groundnut is approaching. Check market demand before planting.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(farmer)/create-lot')}
      >
        <Ionicons name="add" size={28} color={colors.text.inverse} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },

  scrollContent: {
    paddingBottom: spacing['2xl'],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },

  greeting: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },

  userName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },

  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },

  notificationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },

  statCard: {
    width: `${(100 - 3) / 2}%`,
  },

  statCardFull: {
    width: '100%',
  },

  section: {
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },

  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[500],
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  actionCard: {
    width: `${(100 - 6) / 4}%`,
    alignItems: 'center',
  },

  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  actionText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },

  advisoryCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.default,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  advisoryContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  advisoryTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  advisoryText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },

  fab: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});