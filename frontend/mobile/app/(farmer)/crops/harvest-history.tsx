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
import { HarvestFormData } from '@/types/crop.types';
import { harvestSchema } from '@/lib/schemas/crop.schemas';

const QUALITY_GRADES = ['A', 'B', 'C', 'D'];

export default function RecordHarvestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cropId } = useLocalSearchParams<{ cropId: string }>();
  const { selectedCrop, recordHarvest, isLoading, fetchCropById } = useCropStore();

  const [formData, setFormData] = useState<Partial<HarvestFormData>>({
    crop: cropId,
    harvest_date: new Date().toISOString().split('T')[0],
    total_yield: undefined,
    oil_content: undefined,
    moisture_level: undefined,
    quality_grade: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof HarvestFormData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (cropId) {
      fetchCropById(cropId);
    }
  }, [cropId]);

  const handleInputChange = <K extends keyof HarvestFormData>(
    field: K,
    value: HarvestFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      harvestSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<Record<keyof HarvestFormData, string>> = {};
      error.errors.forEach((err: any) => {
        const field = err.path[0] as keyof HarvestFormData;
        validationErrors[field] = err.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const calculateRevenue = (): number | null => {
    if (!formData.total_yield || !formData.quality_grade) return null;

    // Sample pricing logic (can be adjusted based on actual market rates)
    const basePricePerQuintal: { [key: string]: number } = {
      A: 6000,
      B: 5500,
      C: 5000,
      D: 4500,
    };

    const basePrice = basePricePerQuintal[formData.quality_grade] || 5000;
    
    // Adjust for oil content (bonus for higher oil content)
    let priceAdjustment = 1;
    if (formData.oil_content) {
      if (formData.oil_content >= 40) priceAdjustment = 1.1;
      else if (formData.oil_content >= 35) priceAdjustment = 1.05;
      else if (formData.oil_content < 30) priceAdjustment = 0.95;
    }

    return Math.round(formData.total_yield * basePrice * priceAdjustment);
  };

  const estimatedRevenue = calculateRevenue();

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    try {
      await recordHarvest(formData as HarvestFormData);
      Alert.alert(
        'Success',
        'Harvest recorded successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace(`/(farmer)/crops/${cropId}` as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to record harvest. Please try again.'
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
        <Text style={styles.headerTitle}>Record Harvest</Text>
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
        {/* Crop Info */}
        <View style={styles.cropInfoCard}>
          <View style={styles.cropInfoHeader}>
            <Ionicons name="leaf" size={32} color={colors.success} />
            <View style={styles.cropInfoText}>
              <Text style={styles.cropInfoTitle}>{selectedCrop.crop_type_display}</Text>
              <Text style={styles.cropInfoSubtitle}>{selectedCrop.variety}</Text>
              <Text style={styles.cropInfoDetail}>
                {selectedCrop.planted_area} acres • Planted on{' '}
                {new Date(selectedCrop.planting_date).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>
          {selectedCrop.estimated_yield && (
            <View style={styles.estimateTag}>
              <Text style={styles.estimateText}>
                Estimated Yield: {selectedCrop.estimated_yield} quintals
              </Text>
            </View>
          )}
        </View>

        {/* Harvest Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Harvest Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Harvest Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.harvest_date && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.success} />
              <Text style={styles.dateButtonText}>
                {formData.harvest_date
                  ? new Date(formData.harvest_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Select harvest date'}
              </Text>
            </TouchableOpacity>
            {errors.harvest_date && (
              <Text style={styles.errorText}>{errors.harvest_date}</Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.harvest_date ? new Date(formData.harvest_date) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  handleInputChange('harvest_date', date.toISOString().split('T')[0]);
                }
              }}
              minimumDate={new Date(selectedCrop.planting_date)}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Total Yield (quintals) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.total_yield && styles.inputError]}
              placeholder="Enter total yield in quintals"
              keyboardType="decimal-pad"
              value={formData.total_yield?.toString() || ''}
              onChangeText={(value) =>
                handleInputChange('total_yield', parseFloat(value) || undefined)
              }
            />
            {errors.total_yield && (
              <Text style={styles.errorText}>{errors.total_yield}</Text>
            )}
            {selectedCrop.estimated_yield && formData.total_yield && (
              <View style={styles.yieldComparison}>
                <Text style={styles.yieldComparisonText}>
                  {formData.total_yield > selectedCrop.estimated_yield ? '↑' : '↓'}{' '}
                  {Math.abs(
                    ((formData.total_yield - selectedCrop.estimated_yield) /
                      selectedCrop.estimated_yield) *
                      100
                  ).toFixed(1)}
                  % {formData.total_yield > selectedCrop.estimated_yield ? 'above' : 'below'}{' '}
                  estimate
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quality Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Parameters</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Oil Content (%) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.oil_content && styles.inputError]}
              placeholder="Enter oil content percentage"
              keyboardType="decimal-pad"
              value={formData.oil_content?.toString() || ''}
              onChangeText={(value) =>
                handleInputChange('oil_content', parseFloat(value) || undefined)
              }
            />
            {errors.oil_content && (
              <Text style={styles.errorText}>{errors.oil_content}</Text>
            )}
            {formData.oil_content && (
              <View style={styles.qualityIndicator}>
                <Text
                  style={[
                    styles.qualityText,
                    {
                      color:
                        formData.oil_content >= 40
                          ? colors.success
                          : formData.oil_content >= 35
                          ? colors.info
                          : formData.oil_content >= 30
                          ? colors.warning
                          : colors.error,
                    },
                  ]}
                >
                  {formData.oil_content >= 40
                    ? 'Excellent'
                    : formData.oil_content >= 35
                    ? 'Good'
                    : formData.oil_content >= 30
                    ? 'Average'
                    : 'Below Average'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Moisture Level (%) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.moisture_level && styles.inputError]}
              placeholder="Enter moisture level percentage"
              keyboardType="decimal-pad"
              value={formData.moisture_level?.toString() || ''}
              onChangeText={(value) =>
                handleInputChange('moisture_level', parseFloat(value) || undefined)
              }
            />
            {errors.moisture_level && (
              <Text style={styles.errorText}>{errors.moisture_level}</Text>
            )}
            {formData.moisture_level && formData.moisture_level > 10 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={styles.warningText}>
                  High moisture level may require drying before storage
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quality Grade <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.quality_grade && styles.inputError]}>
              <Picker
                selectedValue={formData.quality_grade}
                onValueChange={(value) => handleInputChange('quality_grade', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select quality grade" value="" />
                {QUALITY_GRADES.map((grade) => (
                  <Picker.Item key={grade} label={`Grade ${grade}`} value={grade} />
                ))}
              </Picker>
            </View>
            {errors.quality_grade && (
              <Text style={styles.errorText}>{errors.quality_grade}</Text>
            )}
          </View>
        </View>

        {/* Revenue Estimation */}
        {estimatedRevenue && (
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Ionicons name="cash" size={24} color={colors.success} />
              <Text style={styles.revenueTitle}>Estimated Revenue</Text>
            </View>
            <Text style={styles.revenueAmount}>
              ₹{estimatedRevenue.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.revenueNote}>
              Based on current market rates and quality parameters
            </Text>
          </View>
        )}

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes about the harvest"
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
              <Text style={styles.submitButtonText}>Record Harvest</Text>
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
  cropInfoCard: {
    backgroundColor: withOpacity(colors.success, 0.1),
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: withOpacity(colors.success, 0.2),
  },
  cropInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cropInfoText: {
    flex: 1,
  },
  cropInfoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  cropInfoSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  cropInfoDetail: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  estimateTag: {
    backgroundColor: withOpacity(colors.info, 0.15),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  estimateText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '600',
    fontSize: 12,
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
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  yieldComparison: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  yieldComparisonText: {
    ...typography.caption,
    color: colors.info,
    fontSize: 12,
  },
  qualityIndicator: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  qualityText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: withOpacity(colors.warning, 0.1),
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
    fontSize: 12,
  },
  revenueCard: {
    backgroundColor: withOpacity(colors.success, 0.1),
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  revenueTitle: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },
  revenueAmount: {
    ...typography.h1,
    color: colors.success,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  revenueNote: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
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
    backgroundColor: colors.success,
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