import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransport } from '@/hooks/useTransport';
import { TransportBooking } from '@/types/transport.types';
import TrackingTimeline from '@/components/transport/TrackingTimeline';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, cancelBooking } = useTransport();
  const [booking, setBooking] = useState<TransportBooking | null>(null);

  useEffect(() => {
    const found = bookings.find((b) => b.id === id);
    setBooking(found || null);
  }, [id, bookings]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(id);
              Alert.alert('Booking Cancelled', 'Your booking has been cancelled', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleCallDriver = () => {
    if (booking?.driverPhone) {
      Linking.openURL(`tel:${booking.driverPhone}`);
    }
  };

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

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

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canCallDriver = booking.status === 'confirmed' || booking.status === 'in-transit';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Booking Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor()}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {booking.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>
        </View>

        {/* Route Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.routeCard}>
            <View style={styles.routePoint}>
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

            <View style={styles.routePoint}>
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
        </View>

        {/* Cargo Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📦 Cargo</Text>
              <Text style={styles.detailValue}>{booking.cargo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>⚖️ Weight</Text>
              <Text style={styles.detailValue}>{booking.weight}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🚛 Vehicle</Text>
              <Text style={styles.detailValue}>
                {booking.vehicleType.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📏 Distance</Text>
              <Text style={styles.detailValue}>{booking.distance} km</Text>
            </View>
          </View>
        </View>

        {/* Driver Details */}
        {booking.driverName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Details</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverIcon}>👤</Text>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{booking.driverName}</Text>
                  {booking.driverPhone && (
                    <Text style={styles.driverPhone}>{booking.driverPhone}</Text>
                  )}
                  {booking.vehicleNumber && (
                    <Text style={styles.vehicleNumber}>
                      Vehicle: {booking.vehicleNumber}
                    </Text>
                  )}
                </View>
              </View>
              {canCallDriver && (
                <Pressable
                  style={({ pressed }) => [
                    styles.callButton,
                    pressed && styles.callButtonPressed,
                  ]}
                  onPress={handleCallDriver}
                >
                  <Text style={styles.callButtonText}>📞 Call</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Tracking */}
        {booking.trackingUpdates && booking.trackingUpdates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Updates</Text>
            <TrackingTimeline updates={booking.trackingUpdates} />
          </View>
        )}

        {/* Cost Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Details</Text>
          <View style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Base Fare</Text>
              <Text style={styles.costValue}>
                ₹{(booking.estimatedCost * 0.8).toFixed(2)}
              </Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Distance Charges</Text>
              <Text style={styles.costValue}>
                ₹{(booking.estimatedCost * 0.15).toFixed(2)}
              </Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Service Tax</Text>
              <Text style={styles.costValue}>
                ₹{(booking.estimatedCost * 0.05).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.costRow, styles.totalCostRow]}>
              <Text style={styles.totalCostLabel}>Total Cost</Text>
              <Text style={styles.totalCostValue}>
                ₹{booking.estimatedCost.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      {canCancel && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.body,
    fontWeight: '700',
  },
  bookingId: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routePoint: {
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
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  driverCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  driverIcon: {
    fontSize: 40,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  driverPhone: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  vehicleNumber: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  callButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonPressed: {
    opacity: 0.7,
  },
  callButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
  costCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  costLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  costValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalCostLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  totalCostValue: {
    ...typography.h4,
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
});