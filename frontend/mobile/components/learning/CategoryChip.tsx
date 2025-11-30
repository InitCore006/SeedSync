import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface CategoryChipProps {
  label: string;
  icon: string;
  isSelected?: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, icon, isSelected, onPress }: CategoryChipProps) {
  return (
    <Pressable
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.surface,
  },
});