import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCrops } from '@/hooks/useCrops';
import { useAuthStore } from '@/store/authStore';
import CropCard from '@/components/farmer/CropCard';
import QuickActionButton from '@/components/farmer/QuickActionButton';
import StatCard from '@/components/farmer/StatCard';
import WeatherWidget from '@/components/farmer/WeatherWidget';
import AlertBanner from '@/components/farmer/AlertBanner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function FarmerDashboard() {
  const { user } = useAuthStore();
  const { activeCrops, analytics, fetchActiveCrops, fetchAnalytics, isLoading } = useCrops();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchActiveCrops();
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveCrops();
    await fetchAnalytics();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get all active alerts from crops
  const activeAlerts = activeCrops.flatMap((crop) => 
    crop.riskFactors.filter(risk => !risk.resolved)
  );

  // Mock weather data for dashboard
  const mockWeather = {
    temperature: 28,
    humidity: 65,
    rainfall: 5,
    windSpeed: 12,
    forecast: [
      { date: '2024-11-28', condition: 'sunny' as const, temperature: 29, rainfall: 0 },
      { date: '2024-11-29', condition: 'cloudy' as const, temperature: 27, rainfall: 2 },
      { date: '2024-11-30', condition: 'rainy' as const, temperature: 25, rainfall: 15 },
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{user?.name || 'Farmer'}</Text>
          </View>
          <Pressable
            style={styles.notificationButton}
            onPress={() => router.push('/(farmer)/notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {activeAlerts.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {activeAlerts.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActions}
          >
            <QuickActionButton
              icon="🌾"
              label="Add Crop"
              onPress={() => router.push('/(farmer)/crops/add-crop')}
              variant="primary"
            />
            <QuickActionButton
              icon="📸"
              label="AI Scanner"
              onPress={() => router.push('/(farmer)/ai/crop-scanner')}
              variant="success"
            />
            <QuickActionButton
              icon="🛒"
              label="Marketplace"
              onPress={() => router.push('/(farmer)/marketplace')}
              variant="secondary"
            />
            <QuickActionButton
              icon="📊"
              label="Analytics"
              onPress={() => router.push('/(farmer)/crops/farm-analytics')}
              variant="warning"
            />
            <QuickActionButton
              icon="💰"
              label="Wallet"
              onPress={() => router.push('/(farmer)/wallet')}
              variant="primary"
            />
          </ScrollView>
        </View>

        {/* Farm Statistics */}
        {analytics && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Farm Overview</Text>
              <Pressable onPress={() => router.push('/(farmer)/crops/farm-analytics')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Area"
                value={`${analytics.totalArea}`}
                unit="acres"
                icon="📏"
                trend={null}
              />
              <StatCard
                title="Active Crops"
                value={`${analytics.activeCrops}`}
                unit="crops"
                icon="🌱"
                trend={null}
              />
              <StatCard
                title="Total Revenue"
                value={`₹${(analytics.totalRevenue / 1000).toFixed(0)}K`}
                unit=""
                icon="💰"
                trend={{ value: analytics.profitMargin, isPositive: analytics.profitMargin > 0 }}
              />
              <StatCard
                title="Avg Yield"
                value={`${analytics.avgYield.toFixed(1)}`}
                unit="Q/acre"
                icon="📊"
                trend={null}
              />
            </View>
          </View>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Alerts</Text>
              <Pressable onPress={() => router.push('/(farmer)/ai/risk-alerts')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>
            {activeAlerts.slice(0, 2).map((alert) => (
              <AlertBanner key={alert.id} risk={alert} />
            ))}
          </View>
        )}

        {/* Weather Widget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Forecast</Text>
          <WeatherWidget weather={mockWeather} />
        </View>

        {/* Active Crops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Crops</Text>
            <Pressable onPress={() => router.push('/(farmer)/crops')}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          {activeCrops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌾</Text>
              <Text style={styles.emptyTitle}>No Active Crops</Text>
              <Text style={styles.emptyText}>Start by adding your first crop</Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push('/(farmer)/crops/add-crop')}
              >
                <Text style={styles.emptyButtonText}>+ Add Crop</Text>
              </Pressable>
            </View>
          ) : (
            activeCrops.slice(0, 3).map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onPress={() => router.push(`/(farmer)/crops/${crop.id}`)}
              />
            ))
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Services</Text>
          <View style={styles.linksGrid}>
            <Pressable
              style={styles.linkCard}
              onPress={() => router.push('/(farmer)/fpo')}
            >
              <Text style={styles.linkIcon}>👥</Text>
              <Text style={styles.linkText}>FPO</Text>
            </Pressable>
            <Pressable
              style={styles.linkCard}
              onPress={() => router.push('/(farmer)/schemes')}
            >
              <Text style={styles.linkIcon}>🏛️</Text>
              <Text style={styles.linkText}>Schemes</Text>
            </Pressable>
            <Pressable
              style={styles.linkCard}
              onPress={() => router.push('/(farmer)/learning')}
            >
              <Text style={styles.linkIcon}>📚</Text>
              <Text style={styles.linkText}>Learn</Text>
            </Pressable>
            <Pressable
              style={styles.linkCard}
              onPress={() => router.push('/(farmer)/logistics')}
            >
              <Text style={styles.linkIcon}>🚚</Text>
              <Text style={styles.linkText}>Logistics</Text>
            </Pressable>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: colors.text.secondary,
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.surface,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  viewAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    paddingLeft: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  emptyButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  linkCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  linkIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  linkText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});