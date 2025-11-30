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
import { useLearning } from '@/hooks/useLearning';
import CourseCard from '@/components/learning/CourseCard';
import CategoryChip from '@/components/learning/CategoryChip';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { ContentType, CourseCategory } from '@/types/learning.types';

const CATEGORIES: { label: string; value: CourseCategory; icon: string }[] = [
  { label: 'All', value: 'crop-management', icon: '🌾' },
  { label: 'Irrigation', value: 'irrigation', icon: '💧' },
  { label: 'Pest Control', value: 'pest-control', icon: '🐛' },
  { label: 'Soil Health', value: 'soil-health', icon: '🌱' },
  { label: 'Organic', value: 'organic-farming', icon: '🌿' },
  { label: 'Modern Tech', value: 'modern-techniques', icon: '🤖' },
  { label: 'Marketing', value: 'marketing', icon: '💰' },
  { label: 'Finance', value: 'finance', icon: '💳' },
];

const CONTENT_TYPES: { label: string; value: ContentType; icon: string }[] = [
  { label: 'All', value: 'video', icon: '📚' },
  { label: 'Videos', value: 'video', icon: '🎥' },
  { label: 'PDFs', value: 'pdf', icon: '📄' },
  { label: 'Audio', value: 'audio', icon: '🎧' },
  { label: 'Articles', value: 'article', icon: '📰' },
  { label: 'Books', value: 'book', icon: '📖' },
];

export default function LearningHubScreen() {
  const {
    courses,
    bookmarkedCourses,
    filters,
    isLoading,
    error,
    searchCourses,
    toggleBookmark,
    loadCourses,
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchCourses({ ...filters, searchQuery: text });
  };

  const handleCategorySelect = (category: CourseCategory) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    searchCourses({
      ...filters,
      category: newCategory || undefined,
      searchQuery,
    });
  };

  const handleContentTypeSelect = (type: ContentType) => {
    const newType = selectedContentType === type ? null : type;
    setSelectedContentType(newType);
    searchCourses({
      ...filters,
      contentType: newType || undefined,
      searchQuery,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCoursePress = (courseId: string) => {
    router.push({
      pathname: '/(farmer)/learning/course-detail',
      params: { id: courseId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Learning Hub</Text>
          <Pressable onPress={() => router.push('/(farmer)/learning/bookmarks')}>
            <Text style={styles.bookmarkButton}>
              🔖 {bookmarkedCourses.length}
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
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
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category.value}
              label={category.label}
              icon={category.icon}
              isSelected={selectedCategory === category.value}
              onPress={() => handleCategorySelect(category.value)}
            />
          ))}
        </ScrollView>

        <Text style={styles.filterTitle}>Content Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CONTENT_TYPES.map((type) => (
            <CategoryChip
              key={type.value}
              label={type.label}
              icon={type.icon}
              isSelected={selectedContentType === type.value}
              onPress={() => handleContentTypeSelect(type.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && <LoadingSpinner />}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <EmptyState
            icon="📚"
            title="No courses found"
            message="Try adjusting your search or filters"
          />
        )}

        {!isLoading && !error && courses.length > 0 && (
          <>
            <Text style={styles.resultCount}>
              {courses.length} course{courses.length !== 1 ? 's' : ''} found
            </Text>
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => handleCoursePress(course.id)}
                onBookmark={() => toggleBookmark(course.id)}
                isBookmarked={bookmarkedCourses.includes(course.id)}
              />
            ))}
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
  bookmarkButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
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
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
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
  },
});