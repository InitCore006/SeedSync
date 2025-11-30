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
import { useSchemes } from '@/hooks/useSchemes';
import SchemeCard from '@/components/schemes/SchemeCard';
import CategoryChip from '@/components/learning/CategoryChip';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { SchemeCategory } from '@/types/scheme.types';

const SCHEME_CATEGORIES: { label: string; value: SchemeCategory; icon: string }[] = [
  { label: 'All', value: 'subsidy', icon: '📋' },
  { label: 'Subsidy', value: 'subsidy', icon: '💰' },
  { label: 'Insurance', value: 'insurance', icon: '🛡️' },
  { label: 'Loan', value: 'loan', icon: '🏦' },
  { label: 'Training', value: 'training', icon: '📚' },
  { label: 'Equipment', value: 'equipment', icon: '🚜' },
];

export default function SchemesScreen() {
  const {
    schemes = [],
    applications = [],
    isLoading = false,
    error = null,
    searchSchemes,
    loadSchemes,
  } = useSchemes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchSchemes) {
      searchSchemes({
        searchQuery: text,
        category: selectedCategory || undefined,
      });
    }
  };

  const handleCategorySelect = (category: SchemeCategory) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    if (searchSchemes) {
      searchSchemes({
        searchQuery,
        category: newCategory || undefined,
      });
    }
  };

  const handleRefresh = async () => {
    if (!loadSchemes) return;
    setRefreshing(true);
    try {
      await loadSchemes();
    } catch (error) {
      console.error('Error refreshing schemes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSchemePress = (schemeId: string) => {
    router.push({
      pathname: '/(farmer)/schemes/scheme-detail',
      params: { id: schemeId },
    });
  };

  const safeApplications = Array.isArray(applications) ? applications : [];
  const pendingApplications = safeApplications.filter(
    (a) => a && (a.status === 'submitted' || a.status === 'under-review')
  );
  const approvedApplications = safeApplications.filter(
    (a) => a && a.status === 'approved'
  );

  const safeSchemes = Array.isArray(schemes) ? schemes : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Government Schemes</Text>
          <Pressable onPress={() => router.push('/(farmer)/schemes/my-applications')}>
            <View style={styles.applicationsButton}>
              <Text style={styles.applicationsIcon}>📄</Text>
              {pendingApplications.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingApplications.length}</Text>
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
            placeholder="Search schemes..."
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
        <Text style={styles.filterTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {SCHEME_CATEGORIES.map((category) => (
            <CategoryChip
              key={category.value}
              label={category.label}
              icon={category.icon}
              isSelected={selectedCategory === category.value}
              onPress={() => handleCategorySelect(category.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Stats Bar */}
      {safeApplications.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{safeApplications.length}</Text>
            <Text style={styles.statLabel}>Total Applications</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{approvedApplications.length}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingApplications.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
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
            <Pressable style={styles.retryButton} onPress={loadSchemes}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !error && safeSchemes.length === 0 && (
          <EmptyState
            icon="📋"
            title="No schemes found"
            description="Try adjusting your search or filters"
          />
        )}

        {!isLoading && !error && safeSchemes.length > 0 && (
          <>
            <Text style={styles.resultCount}>
              {safeSchemes.length} scheme{safeSchemes.length !== 1 ? 's' : ''} available
            </Text>
            {safeSchemes.map((scheme) => {
              if (!scheme || !scheme.id) return null;
              
              return (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onPress={() => handleSchemePress(scheme.id)}
                  hasApplied={safeApplications.some((a) => a && a.schemeId === scheme.id)}
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
  applicationsButton: {
    position: 'relative',
  },
  applicationsIcon: {
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