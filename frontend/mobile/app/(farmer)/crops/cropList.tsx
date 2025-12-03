import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useCropStore } from '@/store/cropStore';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { CROP_STATUS_CONFIG } from '@/lib/constants/crops';
import { Crop } from '@/types/crop.types';

export default function CropsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    crops,
    statistics,
    isLoading,
    fetchMyCrops,
    fetchStatistics,
  } = useCropStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchMyCrops(),
      fetchStatistics(),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter crops
  const filteredCrops = useMemo(() => {
    let filtered = [...crops];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((crop) =>
        crop.crop_type_display.toLowerCase().includes(query) ||
        crop.variety.toLowerCase().includes(query) ||
        crop.crop_id.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((crop) => crop.status === selectedStatus);
    }

    // Sort by planting date (newest first)
    filtered.sort((a, b) =>
      new Date(b.planting_date).getTime() - new Date(a.planting_date).getTime()
    );

    return filtered;
  }, [crops, searchQuery, selectedStatus]);

  // Status filter buttons
  const statusFilters = [
    { key: 'all', label: 'All', count: crops.length },
    { key: 'growing', label: 'Growing', count: statistics?.by_status?.growing || 0 },
    { key: 'flowering', label: 'Flowering', count: statistics?.by_status?.flowering || 0 },
    { key: 'matured', label: 'Matured', count: statistics?.by_status?.matured || 0 },
    { key: 'harvested', label: 'Harvested', count: statistics?.by_status?.harvested || 0 },
  ];

  const renderCropCard = ({ item }: { item: Crop }) => {
    const statusConfig = CROP_STATUS_CONFIG[item.status];
    const daysProgress = Math.max(0, item.days_since_planting);
    const totalDays = daysProgress + Math.max(0, item.days_until_harvest);
    const progress = totalDays > 0 ? (daysProgress / totalDays) * 100 : 0;

    return (
      <TouchableOpacity
        style={styles.cropCard}
        onPress={() => router.push(`/(farmer)/crops/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.cropCardHeader}>
          <View style={styles.cropCardLeft}>
            <View style={[
              styles.cropIcon,
              { backgroundColor: withOpacity(statusConfig.color, 0.1) }
            ]}>
              <Ionicons
                name={statusConfig.icon as any}
                size={24}
                color={statusConfig.color}
              />
            </View>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{item.crop_type_display}</Text>
              <Text style={styles.cropVariety}>{item.variety}</Text>
              <Text style={styles.cropId}>ID: {item.crop_id}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bgColor }
          ]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.cropDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="grid-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{item.planted_area} acres</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {new Date(item.planting_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.district}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Growth Progress</Text>
            <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[statusConfig.color, withOpacity(statusConfig.color, 0.7)]}
              style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressDays}>
              {item.days_since_planting} days planted
            </Text>
            {item.days_until_harvest > 0 && (
              <Text style={styles.progressDays}>
                {item.days_until_harvest} days to harvest
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={80} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>No Crops Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedStatus !== 'all'
          ? 'Try adjusting your filters'
          : 'Start by adding your first crop'}
      </Text>
      {!searchQuery && selectedStatus === 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(farmer)/crops/add-crop' as any)}
        >
          <Text style={styles.emptyButtonText}>Add Crop</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && crops.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading crops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Crops</Text>
            {statistics && (
              <Text style={styles.headerSubtitle}>
                {statistics.total_crops} crops • {statistics.total_area.toFixed(1)} acres
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(farmer)/crops/add-crop' as any)}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
              <View style={[
                styles.filterBadge,
                selectedStatus === item.key && styles.filterBadgeActive,
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  selectedStatus === item.key && styles.filterBadgeTextActive,
                ]}>
                  {item.count}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Crops List */}
      <FlatList
        data={filteredCrops}
        keyExtractor={(item) => item.id}
        renderItem={renderCropCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.body,
    color: withOpacity(colors.white, 0.9),
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: withOpacity(colors.white, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.white, 0.15),
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    marginLeft: spacing.sm,
    height: 48,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filtersList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filterBadge: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: withOpacity(colors.white, 0.3),
  },
  filterBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  filterBadgeTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  cropCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cropCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cropCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  cropIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  cropVariety: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: 2,
  },
  cropId: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  cropDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 13,
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  progressValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDays: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    ...typography.button,
    color: colors.white,
  },
});