import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCrops } from '@/hooks/useCrops';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { HarvestRecord } from '@/types/crop.types';

export default function HarvestHistoryScreen() {
  const { harvests, fetchHarvestRecords, isLoading } = useCrops();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sold' | 'stored'>('all');

  useEffect(() => {
    fetchHarvestRecords();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHarvestRecords();
    setRefreshing(false);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A': return colors.success;
      case 'B': return colors.warning;
      case 'C': return colors.secondary;
      default: return colors.text.secondary;
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'A': return 'Premium';
      case 'B': return 'Standard';
      case 'C': return 'Fair';
      default: return quality;
    }
  };

  const filteredHarvests = harvests.filter((harvest) => {
    if (filter === 'sold') return harvest.soldQuantity && harvest.soldQuantity > 0;
    if (filter === 'stored') return !harvest.soldQuantity || harvest.soldQuantity === 0;
    return true;
  });

  const totalRevenue = harvests.reduce((sum, h) => sum + (h.revenue || 0), 0);
  const totalQuantity = harvests.reduce((sum, h) => sum + h.quantity, 0);
  const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

  const renderHarvestCard = (harvest: HarvestRecord) => (
    <Pressable
      key={harvest.id}
      style={styles.card}
      onPress={() => router.push(`/(farmer)/crops/harvest-detail?id=${harvest.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardDate}>
            {new Date(harvest.harvestDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          <View
            style={[
              styles.qualityBadge,
              { backgroundColor: `${getQualityColor(harvest.quality)}20` },
            ]}
          >
            <Text style={[styles.qualityText, { color: getQualityColor(harvest.quality) }]}>
              {getQualityLabel(harvest.quality)}
            </Text>
          </View>
        </View>
        {harvest.soldQuantity && harvest.soldQuantity > 0 && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>Sold</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{harvest.quantity} Q</Text>
          <Text style={styles.statLabel}>Harvested</Text>
        </View>
        {harvest.revenue && (
          <>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statValue}>₹{harvest.revenue.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statIcon}>💧</Text>
          <Text style={styles.statValue}>{harvest.moistureContent}%</Text>
          <Text style={styles.statLabel}>Moisture</Text>
        </View>
      </View>

      {harvest.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          📝 {harvest.notes}
        </Text>
      )}

      {harvest.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {harvest.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.thumbnail} />
          ))}
        </ScrollView>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Harvest History</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🌾</Text>
          <Text style={styles.summaryValue}>{totalQuantity.toFixed(1)} Q</Text>
          <Text style={styles.summaryLabel}>Total Harvested</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💰</Text>
          <Text style={styles.summaryValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📊</Text>
          <Text style={styles.summaryValue}>₹{avgPrice.toFixed(0)}/Q</Text>
          <Text style={styles.summaryLabel}>Avg Price</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({harvests.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'sold' && styles.filterTabActive]}
          onPress={() => setFilter('sold')}
        >
          <Text style={[styles.filterText, filter === 'sold' && styles.filterTextActive]}>
            Sold
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'stored' && styles.filterTabActive]}
          onPress={() => setFilter('stored')}
        >
          <Text style={[styles.filterText, filter === 'stored' && styles.filterTextActive]}>
            Stored
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading && !refreshing ? (
        <LoadingSpinner />
      ) : filteredHarvests.length === 0 ? (
        <EmptyState
          icon="🌾"
          title="No Harvest Records"
          description="Your harvest history will appear here"
          actionLabel="Go to Crops"
          onAction={() => router.push('/(farmer)/crops')}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {filteredHarvests.map(renderHarvestCard)}
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.body,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardDate: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  qualityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  soldBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  soldText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  notes: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  imageScroll: {
    marginTop: spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.border,
  },
});