import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { useCropStore } from '@/store/cropStore';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { OILSEED_CROPS, INDIAN_STATES } from '@/lib/constants/crops';

import { UpdateCropData } from '@/types/crop.types';
import { updateCropSchema } from '@/lib/schemas/crop.schemas';

export default function EditCropScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedCrop, updateCrop, isLoading, fetchCropById } = useCropStore();

  const [formData, setFormData] = useState<Partial<UpdateCropData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateCropData, string>>>({});
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);

  useEffect(() => {
    if (id) {
      loadCrop();
    }
  }, [id]);

  useEffect(() => {
    if (selectedCrop) {
      setFormData({
        variety: selectedCrop.variety,
        planted_area: selectedCrop.planted_area,
        expected_harvest_date: selectedCrop.expected_harvest_date,
        estimated_yield: selectedCrop.estimated_yield,
        location_address: selectedCrop.location_address,
      });
    }
  }, [selectedCrop]);

  const loadCrop = async () => {
    if (id) {
      await fetchCropById(id);
    }
  };

  const handleInputChange = <K extends keyof UpdateCropData>(
    field: K,
    value: UpdateCropData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      updateCropSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<Record<keyof UpdateCropData, string>> = {};
      error.errors.forEach((err: any) => {
        const field = err.path[0] as keyof UpdateCropData;
        validationErrors[field] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    if (!id) return;

    try {
      await updateCrop(id, formData);
      Alert.alert(
        'Success',
        'Crop updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update crop. Please try again.'
      );
    }
  };

  if (!selectedCrop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading crop details...</Text>
      </View>
    );
  }

  const selectedCropType = OILSEED_CROPS.find((c) => c.id === selectedCrop.crop_type);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Crop</Text>
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
        {/* Crop Info (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Information</Text>
          
          <View style={styles.readOnlyCard}>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Crop Type</Text>
              <Text style={styles.readOnlyValue}>{selectedCrop.crop_type_display}</Text>
            </View>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Crop ID</Text>
              <Text style={styles.readOnlyValue}>{selectedCrop.crop_id}</Text>
            </View>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Planting Date</Text>
              <Text style={styles.readOnlyValue}>
                {new Date(selectedCrop.planting_date).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Variety <Text style={styles.required}>*</Text>
            </Text>
            {selectedCropType ? (
              <View style={[styles.pickerContainer, errors.variety && styles.inputError]}>
                <Picker
                  selectedValue={formData.variety}
                  onValueChange={(value) => handleInputChange('variety', value)}
                  style={styles.picker}
                >
                  {selectedCropType.varieties.map((variety) => (
                    <Picker.Item key={variety} label={variety} value={variety} />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput
                style={[styles.input, errors.variety && styles.inputError]}
                placeholder="Enter variety"
                value={formData.variety}
                onChangeText={(value) => handleInputChange('variety', value)}
              />
            )}
            {errors.variety && <Text style={styles.errorText}>{errors.variety}</Text>}
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
              onChangeText={(value) =>
                handleInputChange('planted_area', parseFloat(value) || undefined)
              }
            />
            {errors.planted_area && (
              <Text style={styles.errorText}>{errors.planted_area}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Yield (quintals)</Text>
            <TextInput
              style={styles.input}
              placeholder="Expected yield"
              keyboardType="decimal-pad"
              value={formData.estimated_yield?.toString() || ''}
              onChangeText={(value) =>
                handleInputChange('estimated_yield', parseFloat(value) || undefined)
              }
            />
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Harvest Schedule</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Harvest Date</Text>
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
                  : new Date(selectedCrop.expected_harvest_date)
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowHarvestDatePicker(false);
                if (date) {
                  handleInputChange('expected_harvest_date', date.toISOString().split('T')[0]);
                }
              }}
              minimumDate={new Date(selectedCrop.planting_date)}
            />
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <View style={styles.readOnlyCard}>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>District</Text>
              <Text style={styles.readOnlyValue}>{selectedCrop.district}</Text>
            </View>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>State</Text>
              <Text style={styles.readOnlyValue}>{selectedCrop.state}</Text>
            </View>
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
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
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
              <Text style={styles.submitButtonText}>Update Crop</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
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
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  readOnlyCard: {
    backgroundColor: withOpacity(colors.gray[100], 0.5),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  readOnlyLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  readOnlyValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
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
    backgroundColor: colors.surface,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
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