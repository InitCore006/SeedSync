import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface ProfileMenuItemProps {
  icon: string;
  title: string;
  description?: string;
  badge?: string | number;
  badgeColor?: string;
  showChevron?: boolean;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileMenuItem({
  icon,
  title,
  description,
  badge,
  badgeColor,
  showChevron = true,
  onPress,
  danger = false,
}: ProfileMenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, danger && styles.dangerText]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={styles.right}>
        {badge !== undefined && (
          <View
            style={[
              styles.badge,
              badgeColor && { backgroundColor: badgeColor },
            ]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showChevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dangerText: {
    color: colors.error,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.surface,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 24,
    color: colors.text.secondary,
  },
});