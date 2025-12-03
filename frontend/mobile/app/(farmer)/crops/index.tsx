import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import { useCrops, useCropFilters } from '@/hooks/useCrops';
import { colors, withOpacity, colorPalette } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { CROP_STATUS_CONFIG } from '@/lib/constants/crops';
import { Crop } from '@/types/crop.types';

const STATUS_FILTERS = [
  { value: 'all', label: 'All', icon: 'apps', color: colors.gray[600] },
  { value: 'planted', label: 'Planted', icon: 'leaf', color: colorPalette.primary[500] },
  { value: 'growing', label: 'Growing', icon: 'trending-up', color: colors.success },
  { value: 'flowering', label: 'Flowering', icon: 'flower', color: colors.warning },
  { value: 'matured', label: 'Matured', icon: 'checkmark-circle', color: colors.info },
  { value: 'harvested', label: 'Harvested', icon: 'basket', color: colors.accent },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: 'time-outline' },
  { value: 'oldest', label: 'Oldest First', icon: 'time-outline' },
  { value: 'area_desc', label: 'Largest Area', icon: 'resize-outline' },
  { value: 'area_asc', label: 'Smallest Area', icon: 'resize-outline' },
  { value: 'harvest_soon', label: 'Harvest Soon', icon: 'calendar-outline' },
];

const VIEW_MODES = [
  { value: 'card', icon: 'square', label: 'Card' },
  { value: 'compact', icon: 'list', label: 'Compact' },
];

