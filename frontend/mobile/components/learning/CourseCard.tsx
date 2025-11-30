import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Course } from '@/types/learning.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export default function CourseCard({ course, onPress, onBookmark, isBookmarked }: CourseCardProps) {
  const getContentTypeIcon = () => {
    switch (course.contentType) {
      case 'video':
        return '🎥';
      case 'pdf':
        return '📄';
      case 'audio':
        return '🎧';
      case 'article':
        return '📰';
      case 'book':
        return '📚';
      default:
        return '📖';
    }
  };

  const getCategoryColor = () => {
    const colors_map: Record<string, string> = {
      'crop-management': colors.primary,
      'pest-control': colors.error,
      'irrigation': colors.accent,
      'soil-health': '#8B4513',
      'organic-farming': colors.success,
      'modern-techniques': colors.warning,
      'marketing': '#FF6B6B',
      'finance': '#4ECDC4',
    };
    return colors_map[course.category] || colors.primary;
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>{getContentTypeIcon()}</Text>
          </View>
        )}
        
        {/* Content Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{getContentTypeIcon()}</Text>
          <Text style={styles.typeText}>{course.contentType.toUpperCase()}</Text>
        </View>

        {/* Bookmark Button */}
        {onBookmark && (
          <Pressable style={styles.bookmarkButton} onPress={onBookmark}>
            <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⏱️</Text>
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🌐</Text>
            <Text style={styles.metaText}>{course.language}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor()}20` }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
              {course.category.replace('-', ' ').toUpperCase()}
            </Text>
          </View>

          <Text style={styles.provider}>{course.provider}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 64,
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeIcon: {
    fontSize: 12,
  },
  typeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.surface,
    fontWeight: '700',
  },
  bookmarkButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  provider: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});