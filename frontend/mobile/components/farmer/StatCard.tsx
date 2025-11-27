import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  } | null;
}

export default function StatCard({ title, value, unit, icon, trend }: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}> {unit}</Text>}
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trend, { color: trend.isPositive ? colors.success : colors.error }]}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  unit: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  trendContainer: {
    marginTop: spacing.xs,
  },
  trend: {
    ...typography.caption,
    fontWeight: '600',
  },
});