/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TransportBooking } from '@/types/transport.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface BookingCardProps {
  booking: TransportBooking;
  onPress: () => void;
}

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return colors.accent;
      case 'in-transit':
        return colors.primary;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusText = () => {
    return booking.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleIcon}>
            {booking.vehicleType === 'truck' ? '🚛' : 
             booking.vehicleType === 'mini-truck' ? '🚚' : 
             booking.vehicleType === 'tractor-trolley' ? '🚜' : '🛻'}
          </Text>
          <Text style={styles.vehicleType}>
            {booking.vehicleType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeLocation}>{booking.pickupLocation}</Text>
            <Text style={styles.routeTime}>
              {new Date(booking.scheduledPickup).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>Delivery</Text>
            <Text style={styles.routeLocation}>{booking.deliveryLocation}</Text>
            <Text style={styles.routeTime}>
              {new Date(booking.estimatedDelivery).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📦</Text>
          <Text style={styles.detailText}>{booking.cargo}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>⚖️</Text>
          <Text style={styles.detailText}>{booking.weight}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📏</Text>
          <Text style={styles.detailText}>{booking.distance} km</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Total Cost</Text>
          <Text style={styles.costValue}>₹{booking.estimatedCost.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleIcon: {
    fontSize: 24,
  },
  vehicleType: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  route: {
    marginBottom: spacing.md,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing.sm,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  routeLocation: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeTime: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: spacing.xs,
  },
  details: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  costLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  costValue: {
    ...typography.h4,
    color: colors.primary,
  },
  viewDetails: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});