export default function MyCropsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { crops, statistics, isLoading, refreshing, refresh } = useCrops();
  const {
    filteredCrops,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
  } = useCropFilters();

  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const getStatusConfig = (status: string) => {
    return CROP_STATUS_CONFIG[status as keyof typeof CROP_STATUS_CONFIG] || {
      label: status,
      icon: 'leaf',
      color: colors.gray[500],
      bgColor: withOpacity(colors.gray[500], 0.1),
    };
  };

  const calculateDaysUntilHarvest = (harvestDate: string): number => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (plantingDate: string, harvestDate: string): number => {
    const today = new Date();
    const planting = new Date(plantingDate);
    const harvest = new Date(harvestDate);
    const totalDays = (harvest.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24);
    const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
    return progress;
  };

  const sortCrops = (crops: Crop[]) => {
    const sorted = [...crops];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'area_desc':
        return sorted.sort((a, b) => b.planted_area - a.planted_area);
      case 'area_asc':
        return sorted.sort((a, b) => a.planted_area - b.planted_area);
      case 'harvest_soon':
        return sorted.sort((a, b) => {
          const daysA = calculateDaysUntilHarvest(a.expected_harvest_date);
          const daysB = calculateDaysUntilHarvest(b.expected_harvest_date);
          return daysA - daysB;
        });
      default:
        return sorted;
    }
  };

  const renderCropCard = ({ item }: { item: Crop }) => {
    const statusConfig = getStatusConfig(item.status);
    const daysUntilHarvest = calculateDaysUntilHarvest(item.expected_harvest_date);
    const progress = calculateProgress(item.planting_date, item.expected_harvest_date);
    const isHarvestSoon = daysUntilHarvest > 0 && daysUntilHarvest <= 14;

    if (viewMode === 'compact') {
      return (
        <Pressable
          onPress={() => router.push(`/(farmer)/crops/${item.id}` as any)}
          style={({ pressed }) => [
            styles.compactCard,
            pressed && styles.compactCardPressed,
          ]}
        >
          <View style={styles.compactLeft}>
            <View style={[styles.compactIcon, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={24} color={statusConfig.color} />
            </View>
            <View style={styles.compactInfo}>
              <Text style={styles.compactName} numberOfLines={1}>{item.crop_type_display}</Text>
              <Text style={styles.compactVariety} numberOfLines={1}>{item.variety}</Text>
              <View style={styles.compactMeta}>
                <View style={styles.compactMetaItem}>
                  <Ionicons name="resize-outline" size={12} color={colors.text.secondary} />
                  <Text style={styles.compactMetaText}>{item.planted_area} ac</Text>
                </View>
                <View style={styles.compactMetaDivider} />
                <View style={styles.compactMetaItem}>
                  <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
                  <Text style={styles.compactMetaText}>{item.district}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.compactRight}>
            <View style={[styles.compactStatus, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.compactStatusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            {daysUntilHarvest > 0 && (
              <View style={[styles.compactDays, isHarvestSoon && styles.compactDaysWarning]}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={isHarvestSoon ? colors.warning : colors.text.secondary} 
                />
                <Text style={[styles.compactDaysText, isHarvestSoon && { color: colors.warning }]}>
                  {daysUntilHarvest}d
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={() => router.push(`/(farmer)/crops/${item.id}` as any)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.cardIcon, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={28} color={statusConfig.color} />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.crop_type_display}</Text>
              <Text style={styles.cardVariety} numberOfLines={1}>{item.variety}</Text>
            </View>
          </View>
          <View style={[styles.cardStatusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.cardStatusText}>{statusConfig.label}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.cardProgress}>
          <View style={styles.cardProgressHeader}>
            <Text style={styles.cardProgressLabel}>Growth Progress</Text>
            <Text style={[styles.cardProgressPercent, { color: statusConfig.color }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.cardProgressBar}>
            <Animated.View
              style={[
                styles.cardProgressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: statusConfig.color,
                },
              ]}
            />
          </View>
        </View>

        {/* Card Stats */}
        <View style={styles.cardStats}>
          <View style={styles.cardStat}>
            <View style={[styles.cardStatIcon, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
              <Ionicons name="resize-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.cardStatValue}>{item.planted_area}</Text>
            <Text style={styles.cardStatLabel}>Acres</Text>
          </View>

          <View style={styles.cardStat}>
            <View style={[styles.cardStatIcon, { backgroundColor: withOpacity(colors.accent, 0.1) }]}>
              <Ionicons name="calendar-outline" size={16} color={colors.accent} />
            </View>
            <Text style={styles.cardStatValue}>
              {new Date(item.planting_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </Text>
            <Text style={styles.cardStatLabel}>Planted</Text>
          </View>

          {daysUntilHarvest > 0 ? (
            <View style={styles.cardStat}>
              <View style={[
                styles.cardStatIcon,
                { backgroundColor: withOpacity(isHarvestSoon ? colors.warning : colors.info, 0.1) }
              ]}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isHarvestSoon ? colors.warning : colors.info}
                />
              </View>
              <Text style={[styles.cardStatValue, isHarvestSoon && { color: colors.warning }]}>
                {daysUntilHarvest}
              </Text>
              <Text style={[styles.cardStatLabel, isHarvestSoon && { color: colors.warning }]}>
                Days Left
              </Text>
            </View>
          ) : (
            <View style={styles.cardStat}>
              <View style={[styles.cardStatIcon, { backgroundColor: withOpacity(colors.success, 0.1) }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
              </View>
              <Text style={[styles.cardStatValue, { color: colors.success }]}>Ready</Text>
              <Text style={styles.cardStatLabel}>Harvest</Text>
            </View>
          )}

          {item.estimated_yield && (
            <View style={styles.cardStat}>
              <View style={[styles.cardStatIcon, { backgroundColor: withOpacity(colors.success, 0.1) }]}>
                <Ionicons name="trending-up-outline" size={16} color={colors.success} />
              </View>
              <Text style={styles.cardStatValue}>{item.estimated_yield}</Text>
              <Text style={styles.cardStatLabel}>Quintals</Text>
            </View>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardLocation}>
            <Ionicons name="location" size={14} color={colors.text.secondary} />
            <Text style={styles.cardLocationText}>{item.district}, {item.state}</Text>
          </View>
          <TouchableOpacity style={styles.cardAction}>
            <Text style={styles.cardActionText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  if (isLoading && crops.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your crops...</Text>
      </View>
    );
  }

  const sortedCrops = sortCrops(filteredCrops);

  if (crops.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            icon="leaf-outline"
            title="No Crops Yet"
            description="Start your farming journey by adding your first crop. Track growth, manage inputs, and maximize your yield!"
            actionLabel="Add Your First Crop"
            onAction={() => router.push('/(farmer)/crops/add-crop' as any)}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header Section */}
      {statistics && (
        <LinearGradient
          colors={[colors.primary, colors.primaryLight, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { paddingTop: insets.top }]}
        >
          {/* Back Button and Add Button */}
          <View style={styles.heroTopBar}>
            <Pressable
              style={({ pressed }) => [
                styles.heroBackButton,
                pressed && styles.heroButtonPressed
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.heroAddButton,
                pressed && styles.heroButtonPressed
              ]}
              onPress={() => router.push('/(farmer)/crops/add-crop' as any)}
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </Pressable>
          </View>

          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <Text style={styles.heroGreeting}>My Crops</Text>
            <View style={styles.heroLocationContainer}>
              <Ionicons name="leaf" size={14} color={withOpacity(colors.white, 0.9)} />
              <Text style={styles.heroSubtitle}>Track and manage your farm</Text>
            </View>
          </View>

          {/* Compact Stats Grid - 2x2 */}
          <View style={styles.heroStatsGrid}>
            <View style={styles.heroStatCard}>
              <Ionicons name="leaf" size={20} color={colors.white} />
              <View style={styles.heroStatContent}>
                <Text style={styles.heroStatValue}>{statistics.total_crops}</Text>
                <Text style={styles.heroStatLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.heroStatCard}>
              <Ionicons name="trending-up" size={20} color={colors.white} />
              <View style={styles.heroStatContent}>
                <Text style={styles.heroStatValue}>{statistics.active_crops}</Text>
                <Text style={styles.heroStatLabel}>Active</Text>
              </View>
            </View>

            <View style={styles.heroStatCard}>
              <Ionicons name="resize" size={20} color={colors.white} />
              <View style={styles.heroStatContent}>
                <Text style={styles.heroStatValue}>{statistics.total_area.toFixed(1)}</Text>
                <Text style={styles.heroStatLabel}>Acres</Text>
              </View>
            </View>

            <View style={styles.heroStatCard}>
              <Ionicons name="checkmark-done" size={20} color={colors.white} />
              <View style={styles.heroStatContent}>
                <Text style={styles.heroStatValue}>
                  {crops.filter(c => c.status === 'harvested').length}
                </Text>
                <Text style={styles.heroStatLabel}>Harvested</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={() => router.push('/(farmer)/ai/yield-prediction' as any)}
            >
              <Ionicons name="analytics" size={16} color={colors.white} />
              <Text style={styles.heroActionText}>AI Insights</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={() => router.push('/(farmer)/market/prices' as any)}
            >
              <Ionicons name="trending-up" size={16} color={colors.white} />
              <Text style={styles.heroActionText}>Market</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroActionButton}
              onPress={() => router.push('/(farmer)/weather' as any)}
            >
              <Ionicons name="cloud" size={16} color={colors.white} />
              <Text style={styles.heroActionText}>Weather</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {/* Search and Filter Section - Fixed */}
      <View style={styles.searchSection}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.secondary}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Sort */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.text.primary} />
            <Text style={styles.controlButtonText}>Sort</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* View Mode */}
          <View style={styles.viewToggle}>
            {VIEW_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.viewToggleButton,
                  viewMode === mode.value && styles.viewToggleButtonActive,
                ]}
                onPress={() => setViewMode(mode.value as 'card' | 'compact')}
              >
                <Ionicons
                  name={mode.icon as any}
                  size={16}
                  color={viewMode === mode.value ? colors.white : colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort Bottom Sheet */}
        {showSortMenu && (
          <View style={styles.sortSheet}>
            <View style={styles.sortSheetHandle} />
            <Text style={styles.sortSheetTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortSheetOption,
                  sortBy === option.value && styles.sortSheetOptionActive,
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortMenu(false);
                }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={sortBy === option.value ? colors.primary : colors.text.secondary}
                />
                <Text style={[
                  styles.sortSheetOptionText,
                  sortBy === option.value && styles.sortSheetOptionTextActive,
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Status Filter Chips - Fixed */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
        style={styles.filtersContainer}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              selectedStatus === filter.value && [
                styles.filterChipActive,
                { backgroundColor: filter.color, borderColor: filter.color }
              ],
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={selectedStatus === filter.value ? colors.white : colors.text.secondary}
            />
            <Text style={[
              styles.filterChipText,
              selectedStatus === filter.value && styles.filterChipTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count - Fixed */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {sortedCrops.length} {sortedCrops.length === 1 ? 'crop' : 'crops'}
        </Text>
        {searchQuery && (
          <Text style={styles.resultsQuery}> matching "{searchQuery}"</Text>
        )}
      </View>

      {/* Scrollable Crop List */}
      <FlatList
        data={sortedCrops}
        renderItem={renderCropCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyResults}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={48} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No crops found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
            >
              <Text style={styles.emptyButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  
  // Hero Card - Matching Weather Card Design
  heroCard: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  heroBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonPressed: {
    backgroundColor: withOpacity(colors.white, 0.2),
  },
  heroHeader: {
    marginBottom: spacing.md,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: withOpacity(colors.white, 0.9),
    fontWeight: '500',
    marginLeft: 4,
  },
  heroStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroStatCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: withOpacity(colors.white, 0.15),
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroStatContent: {
    flex: 1,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    color: withOpacity(colors.white, 0.85),
    fontWeight: '500',
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: withOpacity(colors.white, 0.15),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withOpacity(colors.white, 0.2),
  },
  heroActionText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },


  // Search Section - Full Width
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
  },
  searchClear: {
    padding: spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  controlButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: 3,
    ...shadows.sm,
  },
  viewToggleButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.primary,
  },

  // Sort Sheet
  sortSheet: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  sortSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sortSheetTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sortSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
    borderRadius: borderRadius.md,
  },
  sortSheetOptionActive: {
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  sortSheetOptionText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  sortSheetOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

   // Filters - Full Width
  filtersContainer: {
    marginBottom: spacing.md,
    paddingBottom:16,
    maxHeight: 50,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadows.sm,
    minHeight: 36,
  },
  filterChipActive: {
    borderWidth: 0,
    ...shadows.md,
    paddingVertical: spacing.sm + 3,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterChipTextActive: {
    color: colors.white,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  resultsCount: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  resultsQuery: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 15,
  },

  // List Content
  listContent: {
    paddingHorizontal: spacing.lg,
  },

  // Card View
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardVariety: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
  },
  cardStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  cardStatusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  cardProgress: {
    marginBottom: spacing.md,
  },
  cardProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardProgressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  cardProgressPercent: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 13,
  },
  cardProgressBar: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardStat: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  cardStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cardStatValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  cardStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardLocationText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },

  // Compact View
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  compactCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactVariety: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.gray[300],
  },
  compactMetaText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  compactStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  compactStatusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  compactDays: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactDaysWarning: {
    backgroundColor: withOpacity(colors.warning, 0.1),
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  compactDaysText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});