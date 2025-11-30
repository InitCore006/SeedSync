import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useMarket } from '@/hooks/useMarket';
import MarketCard from '@/components/market/MarketCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function NearbyMarketsScreen() {
  const { markets, isLoading, fetchMarketsNearMe } = useMarket();
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  const requestLocationAndFetch = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        await fetchMarketsNearMe();
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required to show nearby markets.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarketsNearMe();
    setRefreshing(false);
  };

  const marketTypes = [
    { label: 'All', value: null, count: markets.length },
    { label: 'APMC', value: 'APMC', count: markets.filter((m) => m.type === 'APMC').length },
    { label: 'E-NAM', value: 'E-NAM', count: markets.filter((m) => m.type === 'E-NAM').length },
    {
      label: 'Private',
      value: 'Private',
      count: markets.filter((m) => m.type === 'Private').length,
    },
  ];

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredMarkets = selectedType
    ? markets.filter((m) => m.type === selectedType)
    : markets;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Nearby Markets</Text>
        <Pressable onPress={requestLocationAndFetch}>
          <Text style={styles.refreshButton}>🔄</Text>
        </Pressable>
      </View>

      {locationPermission === false ? (
        <View style={styles.centered}>
          <EmptyState
            icon="📍"
            title="Location Permission Required"
            description="We need your location to show nearby markets"
            actionLabel="Grant Permission"
            onAction={requestLocationAndFetch}
          />
        </View>
      ) : isLoading && markets.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Type Filter */}
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              {marketTypes.map((type) => (
                <Pressable
                  key={type.value || 'all'}
                  style={[
                    styles.filterButton,
                    selectedType === type.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedType === type.value && styles.filterTextActive,
                    ]}
                  >
                    {type.label} ({type.count})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.content}>
              {/* Stats */}
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{filteredMarkets.length}</Text>
                  <Text style={styles.statLabel}>Markets Found</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {filteredMarkets.filter((m) => m.isEnamIntegrated).length}
                  </Text>
                  <Text style={styles.statLabel}>e-NAM Integrated</Text>
                </View>
              </View>

              {/* Markets List */}
              {filteredMarkets.length === 0 ? (
                <EmptyState
                  icon="🏪"
                  title="No Markets Found"
                  description={
                    selectedType
                      ? `No ${selectedType} markets nearby`
                      : 'No markets found in your area'
                  }
                />
              ) : (
                filteredMarkets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    onPress={() =>
                      router.push({
                        pathname: '/(farmer)/market/market-details',
                        params: { marketId: market.id },
                      })
                    }
                  />
                ))
              )}
            </View>
          </ScrollView>
        </>
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
    backgroundColor: colors.surface,
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
  refreshButton: {
    fontSize: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});