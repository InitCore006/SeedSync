import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTransport } from '@/hooks/useTransport';
import VehicleCard from '@/components/transport/VehicleCard';
import BookingCard from '@/components/transport/BookingCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function TransportScreen() {
  const { vehicles, bookings, isLoading, loadTransportData } = useTransport();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransportData();
    setRefreshing(false);
  };

  const handleBookingPress = (bookingId: string) => {
    router.push({
      pathname: '/(farmer)/transport/booking-detail',
      params: { id: bookingId },
    });
  };

  const activeBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'in-transit'
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Transport Services</Text>
        <Pressable onPress={() => router.push('/(farmer)/transport/my-bookings')}>
          <Text style={styles.bookingsButton}>📋</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <>
            {/* Book New Transport */}
            <View style={styles.bookNewSection}>
              <View style={styles.bookNewCard}>
                <View style={styles.bookNewContent}>
                  <Text style={styles.bookNewIcon}>🚛</Text>
                  <View style={styles.bookNewText}>
                    <Text style={styles.bookNewTitle}>Need Transport?</Text>
                    <Text style={styles.bookNewSubtitle}>
                      Book a vehicle for your crops or equipment
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.bookNewButton,
                    pressed && styles.bookNewButtonPressed,
                  ]}
                  onPress={() => router.push('/(farmer)/transport/book-transport')}
                >
                  <Text style={styles.bookNewButtonText}>Book Now →</Text>
                </Pressable>
              </View>
            </View>

            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Active Bookings</Text>
                  <Text style={styles.sectionCount}>{activeBookings.length}</Text>
                </View>
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPress={() => handleBookingPress(booking.id)}
                  />
                ))}
              </View>
            )}

            {/* Available Vehicles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Vehicles</Text>
              <Text style={styles.sectionSubtitle}>
                Choose from our range of transport options
              </Text>
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={() =>
                    router.push({
                      pathname: '/(farmer)/transport/book-transport',
                      params: { vehicleId: vehicle.id },
                    })
                  }
                />
              ))}
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Why Choose Us?</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✅</Text>
                  <Text style={styles.featureText}>
                    Verified and experienced drivers
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📍</Text>
                  <Text style={styles.featureText}>
                    Real-time GPS tracking
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💰</Text>
                  <Text style={styles.featureText}>
                    Competitive pricing
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🛡️</Text>
                  <Text style={styles.featureText}>
                    Cargo insurance available
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  bookingsButton: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  bookNewSection: {
    marginBottom: spacing.lg,
  },
  bookNewCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
  },
  bookNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  bookNewIcon: {
    fontSize: 48,
  },
  bookNewText: {
    flex: 1,
  },
  bookNewTitle: {
    ...typography.h4,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  bookNewSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bookNewButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookNewButtonPressed: {
    opacity: 0.7,
  },
  bookNewButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  sectionCount: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  featuresSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
});