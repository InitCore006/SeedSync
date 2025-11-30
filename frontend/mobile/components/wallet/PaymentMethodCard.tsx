import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PaymentMethod } from '@/types/wallet.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onPress?: () => void;
  showRadio?: boolean;
  isSelected?: boolean;
}

export default function PaymentMethodCard({
  method,
  onPress,
  showRadio,
  isSelected,
}: PaymentMethodCardProps) {
  const getTypeIcon = () => {
    switch (method.type) {
      case 'upi':
        return '📱';
      case 'bank':
        return '🏦';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Radio Button */}
      {showRadio && (
        <View style={styles.radioContainer}>
          <View style={[styles.radio, isSelected && styles.radioSelected]}>
            {isSelected && <View style={styles.radioDot} />}
          </View>
        </View>
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getTypeIcon()}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{method.name}</Text>
        <Text style={styles.identifier}>{method.identifier}</Text>
      </View>

      {/* Default Badge */}
      {method.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  pressed: {
    opacity: 0.7,
  },
  radioContainer: {
    marginRight: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
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
  name: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  identifier: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  defaultBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 10,
  },
});