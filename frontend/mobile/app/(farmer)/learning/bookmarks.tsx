import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useLearning } from '@/hooks/useLearning';
import CourseCard from '@/components/learning/CourseCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Course } from '@/types/learning.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function BookmarksScreen() {
  const {
    bookmarkedCourses,
    isLoading,
    toggleBookmark,
    getBookmarkedCourses,
  } = useLearning();

  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, [bookmarkedCourses]);

  const loadBookmarks = async () => {
    const data = await getBookmarkedCourses();
    setCourses(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
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
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Bookmarked Courses</Text>
        <View style={{ width: 60 }} />
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

        {!isLoading && courses.length === 0 && (
          <EmptyState
            icon="🔖"
            title="No bookmarks yet"
            message="Bookmark courses to access them quickly later"
          />
        )}

        {!isLoading && courses.length > 0 && (
          <>
            <Text style={styles.count}>
              {courses.length} bookmarked course{courses.length !== 1 ? 's' : ''}
            </Text>
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => handleCoursePress(course.id)}
                onBookmark={() => toggleBookmark(course.id)}
                isBookmarked={true}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  count: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
});