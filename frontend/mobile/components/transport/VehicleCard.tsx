import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Vehicle } from '@/types/transport.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  isSelected?: boolean;
}

export default function VehicleCard({ vehicle, onPress, isSelected }: VehicleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Icon */}
      <Text style={styles.icon}>{vehicle.icon}</Text>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.type}>
          {vehicle.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Text>
        <Text style={styles.capacity}>Capacity: {vehicle.capacity}</Text>
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{vehicle.pricePerKm}</Text>
        <Text style={styles.priceUnit}>/km</Text>
      </View>

      {/* Selected Indicator */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </Pressable>
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
  icon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  type: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  capacity: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  price: {
    ...typography.h4,
    color: colors.primary,
  },
  priceUnit: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});