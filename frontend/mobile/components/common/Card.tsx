import { colors } from '@/lib/constants/colors';
import { borderRadius, spacing } from '@/lib/constants/spacing';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';


interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
}

export default function Card({ children, onPress, style, elevated = true }: CardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, elevated && styles.elevated, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  elevated: {
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});