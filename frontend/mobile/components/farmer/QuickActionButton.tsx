import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function QuickActionButton({ 
  icon, 
  label, 
  onPress,
  variant = 'primary'
}: QuickActionButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary': return `${colors.secondary}15`;
      case 'success': return `${colors.success}15`;
      case 'warning': return `${colors.warning}15`;
      default: return `${colors.primary}15`;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'secondary': return colors.secondary;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <Pressable 
      style={styles.container} 
      onPress={onPress}
      android_ripple={{ color: colors.border }}
    >
      <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});