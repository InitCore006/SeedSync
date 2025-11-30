import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useFPO } from '@/hooks/useFPO';
import FPOCard from '@/components/fpo/FPOCard';
import CategoryChip from '@/components/learning/CategoryChip';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { FPOType } from '@/types/fpo.types';

const FPO_TYPES: { label: string; value: FPOType | 'all'; icon: string }[] = [
  { label: 'All', value: 'all', icon: '🏛️' },
  { label: 'Producer Co.', value: 'producer-company', icon: '🏢' },
  { label: 'Cooperative', value: 'cooperative', icon: '🤝' },
  { label: 'SHG', value: 'self-help-group', icon: '👥' },
];

export default function FPOScreen() {
  const {
    fpos = [],
    memberships = [],
    isLoading = false,
    error = null,
    searchFPOs,
    loadFPOs,
  } = useFPO();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FPOType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchFPOs) {
      searchFPOs({
        searchQuery: text,
        type: selectedType !== 'all' ? (selectedType as FPOType) : undefined,
      });
    }
  };

  const handleTypeSelect = (type: FPOType | 'all') => {
    setSelectedType(type);
    if (searchFPOs) {
      searchFPOs({
        searchQuery,
        type: type !== 'all' ? (type as FPOType) : undefined,
      });
    }
  };

  const handleRefresh = async () => {
    if (!loadFPOs) return;
    setRefreshing(true);
    try {
      await loadFPOs();
    } catch (error) {
      console.error('Error refreshing FPOs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFPOPress = (fpoId: string) => {
    router.push({
      pathname: '/(farmer)/fpo/fpo-detail',
      params: { id: fpoId },
    });
  };

  const safeMemberships = Array.isArray(memberships) ? memberships : [];
  const safeFPOs = Array.isArray(fpos) ? fpos : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>FPO Network</Text>
          <Pressable onPress={() => router.push('/(farmer)/fpo/my-fpos')}>
            <View style={styles.myFPOsButton}>
              <Text style={styles.myFPOsIcon}>📋</Text>
              {safeMemberships.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{safeMemberships.length}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search FPOs..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Organization Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FPO_TYPES.map((type) => (
            <CategoryChip
              key={type.value}
              label={type.label}
              icon={type.icon}
              isSelected={selectedType === type.value}
              onPress={() => handleTypeSelect(type.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Stats Bar */}
      {safeMemberships.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{safeMemberships.length}</Text>
            <Text style={styles.statLabel}>Your Memberships</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{safeFPOs.length}</Text>
            <Text style={styles.statLabel}>Total FPOs</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable
            style={styles.statItem}
            onPress={() => router.push('/(farmer)/fpo/events')}
          >
            <Text style={styles.statValue}>📅</Text>
            <Text style={styles.statLabel}>Events</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading && !refreshing && <LoadingSpinner />}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadFPOs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !error && safeFPOs.length === 0 && (
          <EmptyState
            icon="🏛️"
            title="No FPOs found"
            description="Try adjusting your search or filters"
          />
        )}

        {!isLoading && !error && safeFPOs.length > 0 && (
          <>
            <Text style={styles.resultCount}>
              {safeFPOs.length} FPO{safeFPOs.length !== 1 ? 's' : ''} found
            </Text>
            {safeFPOs.map((fpo) => {
              if (!fpo || !fpo.id) return null;
              
              return (
                <FPOCard
                  key={fpo.id}
                  fpo={fpo}
                  onPress={() => handleFPOPress(fpo.id)}
                  isMember={safeMemberships.some((m) => m && m.fpoId === fpo.id)}
                />
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  myFPOsButton: {
    position: 'relative',
  },
  myFPOsIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  clearIcon: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 18,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  resultCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  errorContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});