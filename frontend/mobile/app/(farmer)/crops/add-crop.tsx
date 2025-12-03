import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { ZodError } from 'zod';

import { useCropStore } from '@/store/cropStore';
import { useAuthStore } from '@/store/authStore';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { OILSEED_CROPS, INDIAN_STATES } from '@/lib/constants/crops';
import { CropFormData, CropType } from '@/types/crop.types';
import { cropFormSchema } from '@/lib/schemas/crop.schemas';


export default function AddCropScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createCrop, isLoading } = useCropStore();
  const { profile } = useAuthStore();

  const [formData, setFormData] = useState<Partial<CropFormData>>({
    crop_type: undefined,
    variety: '',
    planted_area: undefined,
    planting_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: '',
    district: profile?.profile?.district || '',
    state: profile?.profile?.state || '',
    latitude: undefined,
    longitude: undefined,
    location_address: profile?.profile?.address_line1 || '',
    estimated_yield: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CropFormData, string>>>({});
  const [showPlantingDatePicker, setShowPlantingDatePicker] = useState(false);
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const selectedCrop = formData.crop_type
    ? OILSEED_CROPS.find((c) => c.id === formData.crop_type)
    : null;

  const handleInputChange = <K extends keyof CropFormData>(
    field: K,
    value: CropFormData[K] | undefined
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // If crop type changes, reset variety
      if (field === 'crop_type') {
        updated.variety = '';
      }
      
      return updated;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable location access to auto-fill your location.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setFormData((prev) => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location_address: address.street
          ? `${address.street}, ${address.city || address.subregion}`
          : prev.location_address,
        district: address.city || address.subregion || prev.district,
        state: address.region || prev.state,
      }));

      Alert.alert('Success', 'Location fetched successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      // Validate all required fields manually first
      const validationErrors: Partial<Record<keyof CropFormData, string>> = {};

      if (!formData.crop_type) {
        validationErrors.crop_type = 'Crop type is required';
      }
      if (!formData.variety) {
        validationErrors.variety = 'Variety is required';
      }
      if (!formData.planted_area || formData.planted_area <= 0) {
        validationErrors.planted_area = 'Planted area must be greater than 0';
      }
      if (!formData.planting_date) {
        validationErrors.planting_date = 'Planting date is required';
      }
      if (!formData.expected_harvest_date) {
        validationErrors.expected_harvest_date = 'Expected harvest date is required';
      }
      if (!formData.district) {
        validationErrors.district = 'District is required';
      }
      if (!formData.state) {
        validationErrors.state = 'State is required';
      }

      // Check if harvest date is after planting date
      if (formData.planting_date && formData.expected_harvest_date) {
        const plantingDate = new Date(formData.planting_date);
        const harvestDate = new Date(formData.expected_harvest_date);
        if (harvestDate <= plantingDate) {
          validationErrors.expected_harvest_date = 'Harvest date must be after planting date';
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      // Then validate with Zod schema
      cropFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: Partial<Record<keyof CropFormData, string>> = {};
        
        // Access issues array from ZodError
        if (error.issues && Array.isArray(error.issues)) {
          error.issues.forEach((issue) => {
            if (issue.path && issue.path.length > 0) {
              const field = issue.path[0] as keyof CropFormData;
              validationErrors[field] = issue.message;
            }
          });
        }
        
        setErrors(validationErrors);
        console.log('Validation errors:', validationErrors);
      } else {
        console.error('Unexpected validation error:', error);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    console.log('Form data before validation:', formData);

    // Validate form before submitting
    if (!validateForm()) {
      const firstError = Object.entries(errors)[0];
      if (firstError) {
        Alert.alert(
          'Validation Error',
          `${firstError[0]}: ${firstError[1]}`
        );
      } else {
        Alert.alert(
          'Validation Error',
          'Please fill in all required fields.'
        );
      }
      return;
    }

    try {
      // Prepare data for submission
      const submitData: CropFormData = {
        crop_type: formData.crop_type as CropType,
        variety: formData.variety!,
        planted_area: formData.planted_area!,
        planting_date: formData.planting_date!,
        expected_harvest_date: formData.expected_harvest_date!,
        district: formData.district!,
        state: formData.state!,
        latitude: formData.latitude,
        longitude: formData.longitude,
        location_address: formData.location_address,
        estimated_yield: formData.estimated_yield,
      };

      console.log('Submitting crop data:', submitData);

      // Create crop
      await createCrop(submitData);
      
      Alert.alert(
        'Success',
        'Crop added successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(farmer)/crops' as any)
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating crop:', error);
      
      // Handle API errors with more detail
      let errorMessage = 'Failed to add crop. Please try again.';
      
      if (error?.response?.data) {
        const apiError = error.response.data;
        if (typeof apiError === 'string') {
          errorMessage = apiError;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.detail) {
          errorMessage = apiError.detail;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Crop</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Crop Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Crop Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.crop_type && styles.inputError]}>
              <Picker
                selectedValue={formData.crop_type || ''}
                onValueChange={(value) => {
                  if (value !== '') {
                    handleInputChange('crop_type', value as CropType);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select crop type" value="" />
                {OILSEED_CROPS.map((crop) => (
                  <Picker.Item
                    key={crop.id}
                    label={crop.name}
                    value={crop.id}
                  />
                ))}
              </Picker>
            </View>
            {errors.crop_type && (
              <Text style={styles.errorText}>{errors.crop_type}</Text>
            )}
          </View>

          {selectedCrop && (
            <View style={styles.cropInfoCard}>
              <View style={styles.cropInfoRow}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.cropInfoText}>{selectedCrop.scientificName}</Text>
              </View>
              <View style={styles.cropInfoRow}>
                <Ionicons name="calendar" size={20} color={colors.success} />
                <Text style={styles.cropInfoText}>{selectedCrop.growthPeriod}</Text>
              </View>
              <View style={styles.cropInfoRow}>
                <Ionicons name="trending-up" size={20} color={colors.info} />
                <Text style={styles.cropInfoText}>{selectedCrop.averageYieldPerAcre}</Text>
              </View>
              <View style={styles.cropInfoRow}>
                <Ionicons name="water" size={20} color={colors.accent} />
                <Text style={styles.cropInfoText}>Oil: {selectedCrop.oilContentRange}</Text>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Variety <Text style={styles.required}>*</Text>
            </Text>
            {selectedCrop && selectedCrop.varieties.length > 0 ? (
              <View style={[styles.pickerContainer, errors.variety && styles.inputError]}>
                <Picker
                  selectedValue={formData.variety || ''}
                  onValueChange={(value) => handleInputChange('variety', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select variety" value="" />
                  {selectedCrop.varieties.map((variety) => (
                    <Picker.Item
                      key={variety}
                      label={variety}
                      value={variety}
                    />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.input,
                  !selectedCrop && styles.inputDisabled,
                  errors.variety && styles.inputError
                ]}
                placeholder={selectedCrop ? "Enter variety name" : "Select crop type first"}
                value={formData.variety}
                onChangeText={(value) => handleInputChange('variety', value)}
                editable={!!selectedCrop}
              />
            )}
            {errors.variety && (
              <Text style={styles.errorText}>{errors.variety}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Planted Area (acres) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.planted_area && styles.inputError]}
              placeholder="Enter area in acres"
              keyboardType="decimal-pad"
              value={formData.planted_area?.toString() || ''}
              onChangeText={(value) => {
                const numValue = value === '' ? undefined : parseFloat(value);
                handleInputChange('planted_area', numValue);
              }}
            />
            {errors.planted_area && (
              <Text style={styles.errorText}>{errors.planted_area}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Estimated Yield (quintals)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Expected total yield"
              keyboardType="decimal-pad"
              value={formData.estimated_yield?.toString() || ''}
              onChangeText={(value) => {
                const numValue = value === '' ? undefined : parseFloat(value);
                handleInputChange('estimated_yield', numValue);
              }}
            />
            {errors.estimated_yield && (
              <Text style={styles.errorText}>{errors.estimated_yield}</Text>
            )}
          </View>
        </View>

        {/* Date Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planting Schedule</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Planting Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.planting_date && styles.inputError]}
              onPress={() => setShowPlantingDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>
                {formData.planting_date
                  ? new Date(formData.planting_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Select planting date'}
              </Text>
            </TouchableOpacity>
            {errors.planting_date && (
              <Text style={styles.errorText}>{errors.planting_date}</Text>
            )}
          </View>

          {showPlantingDatePicker && (
            <DateTimePicker
              value={formData.planting_date ? new Date(formData.planting_date) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowPlantingDatePicker(false);
                if (date) {
                  handleInputChange('planting_date', date.toISOString().split('T')[0]);
                }
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Expected Harvest Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.expected_harvest_date && styles.inputError]}
              onPress={() => setShowHarvestDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.success} />
              <Text style={styles.dateButtonText}>
                {formData.expected_harvest_date
                  ? new Date(formData.expected_harvest_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Select harvest date'}
              </Text>
            </TouchableOpacity>
            {errors.expected_harvest_date && (
              <Text style={styles.errorText}>{errors.expected_harvest_date}</Text>
            )}
          </View>

          {showHarvestDatePicker && (
            <DateTimePicker
              value={
                formData.expected_harvest_date
                  ? new Date(formData.expected_harvest_date)
                  : formData.planting_date
                  ? new Date(new Date(formData.planting_date).getTime() + 90 * 24 * 60 * 60 * 1000)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowHarvestDatePicker(false);
                if (date) {
                  handleInputChange('expected_harvest_date', date.toISOString().split('T')[0]);
                }
              }}
              minimumDate={
                formData.planting_date
                  ? new Date(new Date(formData.planting_date).getTime() + 30 * 24 * 60 * 60 * 1000)
                  : new Date()
              }
            />
          )}
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={fetchingLocation}
            >
              {fetchingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={styles.locationButtonText}>Auto-fill</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              District <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.district && styles.inputError]}
              placeholder="Enter district"
              value={formData.district}
              onChangeText={(value) => handleInputChange('district', value)}
            />
            {errors.district && (
              <Text style={styles.errorText}>{errors.district}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              State <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.state && styles.inputError]}>
              <Picker
                selectedValue={formData.state || ''}
                onValueChange={(value) => handleInputChange('state', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select state" value="" />
                {INDIAN_STATES.map((state) => (
                  <Picker.Item key={state} label={state} value={state} />
                ))}
              </Picker>
            </View>
            {errors.state && (
              <Text style={styles.errorText}>{errors.state}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Farm Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter farm address"
              multiline
              numberOfLines={3}
              value={formData.location_address}
              onChangeText={(value) => handleInputChange('location_address', value)}
            />
          </View>

          {formData.latitude && formData.longitude && (
            <View style={styles.coordinatesCard}>
              <Ionicons name="pin" size={20} color={colors.success} />
              <View style={styles.coordinatesInfo}>
                <Text style={styles.coordinatesLabel}>GPS Coordinates</Text>
                <Text style={styles.coordinatesText}>
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
        ]}
      >
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.submitButtonText}>Add Crop</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
    color: colors.text.secondary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  dateButtonText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  cropInfoCard: {
    backgroundColor: withOpacity(colors.primary, 0.05),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cropInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cropInfoText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  locationButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  coordinatesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: withOpacity(colors.success, 0.1),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  coordinatesInfo: {
    flex: 1,
  },
  coordinatesLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  coordinatesText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
});