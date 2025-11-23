import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMarketPrices } from '@/hooks/farmer/useMarketPrices';
import { MarketPriceCard } from '@/components/farmer/MarketPriceCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Select, SelectOption } from '@/components/common/Select';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';
import { STATES } from '@lib/constants/options';

const CROP_FILTERS: SelectOption[] = [
  { label: 'All Crops', value: 'ALL' },
  { label: 'Groundnut', value: 'GROUNDNUT' },
  { label: 'Cotton', value: 'COTTON' },
  { label: 'Wheat', value: 'WHEAT' },
  { label: 'Rice', value: 'RICE' },
  { label: 'Soybean', value: 'SOYBEAN' },
];

export default function MarketPricesScreen() {
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedState, setSelectedState] = useState('');

  const {
    prices,
    pricesLoading,
    refreshing,
    refresh,
    loadPrices,
  } = useMarketPrices();

  useEffect(() => {
    loadPrices(selectedCrop === 'ALL' ? undefined : selectedCrop, selectedState || undefined);
  }, [selectedCrop, selectedState]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market Prices</Text>
        <TouchableOpacity onPress={refresh}>
          <Ionicons name="refresh" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Select
            placeholder="Select Crop"
            value={selectedCrop}
            options={CROP_FILTERS}
            onSelect={setSelectedCrop}
            containerStyle={styles.filterSelect}
          />
          <Select
            placeholder="Select State"
            value={selectedState}
            options={[{ label: 'All States', value: '' }, ...STATES]}
            onSelect={setSelectedState}
            containerStyle={styles.filterSelect}
          />
        </View>

        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.updateText}>Last updated: Today at 10:00 AM</Text>
        </View>
      </View>

      {/* Prices List */}
      {pricesLoading && !prices.length ? (
        <LoadingSpinner fullScreen message="Loading market prices..." />
      ) : (
        <FlatList
          data={prices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MarketPriceCard price={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="bar-chart-outline"
              title="No Market Prices"
              description="Market prices are not available for the selected filters."
            />
          }
        />
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={colors.info} />
        <Text style={styles.infoBannerText}>
          Prices are indicative and may vary based on quality, location, and market conditions.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },

  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },

  filtersContainer: {
    backgroundColor: colors.background.default,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  filterSelect: {
    flex: 1,
    marginBottom: 0,
  },

  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  updateText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },

  listContent: {
    padding: spacing.lg,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '15',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.info,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
});