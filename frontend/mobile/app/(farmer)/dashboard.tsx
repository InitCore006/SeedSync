import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Sidebar from '@/components/layout/Sidebar';
import WeatherCard from '@/components/weather/WeatherCard';
import QuickActions from '@/components/dashboard/QuickActions';
import EmptyState from '@/components/dashboard/EmptyState';
import Card from '@/components/common/Card';
import { useCrops } from '@/hooks/useCrops';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { CROP_STATUS_CONFIG } from '@/lib/constants/crops';
import { Crop } from '@/types/crop.types';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { crops, statistics, isLoading, refreshing, refresh } = useCrops();

  const handleNotificationPress = () => {
    router.push('/(farmer)/notifications' as any);
  };

  const quickActions = [
    {
      id: 'add-crop',
      title: 'Add Crop',
      icon: 'leaf' as const,
      color: colors.primary,
      onPress: () => router.push('/(farmer)/crops/add-crop' as any),
    },
    {
      id: 'my-crops',
      title: 'My Crops',
      icon: 'albums' as const,
      color: colors.success,
      onPress: () => router.push('/(farmer)/crops' as any),
    },
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'cube' as const,
      color: colors.accent,
      onPress: () => router.push('/(farmer)/inventory' as any),
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: 'storefront' as const,
      color: colors.info,
      onPress: () => router.push('/(farmer)/marketplace' as any),
    },
  ];

  const getStatusConfig = (status: string) => {
    return CROP_STATUS_CONFIG[status as keyof typeof CROP_STATUS_CONFIG] || {
      label: status,
      icon: 'leaf',
      color: colors.gray[500],
      bgColor: withOpacity(colors.gray[500], 0.1),
    };
  };

  const renderRecentCrop = ({ item }: { item: Crop }) => {
  const statusConfig = getStatusConfig(item.status);
  
  // Calculate days until harvest
  const calculateDaysUntilHarvest = (harvestDate: string): number => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilHarvest = calculateDaysUntilHarvest(item.expected_harvest_date);
  const isHarvestSoon = daysUntilHarvest > 0 && daysUntilHarvest <= 14;

  return (
    <TouchableOpacity
      style={styles.recentCropCard}
      onPress={() => router.push(`/(farmer)/crops/${item.id}` as any)}
      activeOpacity={0.7}
    >
      {/* Left Section - Icon & Info */}
      <View style={styles.recentCropLeft}>
        <View
          style={[
            styles.recentCropIcon,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={24}
            color={statusConfig.color}
          />
        </View>
        <View style={styles.recentCropInfo}>
          <Text style={styles.recentCropName} numberOfLines={1}>
            {item.crop_type_display}
          </Text>
          <Text style={styles.recentCropVariety} numberOfLines={1}>
            {item.variety}
          </Text>
          <View style={styles.recentCropMeta}>
            <View style={styles.recentCropMetaItem}>
              <Ionicons name="resize-outline" size={12} color={colors.text.secondary} />
              <Text style={styles.recentCropMetaText}>{item.planted_area} acres</Text>
            </View>
            <View style={styles.recentCropMetaDivider} />
            <View style={styles.recentCropMetaItem}>
              <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
              <Text style={styles.recentCropMetaText}>{item.district}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right Section - Status & Days */}
      <View style={styles.recentCropRight}>
        <View
          style={[styles.recentCropStatus, { backgroundColor: statusConfig.bgColor }]}
        >
          <Text style={[styles.recentCropStatusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        {daysUntilHarvest > 0 && (
          <View style={[
            styles.recentCropDays,
            isHarvestSoon && styles.recentCropDaysWarning
          ]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isHarvestSoon ? colors.warning : colors.text.secondary}
            />
            <Text style={[
              styles.recentCropDaysText,
              isHarvestSoon && { color: colors.warning }
            ]}>
              {daysUntilHarvest}d left
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

  
  return (
    <View style={styles.container}>
      {/* Weather Header with integrated menu and notifications */}
      <WeatherCard
        onMenuPress={() => setSidebarVisible(true)}
        onNotificationPress={handleNotificationPress}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

         {/* Recent Crops */}
        {crops.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Crops</Text>
              <TouchableOpacity
                onPress={() => router.push('/(farmer)/crops' as any)}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentCropsContainer}>
              {crops.slice(0, 4).map((crop) => (
                <View key={crop.id}>
                  {renderRecentCrop({ item: crop })}
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* Empty State for First-Time Users */
          <EmptyState
            icon="leaf-outline"
            title="Start Your Farming Journey"
            description="Add your first crop to track growth, manage inventory, and connect with buyers."
            actionLabel="Add Your First Crop"
            onActionPress={() => router.push('/(farmer)/crops/add-crop' as any)}
          />
        )}

       

       
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
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    gap: spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  recentCropsContainer: {
    gap: spacing.sm,
  },
  recentCropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  recentCropLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  recentCropIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recentCropInfo: {
    flex: 1,
  },
  recentCropName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  recentCropVariety: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  recentCropMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recentCropMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentCropMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.gray[300],
  },
  recentCropMetaText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  recentCropRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  recentCropStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  recentCropStatusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  recentCropDays: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentCropDaysWarning: {
    backgroundColor: withOpacity(colors.warning, 0.1),
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recentCropDaysText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withOpacity(colors.warning, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  tipDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});