import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap | string; // Support both Ionicons and emoji strings
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export default function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  // Check if icon is an emoji (string with length > 2) or Ionicon name
  const isEmoji = typeof icon === 'string' && (icon.length > 2 || /\p{Emoji}/u.test(icon));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {isEmoji ? (
          <Text style={styles.emoji}>{icon}</Text>
        ) : (
          <Ionicons 
            name={icon as keyof typeof Ionicons.glyphMap} 
            size={64} 
            color={colors.text.secondary} 
          />
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 300,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});