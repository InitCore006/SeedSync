import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLots } from '@/hooks/farmer/useLots';
import { LotCard } from '@/components/farmer/LotCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';
import { LotStatus } from '@/types/farmer.types';

const TABS: { label: string; value: LotStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Sold', value: 'SOLD' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Expired', value: 'EXPIRED' },
];

export default function MyLotsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<LotStatus | 'ALL'>('ALL');

  const {
    lots,
    activeLots,
    soldLots,
    draftLots,
    expiredLots,
    lotsLoading,
    refreshing,
    refresh,
  } = useLots();

  const getFilteredLots = () => {
    switch (selectedTab) {
      case 'ACTIVE':
        return activeLots;
      case 'SOLD':
        return soldLots;
      case 'DRAFT':
        return draftLots;
      case 'EXPIRED':
        return expiredLots;
      default:
        return lots;
    }
  };

  const filteredLots = getFilteredLots();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lots</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(farmer)/create-lot')}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === item.value && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(item.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === item.value && styles.tabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Lots List */}
      {lotsLoading && !lots.length ? (
        <LoadingSpinner fullScreen message="Loading lots..." />
      ) : (
        <FlatList
          data={filteredLots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LotCard
              lot={item}
              onPress={() => router.push(`/(farmer)/lots/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title={`No ${selectedTab === 'ALL' ? '' : selectedTab.toLowerCase()} lots`}
              description="Create your first lot to start selling your produce."
              actionLabel="Create Lot"
              onAction={() => router.push('/(farmer)/create-lot')}
            />
          }
        />
      )}
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

  createButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },

  createButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.inverse,
  },

  tabsContainer: {
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  tabsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: colors.primary[500],
  },

  tabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },

  tabTextActive: {
    color: colors.text.inverse,
  },

  listContent: {
    padding: spacing.lg,
  },
});