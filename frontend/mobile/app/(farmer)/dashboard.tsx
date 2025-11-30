import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '@/components/layout/AppHeader';
import Sidebar from '@/components/layout/Sidebar';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { useFarmerStore } from '@/store/farmerStore';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { farmer, farmDetails } = useFarmerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    { id: 'add-crop', title: 'Add Crop', icon: '🌱', route: '/(farmer)/crops/add-crop', color: colors.success },
    { id: 'weather', title: 'Weather', icon: '🌤️', route: '/(farmer)/weather', color: colors.info },
    { id: 'market', title: 'Market', icon: '📊', route: '/(farmer)/market', color: colors.warning },
    { id: 'ai-scan', title: 'AI Scan', icon: '📸', route: '/(farmer)/ai/crop-scanner', color: colors.primary },
  ];

  const services = [
    { id: 'wallet', title: 'Wallet', icon: '💰', route: '/(farmer)/wallet', balance: '₹12,500' },
    { id: 'transport', title: 'Transport', icon: '🚚', route: '/(farmer)/transport', subtitle: 'Book Now' },
    { id: 'fpo', title: 'FPO Network', icon: '🤝', route: '/(farmer)/fpo', subtitle: '2 Memberships' },
    { id: 'schemes', title: 'Schemes', icon: '📋', route: '/(farmer)/schemes', subtitle: '5 Available' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Menu and Notifications */}
      <AppHeader
        showMenuButton
        showNotifications
        onMenuPress={() => setSidebarVisible(true)}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Morning! 👋</Text>
          <Text style={styles.welcomeText}>
            Welcome back, {farmer?.name || 'Farmer'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: `${colors.success}15` }]}>
            <Text style={styles.statIcon}>🌾</Text>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Active Crops</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={styles.statIcon}>🏞️</Text>
            <Text style={styles.statValue}>{farmDetails?.totalArea || 0}</Text>
            <Text style={styles.statLabel}>Acres</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: `${colors.warning}15` }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>₹12.5K</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles.quickActionCard,
                  { backgroundColor: `${action.color}15` },
                  pressed && styles.quickActionCardPressed,
                ]}
                onPress={() => router.push(action.route as any)}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {services.map((service) => (
            <Pressable
              key={service.id}
              style={({ pressed }) => [
                styles.serviceCard,
                pressed && styles.serviceCardPressed,
              ]}
              onPress={() => router.push(service.route as any)}
            >
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceIconText}>{service.icon}</Text>
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceSubtitle}>
                  {service.balance || service.subtitle}
                </Text>
              </View>
              <Text style={styles.serviceArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>🌱</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Wheat crop added</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>💰</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Payment received</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
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
  content: {
    padding: spacing.md,
  },
  welcomeSection: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  quickActionIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  serviceCardPressed: {
    opacity: 0.7,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  serviceIconText: {
    fontSize: 24,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  serviceArrow: {
    ...typography.h4,
    color: colors.gray[400],
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
});