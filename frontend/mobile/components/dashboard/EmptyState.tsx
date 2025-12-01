import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  onActionPress: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onActionPress}
      >
        <Ionicons name="add-circle" size={20} color={colors.white} />
        <Text style={styles.actionButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});