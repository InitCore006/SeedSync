import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransport } from '@/hooks/useTransport';
import VehicleCard from '@/components/transport/VehicleCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function BookTransportScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles, createBooking } = useTransport();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicleId || '');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [cargo, setCargo] = useState('');
  const [weight, setWeight] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBooking = async () => {
    // Validation
    if (!selectedVehicleId) {
      Alert.alert('Vehicle Required', 'Please select a vehicle type');
      return;
    }
    if (!pickupLocation.trim()) {
      Alert.alert('Pickup Location Required', 'Please enter pickup location');
      return;
    }
    if (!deliveryLocation.trim()) {
      Alert.alert('Delivery Location Required', 'Please enter delivery location');
      return;
    }
    if (!cargo.trim()) {
      Alert.alert('Cargo Required', 'Please describe what you want to transport');
      return;
    }
    if (!weight.trim()) {
      Alert.alert('Weight Required', 'Please enter approximate weight');
      return;
    }
    if (!scheduledDate.trim()) {
      Alert.alert('Date Required', 'Please enter scheduled date');
      return;
    }
    if (!scheduledTime.trim()) {
      Alert.alert('Time Required', 'Please enter scheduled time');
      return;
    }

    try {
      setIsProcessing(true);

      const booking = await createBooking({
        vehicleId: selectedVehicleId,
        pickupLocation: pickupLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        cargo: cargo.trim(),
        weight: weight.trim(),
        scheduledPickup: `${scheduledDate} ${scheduledTime}`,
      });

      Alert.alert(
        'Booking Successful',
        'Your transport has been booked successfully!',
        [
          {
            text: 'View Details',
            onPress: () =>
              router.replace({
                pathname: '/(farmer)/transport/booking-detail',
                params: { id: booking.id },
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Booking Failed', 'Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Book Transport</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Select Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => setSelectedVehicleId(vehicle.id)}
              isSelected={selectedVehicleId === vehicle.id}
            />
          ))}
        </View>

        {/* Pickup Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📍 Pickup Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pickup address"
              placeholderTextColor={colors.text.secondary}
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>📅 Date</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.text.secondary}
                value={scheduledDate}
                onChangeText={setScheduledDate}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>⏰ Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={colors.text.secondary}
                value={scheduledTime}
                onChangeText={setScheduledTime}
              />
            </View>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📍 Delivery Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter delivery address"
              placeholderTextColor={colors.text.secondary}
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
            />
          </View>
        </View>

        {/* Cargo Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📦 What are you transporting?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="E.g., Wheat, Rice, Farm Equipment"
              placeholderTextColor={colors.text.secondary}
              value={cargo}
              onChangeText={setCargo}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>⚖️ Approximate Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 500 kg, 2 tons"
              placeholderTextColor={colors.text.secondary}
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Final cost will be calculated based on distance and vehicle type. You will be contacted shortly to confirm details.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.bookButton,
            isProcessing && styles.bookButtonDisabled,
            pressed && styles.bookButtonPressed,
          ]}
          onPress={handleBooking}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <LoadingSpinner color={colors.surface} />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </Pressable>
      </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
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
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.border,
  },
  bookButtonPressed: {
    opacity: 0.7,
  },
  bookButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});