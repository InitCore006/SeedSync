import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function ProfileSection({ title, subtitle, children }: ProfileSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
});