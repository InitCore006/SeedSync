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
import PriceCard from '@/components/market/PriceCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MarketScreen() {
  const { prices, crops, isLoading, fetchPrices, fetchCrops, getTrendingCrops } = useMarket();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCrops();
    fetchPrices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCrops(), fetchPrices()]);
    setRefreshing(false);
  };

  const categories = [
    { label: 'All', value: null, icon: '📊' },
    { label: 'Cereals', value: 'cereals', icon: '🌾' },
    { label: 'Pulses', value: 'pulses', icon: '🫘' },
    { label: 'Oilseeds', value: 'oilseeds', icon: '🌻' },
    { label: 'Vegetables', value: 'vegetables', icon: '🥬' },
    { label: 'Fruits', value: 'fruits', icon: '🍎' },
  ];

  const filteredPrices = prices.filter((price) => {
    const matchesSearch = price.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedCategory) return matchesSearch;
    
    const crop = crops.find((c) => c.id === price.cropId);
    const matchesCategory = crop?.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const trendingCrops = getTrendingCrops();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Market Prices</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(farmer)/market/alerts')}
            >
              <Text style={styles.iconButtonText}>🔔</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(farmer)/market/nearby')}
            >
              <Text style={styles.iconButtonText}>📍</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
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

        {/* Category Filter */}
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
              ]}
              onPress={() => setSelectedCategory(category.value)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.value && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading && prices.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(farmer)/market/trade')}
              >
                <Text style={styles.actionIcon}>💰</Text>
                <Text style={styles.actionLabel}>Trade</Text>
              </Pressable>

              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(farmer)/market/msp')}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionLabel}>MSP</Text>
              </Pressable>

              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(farmer)/market/schemes')}
              >
                <Text style={styles.actionIcon}>🏛️</Text>
                <Text style={styles.actionLabel}>Schemes</Text>
              </Pressable>

              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/(farmer)/market/news')}
              >
                <Text style={styles.actionIcon}>📰</Text>
                <Text style={styles.actionLabel}>News</Text>
              </Pressable>
            </View>

            {/* Trending Crops */}
            {trendingCrops.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>📈 Trending Now</Text>
                  <Text style={styles.sectionSubtitle}>Top price gainers</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.trendingContainer}>
                    {trendingCrops.map((price) => (
                      <Pressable
                        key={price.id}
                        style={styles.trendingCard}
                        onPress={() =>
                          router.push({
                            pathname: '/(farmer)/market/details',
                            params: { cropId: price.cropId },
                          })
                        }
                      >
                        <Text style={styles.trendingCrop}>{price.cropName}</Text>
                        <Text style={styles.trendingPrice}>₹{price.price}</Text>
                        <View style={styles.trendingChange}>
                          <Text style={styles.trendingIcon}>📈</Text>
                          <Text style={styles.trendingPercent}>
                            +{price.priceChangePercent.toFixed(2)}%
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Market Prices */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Latest Prices</Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredPrices.length} {filteredPrices.length === 1 ? 'crop' : 'crops'}
                </Text>
              </View>

              {filteredPrices.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No Prices Found"
                  description={
                    searchQuery
                      ? `No results for "${searchQuery}"`
                      : 'No prices available for this category'
                  }
                />
              ) : (
                filteredPrices.map((price) => (
                  <PriceCard
                    key={price.id}
                    price={price}
                    onPress={() =>
                      router.push({
                        pathname: '/(farmer)/market/details',
                        params: { cropId: price.cropId },
                      })
                    }
                  />
                ))
              )}
            </View>
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  categoryContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  trendingContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trendingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    width: 140,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  trendingCrop: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  trendingPrice: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  trendingChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingIcon: {
    fontSize: 14,
  },
  trendingPercent: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
});