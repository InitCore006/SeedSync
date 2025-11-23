import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRegistrationStore } from '@/store/registrationStore';
import { useFarmerStore } from '@/store/farmerStore';
import { useCamera } from '@/hooks/common/useCamera';
import { useLocation } from '@/hooks/common/useLocation';
import { lotStep3Schema } from '@lib/schemas/farmer.schema';
import { Input } from '@/components/common/Input';
import { DatePicker } from '@/components/common/DatePicker';
import { Button } from '@/components/common/Button';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius } from '@lib/constants/spacing';

interface Step3FormData {
  reserve_price: string;
  pickup_location: string;
  available_from: Date;
  available_to: Date;
}

export default function CreateLotStep3() {
  const router = useRouter();
  const { step1Data, step2Data, step3Data, saveStepData, previousStep, reset } =
    useRegistrationStore();
  const { createLot } = useFarmerStore();
  const { selectMultipleImages } = useCamera();
  const { getCurrentLocation, getAddressFromCoords } = useLocation();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(lotStep3Schema),
    defaultValues: step3Data || {
      reserve_price: '',
      pickup_location: '',
      available_from: new Date(),
      available_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const handlePickImages = async () => {
    const selectedImages = await selectMultipleImages(5);
    if (selectedImages.length > 0) {
      setImages(selectedImages.map((img) => img.uri));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const address = await getAddressFromCoords(location.latitude, location.longitude);
        setValue('pickup_location', address);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLocationLoading(false);
    }
  };

  const onSubmit = async (data: Step3FormData) => {
    if (!step1Data || !step2Data) {
      Alert.alert('Error', 'Please complete all previous steps');
      return;
    }

    setLoading(true);

    try {
      // Combine all step data
      const lotData = {
        ...step1Data,
        ...step2Data,
        ...data,
        quantity: parseFloat(step1Data.quantity),
        reserve_price: parseFloat(data.reserve_price),
        moisture_content: step2Data.moisture_content
          ? parseFloat(step2Data.moisture_content)
          : undefined,
        oil_content: step2Data.oil_content ? parseFloat(step2Data.oil_content) : undefined,
        foreign_matter: step2Data.foreign_matter
          ? parseFloat(step2Data.foreign_matter)
          : undefined,
        damaged_seeds: step2Data.damaged_seeds
          ? parseFloat(step2Data.damaged_seeds)
          : undefined,
        images: images.length > 0 ? images : undefined,
      };

      // Create lot
      await createLot(lotData);

      // Reset form and navigate
      reset();
      Alert.alert('Success', 'Your lot has been created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/(farmer)/lots'),
        },
      ]);
    } catch (error: any) {
      console.error('Create lot error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create lot. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="Back"
            variant="text"
            onPress={handleBack}
            icon={<Ionicons name="arrow-back" size={20} color={colors.primary[500]} />}
            iconPosition="left"
          />
          <Text style={styles.headerTitle}>Step 3 of 3</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Ionicons name="pricetag" size={32} color={colors.primary[500]} />
            <Text style={styles.title}>Pricing & Availability</Text>
            <Text style={styles.subtitle}>Set your price and pickup details</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Reserve Price */}
            <Controller
              control={control}
              name="reserve_price"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Reserve Price (per Quintal)"
                  placeholder="Enter price in ₹"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.reserve_price?.message}
                  keyboardType="decimal-pad"
                  leftIcon="cash-outline"
                  required
                />
              )}
            />

            {/* Pickup Location */}
            <Controller
              control={control}
              name="pickup_location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Pickup Location"
                  placeholder="Enter pickup address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.pickup_location?.message}
                  leftIcon="location-outline"
                  rightIcon="navigate"
                  onRightIconPress={handleGetLocation}
                  required
                />
              )}
            />

            {locationLoading && (
              <Text style={styles.locationHint}>Getting your location...</Text>
            )}

            {/* Available From */}
            <Controller
              control={control}
              name="available_from"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Available From"
                  value={value}
                  onChange={onChange}
                  minimumDate={new Date()}
                  error={errors.available_from?.message}
                  required
                />
              )}
            />

            {/* Available To */}
            <Controller
              control={control}
              name="available_to"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Available To"
                  value={value}
                  onChange={onChange}
                  minimumDate={new Date()}
                  error={errors.available_to?.message}
                  required
                />
              )}
            />

            {/* Images */}
            <View style={styles.imagesSection}>
              <Text style={styles.imagesLabel}>Upload Images (Optional)</Text>
              <Text style={styles.imagesHint}>Add up to 5 photos of your produce</Text>

              <View style={styles.imagesGrid}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                {images.length < 5 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
                    <Ionicons name="camera" size={32} color={colors.primary[500]} />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.success} />
              <Text style={styles.infoText}>
                You're almost done! Review your details and submit to list your lot.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Create Lot"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            icon={<Ionicons name="checkmark" size={20} color={colors.text.inverse} />}
            iconPosition="right"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
  },

  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },

  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  formContainer: {
    flex: 1,
  },

  locationHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary[500],
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  imagesSection: {
    marginBottom: spacing.lg,
  },

  imagesLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  imagesHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },

  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background.default,
    borderRadius: 12,
  },

  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addImageText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary[500],
    marginTop: spacing.xs,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.success + '15',
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.success,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },

  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.default,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});