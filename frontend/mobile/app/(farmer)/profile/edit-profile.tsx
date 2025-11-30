import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useCamera } from '@/hooks/useCamera';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import DatePicker from '@/components/common/DatePicker';
import Select from '@/components/common/Select';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function EditProfileScreen() {
  const { profile, isLoading, updateProfile, uploadProfileImage } = useProfile();
  const { pickImage } = useCamera();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    farmSize: '',
    farmSizeUnit: 'acre',
    soilType: '',
    irrigationType: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        village: profile.village || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        farmSize: profile.farmSize?.toString() || '',
        farmSizeUnit: profile.farmSizeUnit || 'acre',
        soilType: profile.soilType || '',
        irrigationType: profile.irrigationType || '',
      });
    }
  }, [profile]);

  const handleImagePick = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setUploadingImage(true);
        await uploadProfileImage(imageUri);
        setUploadingImage(false);
        Alert.alert('Success', 'Profile image updated successfully');
      }
    } catch (error) {
      setUploadingImage(false);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    try {
      await updateProfile({
        ...formData,
        farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Image */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              {profile.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {profile.firstName.charAt(0).toUpperCase()}
                    {profile.lastName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color={colors.surface} />
                </View>
              )}
            </View>
            <Pressable style={styles.changePhotoButton} onPress={handleImagePick}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              placeholder="Enter first name"
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              placeholder="Enter last name"
            />

            <Input
              label="Email (Optional)"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
              placeholder="Select date of birth"
            />

            <Select
              label="Gender"
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              options={[
                { label: 'Select gender', value: '' },
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>

            <Input
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Village"
              value={formData.village}
              onChangeText={(text) => setFormData({ ...formData, village: text })}
              placeholder="Enter village name"
            />

            <Input
              label="District"
              value={formData.district}
              onChangeText={(text) => setFormData({ ...formData, district: text })}
              placeholder="Enter district"
            />

            <Input
              label="State"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              placeholder="Enter state"
            />

            <Input
              label="Pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              placeholder="Enter pincode"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* Farm Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farm Details</Text>

            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <Input
                  label="Farm Size"
                  value={formData.farmSize}
                  onChangeText={(text) => setFormData({ ...formData, farmSize: text })}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputHalf}>
                <Select
                  label="Unit"
                  value={formData.farmSizeUnit}
                  onValueChange={(value) => setFormData({ ...formData, farmSizeUnit: value })}
                  options={[
                    { label: 'Acre', value: 'acre' },
                    { label: 'Hectare', value: 'hectare' },
                  ]}
                />
              </View>
            </View>

            <Input
              label="Soil Type"
              value={formData.soilType}
              onChangeText={(text) => setFormData({ ...formData, soilType: text })}
              placeholder="e.g., Clay, Loamy, Sandy"
            />

            <Input
              label="Irrigation Type"
              value={formData.irrigationType}
              onChangeText={(text) => setFormData({ ...formData, irrigationType: text })}
              placeholder="e.g., Drip, Sprinkler, Canal"
            />
          </View>

          <Button
            label="Save Changes"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
    paddingBottom: spacing.xl,
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
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.surface,
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
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputHalf: {
    flex: 1,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});