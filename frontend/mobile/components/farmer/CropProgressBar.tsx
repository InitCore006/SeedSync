import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface CropProgressBarProps {
  current: string;
  percentage: number;
  daysRemaining: number;
  size?: 'small' | 'medium' | 'large';
}

export default function CropProgressBar({ 
  current, 
  percentage, 
  daysRemaining,
  size = 'medium'
}: CropProgressBarProps) {
  const getBarHeight = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 10;
      default: return 6;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, size === 'small' && typography.caption]}>
          {current}
        </Text>
        <Text style={[styles.days, size === 'small' && typography.caption]}>
          {daysRemaining} days left
        </Text>
      </View>
      
      <View style={[styles.progressBar, { height: getBarHeight() }]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${Math.min(percentage, 100)}%`, height: getBarHeight() }
          ]} 
        />
      </View>
      
      <Text style={[styles.percentage, size === 'small' && typography.caption]}>
        {percentage}% Complete
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  days: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressBar: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  percentage: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});