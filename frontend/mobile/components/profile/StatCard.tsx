import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}

export default function StatCard({
  icon,
  label,
  value,
  subtitle,
  color = colors.primary,
  onPress,
}: StatCardProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {onPress && <Text style={styles.chevron}>›</Text>}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});