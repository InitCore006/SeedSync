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
import { useMarket } from '@/hooks/useMarket';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MyListingsScreen() {
  const { tradeListings, isLoading, fetchTradeListings } = useMarket();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'expired'>(
    'all'
  );

  useEffect(() => {
    fetchTradeListings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTradeListings();
    setRefreshing(false);
  };

  const myListings = tradeListings.filter((listing) => listing.userId === user?.id);

  const filteredListings = myListings.filter((listing) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'expired') {
      return new Date(listing.expiresAt) < new Date();
    }
    return listing.status === selectedFilter;
  });

  const activeCount = myListings.filter((l) => l.status === 'active').length;
  const completedCount = myListings.filter((l) => l.status === 'completed').length;
  const expiredCount = myListings.filter(
    (l) => new Date(l.expiresAt) < new Date() && l.status === 'active'
  ).length;

  const filters = [
    { label: 'All', value: 'all', count: myListings.length },
    { label: 'Active', value: 'active', count: activeCount },
    { label: 'Completed', value: 'completed', count: completedCount },
    { label: 'Expired', value: 'expired', count: expiredCount },
  ];

  const handleDeleteListing = (listingId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete listing logic
            Alert.alert('Success', 'Listing deleted successfully');
            fetchTradeListings();
          },
        },
      ]
    );
  };

  const handleMarkAsCompleted = (listingId: string) => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure you want to mark this listing as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: () => {
            // Update listing status
            Alert.alert('Success', 'Listing marked as completed');
            fetchTradeListings();
          },
        },
      ]
    );
  };

  const handleRenewListing = (listingId: string) => {
    Alert.alert(
      'Renew Listing',
      'Would you like to extend this listing for another 30 days?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Renew',
          onPress: () => {
            // Renew listing logic
            Alert.alert('Success', 'Listing renewed for 30 more days');
            fetchTradeListings();
          },
        },
      ]
    );
  };

  const getDaysRemaining = (expiresAt: string) => {
    const days = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>My Listings</Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(farmer)/market/trade/create',
              params: { type: 'sell' },
            })
          }
        >
          <Text style={styles.addButton}>+ Add</Text>
        </Pressable>
      </View>

      {isLoading && myListings.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stats Cards */}
          {myListings.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{myListings.length}</Text>
                <Text style={styles.statLabel}>Total Listings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {activeCount}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {completedCount}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          )}

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {filters.map((filter) => (
                <Pressable
                  key={filter.value}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.value as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === filter.value && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  <View
                    style={[
                      styles.filterBadge,
                      selectedFilter === filter.value && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        selectedFilter === filter.value && styles.filterBadgeTextActive,
                      ]}
                    >
                      {filter.count}
                    </Text>
                  </View>
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
              {filteredListings.length === 0 ? (
                <EmptyState
                  icon={selectedFilter === 'all' ? '📦' : '🔍'}
                  title={
                    selectedFilter === 'all'
                      ? 'No Listings Yet'
                      : `No ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Listings`
                  }
                  description={
                    selectedFilter === 'all'
                      ? 'Start by creating your first trade listing'
                      : `You don't have any ${selectedFilter} listings`
                  }
                  actionLabel={selectedFilter === 'all' ? 'Create Listing' : undefined}
                  onAction={
                    selectedFilter === 'all'
                      ? () =>
                          router.push({
                            pathname: '/(farmer)/market/trade/create',
                            params: { type: 'sell' },
                          })
                      : undefined
                  }
                />
              ) : (
                filteredListings.map((listing) => {
                  const daysRemaining = getDaysRemaining(listing.expiresAt);
                  const isExpired = daysRemaining < 0;
                  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

                  return (
                    <Pressable
                      key={listing.id}
                      style={styles.listingCard}
                      onPress={() =>
                        router.push({
                          pathname: '/(farmer)/market/trade/details',
                          params: { listingId: listing.id },
                        })
                      }
                    >
                      <View style={styles.listingHeader}>
                        <View
                          style={[
                            styles.listingTypeBadge,
                            listing.type === 'buy'
                              ? styles.buyTypeBadge
                              : styles.sellTypeBadge,
                          ]}
                        >
                          <Text style={styles.listingTypeText}>
                            {listing.type === 'buy' ? '🛒 BUY' : '📦 SELL'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.listingStatus,
                            listing.status === 'active' && styles.statusActiveChip,
                            listing.status === 'completed' && styles.statusCompletedChip,
                            isExpired && styles.statusExpiredChip,
                          ]}
                        >
                          <Text style={styles.listingStatusText}>
                            {isExpired
                              ? 'Expired'
                              : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.listingCropName}>{listing.cropName}</Text>
                      {listing.variety && (
                        <Text style={styles.listingVariety}>{listing.variety}</Text>
                      )}

                      <View style={styles.listingDetails}>
                        <View style={styles.listingDetailItem}>
                          <Text style={styles.listingDetailLabel}>Quantity</Text>
                          <Text style={styles.listingDetailValue}>
                            {listing.quantity} {listing.unit}
                          </Text>
                        </View>
                        <View style={styles.listingDetailDivider} />
                        <View style={styles.listingDetailItem}>
                          <Text style={styles.listingDetailLabel}>Price</Text>
                          <Text style={styles.listingDetailValue}>
                            ₹{listing.pricePerUnit}/{listing.unit}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.listingFooter}>
                        <View style={styles.listingLocation}>
                          <Text style={styles.listingLocationText}>
                            📍 {listing.location}, {listing.district}
                          </Text>
                        </View>
                      </View>

                      {isExpiringSoon && !isExpired && listing.status === 'active' && (
                        <View style={styles.expiryWarning}>
                          <Text style={styles.expiryWarningText}>
                            ⏰ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}

                      {isExpired && (
                        <View style={styles.expiredBanner}>
                          <Text style={styles.expiredBannerText}>This listing has expired</Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.listingActions}>
                        {listing.status === 'active' && !isExpired && (
                          <>
                            <Pressable
                              style={styles.actionButton}
                              onPress={() =>
                                router.push({
                                  pathname: '/(farmer)/market/trade/create',
                                  params: { editId: listing.id },
                                })
                              }
                            >
                              <Text style={styles.actionButtonText}>✏️ Edit</Text>
                            </Pressable>

                            <Pressable
                              style={[styles.actionButton, styles.completeButton]}
                              onPress={() => handleMarkAsCompleted(listing.id)}
                            >
                              <Text style={[styles.actionButtonText, styles.completeButtonText]}>
                                ✓ Complete
                              </Text>
                            </Pressable>
                          </>
                        )}

                        {isExpired && (
                          <Pressable
                            style={[styles.actionButton, styles.renewButton]}
                            onPress={() => handleRenewListing(listing.id)}
                          >
                            <Text style={[styles.actionButtonText, styles.renewButtonText]}>
                              🔄 Renew
                            </Text>
                          </Pressable>
                        )}

                        <Pressable
                          style={[styles.actionButton, styles.deleteActionButton]}
                          onPress={() => handleDeleteListing(listing.id)}
                        >
                          <Text
                            style={[styles.actionButtonText, styles.deleteActionButtonText]}
                          >
                            🗑️ Delete
                          </Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          </ScrollView>

          {/* Floating Action Button */}
          {myListings.length > 0 && (
            <Pressable
              style={styles.fab}
              onPress={() =>
                router.push({
                  pathname: '/(farmer)/market/trade/create',
                  params: { type: 'sell' },
                })
              }
            >
              <Text style={styles.fabIcon}>+</Text>
            </Pressable>
          )}
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
  addButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.surface,
  },
  filterBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.surface,
  },
  filterBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  filterBadgeTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  listingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listingTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buyTypeBadge: {
    backgroundColor: `${colors.accent}20`,
  },
  sellTypeBadge: {
    backgroundColor: `${colors.success}20`,
  },
  listingTypeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  listingStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActiveChip: {
    backgroundColor: `${colors.success}20`,
  },
  statusCompletedChip: {
    backgroundColor: `${colors.accent}20`,
  },
  statusExpiredChip: {
    backgroundColor: `${colors.error}20`,
  },
  listingStatusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  listingCropName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 2,
  },
  listingVariety: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  listingDetails: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  listingDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  listingDetailDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  listingDetailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  listingDetailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listingFooter: {
    marginBottom: spacing.sm,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingLocationText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  expiryWarning: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: 8,
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  expiryWarningText: {
    ...typography.caption,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  expiredBanner: {
    backgroundColor: `${colors.error}15`,
    borderRadius: 8,
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  expiredBannerText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  listingActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  completeButton: {
    borderColor: colors.success,
  },
  completeButtonText: {
    color: colors.success,
  },
  renewButton: {
    borderColor: colors.accent,
  },
  renewButtonText: {
    color: colors.accent,
  },
  deleteActionButton: {
    borderColor: colors.error,
  },
  deleteActionButtonText: {
    color: colors.error,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.surface,
    fontWeight: '300',
  },
});