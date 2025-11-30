import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { learningService } from '@/services/learning.service';
import { Course } from '@/types/learning.types';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const data = await learningService.getCourseById(id);
      setCourse(data);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCourse = () => {
    if (course?.externalUrl) {
      Linking.openURL(course.externalUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorText}>Course not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.headerBackButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Course Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Thumbnail */}
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>
              {course.contentType === 'video' ? '🎥' :
               course.contentType === 'pdf' ? '📄' :
               course.contentType === 'audio' ? '🎧' :
               course.contentType === 'article' ? '📰' : '📚'}
            </Text>
          </View>
        )}

        {/* Title & Meta */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{course.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>
                {course.contentType.toUpperCase()}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{course.language}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
          </View>
        </View>

        {/* Provider */}
        <View style={styles.providerContainer}>
          <Text style={styles.providerIcon}>🏛️</Text>
          <Text style={styles.providerText}>Provided by {course.provider}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topics Covered</Text>
          <View style={styles.tagsContainer}>
            {course.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {course.category.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Published Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Published</Text>
          <Text style={styles.dateText}>
            {new Date(course.publishedDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.openButton,
            pressed && styles.openButtonPressed,
          ]}
          onPress={handleOpenCourse}
        >
          <Text style={styles.openButtonText}>
            Open Course {course.contentType === 'video' ? '🎥' : '📖'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
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
  headerBackButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  thumbnail: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 80,
  },
  titleContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: `${colors.primary}10`,
    gap: spacing.xs,
  },
  providerIcon: {
    fontSize: 20,
  },
  providerText: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    ...typography.caption,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  dateText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  openButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  openButtonPressed: {
    opacity: 0.7,
  },
  openButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});