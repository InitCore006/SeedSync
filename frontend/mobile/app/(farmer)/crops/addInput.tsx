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
import { INPUT_TYPES } from '@/lib/constants/crops';

import { CropInputFormData } from '@/types/crop.types';
import { cropInputSchema } from '@/lib/schemas/crop.schemas';

const COMMON_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'bags', label: 'Bags' },
  { value: 'units', label: 'Units' },
];

const INPUT_SUGGESTIONS: { [key: string]: string[] } = {
  fertilizer: ['Urea', 'DAP', 'MOP', 'NPK', 'Organic Manure', 'Vermicompost'],
  pesticide: ['Chlorpyrifos', 'Imidacloprid', 'Cypermethrin', 'Malathion'],
  herbicide: ['Glyphosate', '2,4-D', 'Atrazine', 'Paraquat'],
  seed: ['Certified Seeds', 'Hybrid Seeds'],
  irrigation: ['Drip Irrigation', 'Sprinkler', 'Flood Irrigation'],
};

export default function AddInputScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ cropId: string }>();
  const cropId = params.cropId;

  const { addInput, isLoading } = useCropStore();

  const [formData, setFormData] = useState<Partial<CropInputFormData>>({
    crop: '',
    input_type: undefined,
    input_name: '',
    quantity: undefined,
    unit: '',
    application_date: new Date().toISOString().split('T')[0],
    cost: undefined,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CropInputFormData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set crop ID when component mounts
  useEffect(() => {
    if (cropId) {
      console.log('Setting cropId:', cropId);
      setFormData((prev) => ({ ...prev, crop: cropId }));
    } else {
      Alert.alert('Error', 'Crop ID is missing', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [cropId]);

  const handleInputChange = <K extends keyof CropInputFormData>(
    field: K,
    value: CropInputFormData[K] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      cropInputSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<Record<keyof CropInputFormData, string>> = {};
      error.errors.forEach((err: any) => {
        const field = err.path[0] as keyof CropInputFormData;
        validationErrors[field] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.crop) {
      Alert.alert('Error', 'Crop ID is missing. Please go back and try again.');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    try {
      console.log('Submitting input data:', formData);
      await addInput(formData as CropInputFormData);
      Alert.alert(
        'Success',
        'Input added successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error adding input:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to add input. Please try again.'
      );
    }
  };

  const suggestions = formData.input_type
    ? INPUT_SUGGESTIONS[formData.input_type] || []
    : [];

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
        <Text style={styles.headerTitle}>Add Crop Input</Text>
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
        {/* Input Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Input Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.input_type && styles.inputError]}>
              <Picker
                selectedValue={formData.input_type}
                onValueChange={(value) => handleInputChange('input_type', value as any)}
                style={styles.picker}
              >
                <Picker.Item label="Select input type" value="" />
                {INPUT_TYPES.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
            {errors.input_type && (
              <Text style={styles.errorText}>{errors.input_type}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Input Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.input_name && styles.inputError]}
              placeholder="Enter input name"
              value={formData.input_name}
              onChangeText={(value) => handleInputChange('input_name', value)}
            />
            {errors.input_name && (
              <Text style={styles.errorText}>{errors.input_name}</Text>
            )}
            
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Common options:</Text>
                <View style={styles.suggestionsList}>
                  {suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      style={styles.suggestionChip}
                      onPress={() => handleInputChange('input_name', suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Quantity <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.quantity && styles.inputError]}
                placeholder="0"
                keyboardType="decimal-pad"
                value={formData.quantity?.toString() || ''}
                onChangeText={(value) => {
                  const num = parseFloat(value);
                  handleInputChange('quantity', isNaN(num) ? undefined : num);
                }}
              />
              {errors.quantity && (
                <Text style={styles.errorText}>{errors.quantity}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Unit <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, errors.unit && styles.inputError]}>
                <Picker
                  selectedValue={formData.unit}
                  onValueChange={(value) => handleInputChange('unit', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select unit" value="" />
                  {COMMON_UNITS.map((unit) => (
                    <Picker.Item key={unit.value} label={unit.label} value={unit.value} />
                  ))}
                </Picker>
              </View>
              {errors.unit && (
                <Text style={styles.errorText}>{errors.unit}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Application Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Application Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.application_date && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>
                {formData.application_date
                  ? new Date(formData.application_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Select date'}
              </Text>
            </TouchableOpacity>
            {errors.application_date && (
              <Text style={styles.errorText}>{errors.application_date}</Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                formData.application_date
                  ? new Date(formData.application_date)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  handleInputChange('application_date', date.toISOString().split('T')[0]);
                }
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter cost"
              keyboardType="decimal-pad"
              value={formData.cost?.toString() || ''}
              onChangeText={(value) => {
                const num = parseFloat(value);
                handleInputChange('cost', isNaN(num) ? undefined : num);
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes"
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
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
              <Text style={styles.submitButtonText}>Add Input</Text>
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
    minHeight: 100,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  suggestionsContainer: {
    marginTop: spacing.sm,
  },
  suggestionsLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: withOpacity(colors.primary, 0.1),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.3),
  },
  suggestionText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
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