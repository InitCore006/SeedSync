import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import TradeDemandCard from '@/components/market/TradeDemandCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function TradeScreen() {
  const { tradeDemands, isLoading, fetchTradeDemands } = useMarket();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    fetchTradeDemands();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTradeDemands();
    setRefreshing(false);
  };

  const filteredDemands = tradeDemands.filter((demand) => {
    const matchesSearch = demand.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || demand.type === selectedType;
    return matchesSearch && matchesType;
  });

  const buyDemands = tradeDemands.filter((d) => d.type === 'buy' && d.status === 'active');
  const sellDemands = tradeDemands.filter((d) => d.type === 'sell' && d.status === 'active');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Trade & Demand</Text>
        <Pressable onPress={() => router.push('/(farmer)/market/trade/my-listings')}>
          <Text style={styles.myListingsButton}>📋</Text>
        </Pressable>
      </View>

      {isLoading && tradeDemands.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stats & Actions */}
          <View style={styles.topSection}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{buyDemands.length}</Text>
                <Text style={styles.statLabel}>Buy Requests</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{sellDemands.length}</Text>
                <Text style={styles.statLabel}>Sell Offers</Text>
              </View>
            </View>

            {/* Create Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionButton, styles.buyButton]}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/market/trade/create',
                    params: { type: 'buy' },
                  })
                }
              >
                <Text style={styles.actionButtonText}>🛒 Post Buy Request</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.sellButton]}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/market/trade/create',
                    params: { type: 'sell' },
                  })
                }
              >
                <Text style={styles.actionButtonText}>📦 Post Sell Offer</Text>
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search crops..."
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Type Filter */}
            <View style={styles.typeFilter}>
              <Pressable
                style={[styles.typeButton, selectedType === 'all' && styles.typeButtonActive]}
                onPress={() => setSelectedType('all')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'all' && styles.typeButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </Pressable>
              <Pressable
                style={[styles.typeButton, selectedType === 'buy' && styles.typeButtonActive]}
                onPress={() => setSelectedType('buy')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'buy' && styles.typeButtonTextActive,
                  ]}
                >
                  🛒 Buying
                </Text>
              </Pressable>
              <Pressable
                style={[styles.typeButton, selectedType === 'sell' && styles.typeButtonActive]}
                onPress={() => setSelectedType('sell')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === 'sell' && styles.typeButtonTextActive,
                  ]}
                >
                  📦 Selling
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.content}>
              {filteredDemands.length === 0 ? (
                <EmptyState
                  icon="💰"
                  title="No Listings Found"
                  description={
                    searchQuery
                      ? `No results for "${searchQuery}"`
                      : 'No trade listings available'
                  }
                  actionLabel="Create Listing"
                  onAction={() =>
                    router.push({
                      pathname: '/(farmer)/market/trade/create',
                      params: { type: 'sell' },
                    })
                  }
                />
              ) : (
                filteredDemands.map((demand) => (
                  <TradeDemandCard
                    key={demand.id}
                    demand={demand}
                    showContact={true}
                    onPress={() =>
                      router.push({
                        pathname: '/(farmer)/market/trade/details',
                        params: { listingId: demand.id },
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
  myListingsButton: {
    fontSize: 24,
  },
  topSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
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
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: colors.primary,
  },
  sellButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
  searchSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    height: '100%',
  },
  clearIcon: {
    ...typography.body,
    color: colors.text.secondary,
    padding: spacing.xs,
  },
  typeFilter: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});