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
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { useCropStore } from '@/store/cropStore';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { ObservationFormData } from '@/types/crop.types';
import { observationSchema } from '@/lib/schemas/crop.schemas';

export default function AddObservationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ cropId: string }>();
  const cropId = params.cropId;

  const { addObservation, isLoading } = useCropStore();

  const [formData, setFormData] = useState<Partial<ObservationFormData>>({
    crop: '',
    observation_date: new Date().toISOString().split('T')[0],
    plant_height: undefined,
    leaf_color: '',
    pest_infestation: false,
    disease_detected: false,
    disease_name: '',
    soil_moisture: undefined,
    temperature: undefined,
    rainfall: undefined,
    notes: '',
  });

  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ObservationFormData, string>>>({});
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

  const handleInputChange = <K extends keyof ObservationFormData>(
    field: K,
    value: ObservationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateForm = (): boolean => {
    try {
      observationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<Record<keyof ObservationFormData, string>> = {};
      error.errors.forEach((err: any) => {
        const field = err.path[0] as keyof ObservationFormData;
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
      const submitData = { ...formData };
      
      if (image) {
        // Create FormData for image upload
        const imageFile = {
          uri: image,
          type: 'image/jpeg',
          name: 'observation.jpg',
        };
        submitData.image = imageFile as any;
      }

      console.log('Submitting observation data:', submitData);
      await addObservation(submitData as ObservationFormData);
      Alert.alert(
        'Success',
        'Observation recorded successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error adding observation:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to record observation. Please try again.'
      );
    }
  };

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
        <Text style={styles.headerTitle}>Record Observation</Text>
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
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observation Date</Text>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>
                {new Date(formData.observation_date!).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.observation_date!)}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  handleInputChange('observation_date', date.toISOString().split('T')[0]);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Image</Text>

          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle" size={32} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color={colors.primary} />
                <Text style={styles.imageActionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color={colors.info} />
                <Text style={styles.imageActionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Plant Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Metrics</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plant Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter height in cm"
              keyboardType="decimal-pad"
              value={formData.plant_height?.toString() || ''}
              onChangeText={(value) =>
                handleInputChange('plant_height', parseFloat(value) || undefined)
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Leaf Color</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Green, Yellow, Brown"
              value={formData.leaf_color}
              onChangeText={(value) => handleInputChange('leaf_color', value)}
            />
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Status</Text>

          <View style={styles.checkboxGroup}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                handleInputChange('pest_infestation', !formData.pest_infestation)
              }
            >
              <View style={[styles.checkboxBox, formData.pest_infestation && styles.checkboxBoxChecked]}>
                {formData.pest_infestation && (
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Pest Infestation Detected</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                handleInputChange('disease_detected', !formData.disease_detected)
              }
            >
              <View style={[styles.checkboxBox, formData.disease_detected && styles.checkboxBoxChecked]}>
                {formData.disease_detected && (
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Disease Detected</Text>
            </TouchableOpacity>
          </View>

          {formData.disease_detected && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Disease Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter disease name"
                value={formData.disease_name}
                onChangeText={(value) => handleInputChange('disease_name', value)}
              />
            </View>
          )}
        </View>

        {/* Environmental Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Data</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soil Moisture (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="0-100"
              keyboardType="decimal-pad"
              value={formData.soil_moisture?.toString() || ''}
              onChangeText={(value) =>
                handleInputChange('soil_moisture', parseFloat(value) || undefined)
              }
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Temperature (°C)</Text>
              <TextInput
                style={styles.input}
                placeholder="°C"
                keyboardType="decimal-pad"
                value={formData.temperature?.toString() || ''}
                onChangeText={(value) =>
                  handleInputChange('temperature', parseFloat(value) || undefined)
                }
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Rainfall (mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="mm"
                keyboardType="decimal-pad"
                value={formData.rainfall?.toString() || ''}
                onChangeText={(value) =>
                  handleInputChange('rainfall', parseFloat(value) || undefined)
                }
              />
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional observations or notes"
              multiline
              numberOfLines={5}
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
              <Text style={styles.submitButtonText}>Record Observation</Text>
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
  textArea: {
    minHeight: 120,
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
  imageContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  imageActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  imageActionText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 13,
  },
  checkboxGroup: {
    gap: spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
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