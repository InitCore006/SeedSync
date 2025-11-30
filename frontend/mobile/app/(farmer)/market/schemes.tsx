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
import GovernmentSchemeCard from '@/components/market/GovernmentSchemeCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function GovernmentSchemesScreen() {
  const { governmentSchemes, isLoading, fetchGovernmentSchemes } = useMarket();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchGovernmentSchemes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGovernmentSchemes();
    setRefreshing(false);
  };

  const categories = [
    { label: 'All', value: null, icon: '📋', color: '#607D8B' },
    { label: 'Subsidy', value: 'subsidy', icon: '💰', color: '#4CAF50' },
    { label: 'Loan', value: 'loan', icon: '🏦', color: '#2196F3' },
    { label: 'Insurance', value: 'insurance', icon: '🛡️', color: '#FF9800' },
    { label: 'Training', value: 'training', icon: '📚', color: '#9C27B0' },
    { label: 'Equipment', value: 'equipment', icon: '🚜', color: '#F44336' },
  ];

  const filteredSchemes = governmentSchemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeSchemes = governmentSchemes.filter((s) => s.isActive);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Government Schemes</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading && governmentSchemes.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoIcon}>🏛️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Schemes for Farmers</Text>
              <Text style={styles.infoText}>
                Explore various government schemes, subsidies, loans, and benefits available for
                farmers
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{governmentSchemes.length}</Text>
              <Text style={styles.statLabel}>Total Schemes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{activeSchemes.length}</Text>
              <Text style={styles.statLabel}>Currently Active</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search schemes..."
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
          </View>

          {/* Category Filter */}
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <Pressable
                  key={category.value || 'all'}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.value && styles.categoryButtonActive,
                    selectedCategory === category.value && {
                      backgroundColor: `${category.color}20`,
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.value && {
                        color: category.color,
                      },
                    ]}
                  >
                    {category.label}
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
              {filteredSchemes.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No Schemes Found"
                  description={
                    searchQuery
                      ? `No results for "${searchQuery}"`
                      : 'No schemes available for selected category'
                  }
                />
              ) : (
                filteredSchemes.map((scheme) => (
                  <GovernmentSchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onPress={() =>
                      router.push({
                        pathname: '/(farmer)/market/scheme-details',
                        params: { schemeId: scheme.id },
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}15`,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
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
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
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
  categorySection: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});