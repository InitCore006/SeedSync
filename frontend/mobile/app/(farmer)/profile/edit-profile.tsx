import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import { useProfile, ProfileFormData } from '@/hooks/useProfile';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, isLoading, isUpdating, error, updateProfile, uploadProfileImage } = useProfile();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    totalLandArea: '',
    irrigatedLand: '',
    rainfedLand: '',
    primarySoilType: '',
    irrigationMethod: '',
    isKycVerified: false,
    isPhoneVerified: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Update form data when profile loads - only once
  useEffect(() => {
    if (profile && !formInitialized) {
      console.log('📝 Initializing form with profile data');
      setFormData(profile);
      setFormInitialized(true);
    }
  }, [profile, formInitialized]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleImagePick = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to update profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        try {
          await uploadProfileImage(result.assets[0].uri);
          Alert.alert('Success', 'Profile image updated successfully');
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to upload image');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error: any) {
      setUploadingImage(false);
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  }, [uploadProfileImage]);

  const handleSubmit = useCallback(async () => {
    try {
      console.log('💾 Submitting form...');
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile'
      );
    }
  }, [formData, updateProfile, router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Profile not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const userInitials = formData.firstName && formData.lastName
    ? `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase()
    : 'F';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Image */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {formData.profileImage ? (
              <Image 
                source={{ uri: formData.profileImage }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>{userInitials}</Text>
              </View>
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={handleImagePick}
            disabled={uploadingImage}
          >
            <Ionicons name="camera" size={18} color={colors.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>First Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isUpdating}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isUpdating}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                editable={false}
                placeholderTextColor={colors.text.secondary}
              />
              <Ionicons 
                name={formData.isPhoneVerified ? "checkmark-circle" : "time-outline"} 
                size={20} 
                color={formData.isPhoneVerified ? colors.success : colors.warning}
                style={styles.inputIcon}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email address"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isUpdating}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isUpdating}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.dateButtonText, !formData.dateOfBirth && styles.placeholderText]}>
                {formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Select date of birth'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setFormData(prev => ({ 
                    ...prev, 
                    dateOfBirth: date.toISOString().split('T')[0] 
                  }));
                }
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as any }))}
                style={styles.picker}
                enabled={!isUpdating}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="M" />
                <Picker.Item label="Female" value="F" />
                <Picker.Item label="Other" value="O" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Enter complete address"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={3}
                editable={!isUpdating}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.village}
                onChangeText={(text) => setFormData(prev => ({ ...prev, village: text }))}
                placeholder="Enter village name"
                placeholderTextColor={colors.text.secondary}
                editable={!isUpdating}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>District *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.district}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, district: text }))}
                  placeholder="District"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isUpdating}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>State *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor={colors.text.secondary}
                  editable={!isUpdating}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pincode *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.pincode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, pincode: text }))}
                placeholder="Enter 6-digit pincode"
                placeholderTextColor={colors.text.secondary}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isUpdating}
              />
            </View>
          </View>
        </View>

        {/* Farm Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Information</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Total Land (Acres) *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.totalLandArea}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, totalLandArea: text }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="decimal-pad"
                  editable={!isUpdating}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Irrigated Land</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.irrigatedLand}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, irrigatedLand: text }))}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="decimal-pad"
                  editable={!isUpdating}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rainfed Land (Acres)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.rainfedLand}
                onChangeText={(text) => setFormData(prev => ({ ...prev, rainfedLand: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
                editable={!isUpdating}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Soil Type</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.primarySoilType}
                onChangeText={(text) => setFormData(prev => ({ ...prev, primarySoilType: text }))}
                placeholder="e.g., Clay, Loamy, Sandy, Black Soil"
                placeholderTextColor={colors.text.secondary}
                editable={!isUpdating}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Irrigation Method</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.irrigationMethod}
                onChangeText={(text) => setFormData(prev => ({ ...prev, irrigationMethod: text }))}
                placeholder="e.g., Drip, Sprinkler, Canal, Borewell"
                placeholderTextColor={colors.text.secondary}
                editable={!isUpdating}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
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
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.gray[200],
    ...shadows.md,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.md,
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  changePhotoText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
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
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  disabledInput: {
    backgroundColor: colors.gray[100],
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    flex: 1,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
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
  placeholderText: {
    color: colors.text.secondary,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    ...shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});