import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function MarketNewsScreen() {
  const { marketNews, isLoading, fetchMarketNews } = useMarket();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketNews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarketNews();
    setRefreshing(false);
  };

  const categories = [
    { label: 'All', value: null, icon: '📰' },
    { label: 'Prices', value: 'prices', icon: '💰' },
    { label: 'Weather', value: 'weather', icon: '🌤️' },
    { label: 'Policy', value: 'policy', icon: '📋' },
    { label: 'Technology', value: 'technology', icon: '💻' },
  ];

  const filteredNews = selectedCategory
    ? marketNews.filter((news) => news.category === selectedCategory)
    : marketNews;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleOpenNews = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Market News</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading && marketNews.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
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

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.content}>
              {filteredNews.length === 0 ? (
                <EmptyState
                  icon="📰"
                  title="No News Available"
                  description="No news articles available for selected category"
                />
              ) : (
                filteredNews.map((news) => (
                  <Pressable
                    key={news.id}
                    style={styles.newsCard}
                    onPress={() => handleOpenNews(news.url)}
                  >
                    {news.imageUrl && (
                      <Image
                        source={{ uri: news.imageUrl }}
                        style={styles.newsImage}
                        resizeMode="cover"
                      />
                    )}

                    <View style={styles.newsContent}>
                      <View style={styles.newsHeader}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: `${colors.primary}20` },
                          ]}
                        >
                          <Text style={styles.categoryBadgeText}>
                            {news.category.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.newsTime}>{formatTimeAgo(news.publishedAt)}</Text>
                      </View>

                      <Text style={styles.newsTitle}>{news.title}</Text>
                      <Text style={styles.newsDescription} numberOfLines={3}>
                        {news.description}
                      </Text>

                      <View style={styles.newsFooter}>
                        <Text style={styles.newsSource}>📰 {news.source}</Text>
                        <Text style={styles.readMore}>Read more →</Text>
                      </View>
                    </View>
                  </Pressable>
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
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    ...typography.caption,
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
  newsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  newsContent: {
    padding: spacing.md,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  newsTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  newsTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  newsDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  newsSource: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  readMore: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});