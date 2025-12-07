import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader, Sidebar, Input, Button, Picker } from '@/components';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { farmersAPI } from '@/services/farmersService';
import { logisticsAPI } from '@/services/logisticsService';

const GENDER_OPTIONS = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Other', value: 'O' },
];

const VEHICLE_TYPES = [
  { label: 'Select Vehicle Type', value: '' },
  { label: 'Truck', value: 'truck' },
  { label: 'Van', value: 'van' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'Tractor', value: 'tractor' },
];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';

  // Common fields
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    
    // Address fields
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    district: '',
    village: '',
    tehsil: '',
    
    // Bank details (for farmers)
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_account_holder_name: '',
    bank_name: '',
    bank_branch: '',
    
    // Farmer specific
    father_name: '',
    total_land_acres: '',
    farming_experience_years: '',
    aadhaar_number: '',
    pan_number: '',
    
    // Company details (for logistics)
    company_name: '',
    company_registration_number: '',
    gst_number: '',
  });

  // Fetch complete profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setFetchingProfile(true);
      
      if (isFarmer) {
        const response = await farmersAPI.getMyProfile();
        const profile = response.data;
        
        setFormData({
          full_name: profile.full_name || '',
          date_of_birth: profile.date_of_birth || '',
          gender: profile.gender || '',
          address_line1: '',
          address_line2: '',
          city: profile.district || '',
          state: profile.state || '',
          postal_code: profile.pincode || '',
          district: profile.district || '',
          village: profile.village || '',
          tehsil: profile.tehsil || '',
          bank_account_number: profile.bank_account_number || '',
          bank_ifsc_code: profile.ifsc_code || '',
          bank_account_holder_name: profile.bank_account_holder_name || '',
          bank_name: profile.bank_name || '',
          bank_branch: profile.bank_branch || '',
          father_name: profile.father_name || '',
          total_land_acres: profile.total_land_acres?.toString() || '',
          farming_experience_years: profile.farming_experience_years?.toString() || '',
          aadhaar_number: profile.aadhaar_number || '',
          pan_number: profile.pan_number || '',
          company_name: '',
          company_registration_number: '',
          gst_number: '',
        });
        setProfilePhoto(profile.profile_photo || null);
      } else if (isLogistics) {
        const response = await logisticsAPI.getMyProfile();
        const profile = response.data;
        
        setFormData({
          full_name: profile.user.profile?.full_name || '',
          date_of_birth: '',
          gender: '',
          address_line1: '',
          address_line2: '',
          city: profile.city || '',
          state: profile.state || '',
          postal_code: '',
          district: '',
          village: '',
          tehsil: '',
          bank_account_number: '',
          bank_ifsc_code: '',
          bank_account_holder_name: '',
          bank_name: '',
          bank_branch: '',
          father_name: '',
          total_land_acres: '',
          farming_experience_years: '',
          aadhaar_number: '',
          pan_number: '',
          company_name: profile.company_name || '',
          company_registration_number: '',
          gst_number: '',
        });
        setProfilePhoto(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setFetchingProfile(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }

    if (isFarmer) {
      // Validate bank details if provided
      if (formData.bank_account_number && !formData.bank_ifsc_code) {
        Alert.alert('Validation Error', 'Please enter IFSC code');
        return false;
      }
      if (formData.bank_ifsc_code && !formData.bank_account_number) {
        Alert.alert('Validation Error', 'Please enter account number');
        return false;
      }
    }

    if (isLogistics) {
      if (!formData.company_name.trim()) {
        Alert.alert('Validation Error', 'Please enter company name');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formDataToSubmit = new FormData();

      // Add common fields
      formDataToSubmit.append('full_name', formData.full_name);
      if (formData.date_of_birth) formDataToSubmit.append('date_of_birth', formData.date_of_birth);
      if (formData.gender) formDataToSubmit.append('gender', formData.gender);

      // Add address fields
      if (formData.address_line1) formDataToSubmit.append('address_line1', formData.address_line1);
      if (formData.address_line2) formDataToSubmit.append('address_line2', formData.address_line2);
      if (formData.city) formDataToSubmit.append('city', formData.city);
      if (formData.state) formDataToSubmit.append('state', formData.state);
      if (formData.postal_code) formDataToSubmit.append('postal_code', formData.postal_code);

      // Add profile photo if changed
      if (profilePhoto && profilePhoto.startsWith('file://')) {
        const filename = profilePhoto.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formDataToSubmit.append('profile_photo', {
          uri: profilePhoto,
          name: filename,
          type,
        } as any);
      }

      // Add role-specific fields
      if (isFarmer) {
        // Farmer specific fields
        if (formData.father_name) formDataToSubmit.append('father_name', formData.father_name);
        if (formData.total_land_acres) formDataToSubmit.append('total_land_acres', formData.total_land_acres);
        if (formData.farming_experience_years) formDataToSubmit.append('farming_experience_years', formData.farming_experience_years);
        if (formData.village) formDataToSubmit.append('village', formData.village);
        if (formData.tehsil) formDataToSubmit.append('tehsil', formData.tehsil);
        if (formData.district) formDataToSubmit.append('district', formData.district);
        if (formData.postal_code) formDataToSubmit.append('pincode', formData.postal_code);
        
        // Bank details
        if (formData.bank_account_number) {
          formDataToSubmit.append('bank_account_number', formData.bank_account_number);
          formDataToSubmit.append('ifsc_code', formData.bank_ifsc_code);
          formDataToSubmit.append('bank_account_holder_name', formData.bank_account_holder_name || formData.full_name);
          if (formData.bank_name) formDataToSubmit.append('bank_name', formData.bank_name);
          if (formData.bank_branch) formDataToSubmit.append('bank_branch', formData.bank_branch);
        }
        
        // KYC fields
        if (formData.aadhaar_number) formDataToSubmit.append('aadhaar_number', formData.aadhaar_number);
        if (formData.pan_number) formDataToSubmit.append('pan_number', formData.pan_number);

        const response = await farmersAPI.getMyProfile();
        await farmersAPI.updateProfile(response.data.id.toString(), formDataToSubmit);
      } else if (isLogistics) {
        formDataToSubmit.append('company_name', formData.company_name);
        formDataToSubmit.append('contact_person_name', formData.full_name);
        if (formData.company_registration_number) {
          formDataToSubmit.append('company_registration_number', formData.company_registration_number);
        }
        if (formData.gst_number) formDataToSubmit.append('gst_number', formData.gst_number);
        if (formData.city) formDataToSubmit.append('city', formData.city);
        if (formData.state) formDataToSubmit.append('state', formData.state);

        const response = await logisticsAPI.getMyProfile();
        await logisticsAPI.updateProfile(response.data.id.toString(), formDataToSubmit);
      }

      // Refresh user data
      // await updateUser(); // Uncomment when auth store has this method

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        title="Edit Profile"
        onMenuPress={() => setSidebarVisible(true)}
        showBackButton
        onBackPress={() => router.back()}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      
      {fetchingProfile ? (
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Profile Photo */}
                <View style={styles.photoSection}>
                <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                    {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.photo} />
                    ) : (
                    <View style={[styles.photo, styles.photoPlaceholder]}>
                        <Ionicons name="person" size={48} color={COLORS.text.secondary} />
                    </View>
                    )}
                    <View style={styles.photoOverlay}>
                    <Ionicons name="camera" size={24} color={COLORS.white} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.photoHint}>Tap to change photo</Text>
                </View>

                {/* Common Fields */}
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <Input
                    label="Full Name *"
                    value={formData.full_name}
                    onChangeText={value => setFormData(prev => ({ ...prev, full_name: value }))}
                    placeholder="Enter your full name"
                />

                <Input
                    label="Date of Birth"
                    value={formData.date_of_birth}
                    onChangeText={value => setFormData(prev => ({ ...prev, date_of_birth: value }))}
                    placeholder="YYYY-MM-DD"
                />

                <Picker
                    label="Gender"
                    options={GENDER_OPTIONS}
                    value={formData.gender}
                    onValueChange={value => setFormData(prev => ({ ...prev, gender: value }))}
                />
                </View>

                {/* Address Section */}
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>
                
                <Input
                    label="Address Line 1"
                    value={formData.address_line1}
                    onChangeText={value => setFormData(prev => ({ ...prev, address_line1: value }))}
                    placeholder="Street address"
                />

                <Input
                    label="Address Line 2"
                    value={formData.address_line2}
                    onChangeText={value => setFormData(prev => ({ ...prev, address_line2: value }))}
                    placeholder="Apartment, suite, etc."
                />

                <Input
                    label="City"
                    value={formData.city}
                    onChangeText={value => setFormData(prev => ({ ...prev, city: value }))}
                    placeholder="City"
                />

                <Input
                    label="State"
                    value={formData.state}
                    onChangeText={value => setFormData(prev => ({ ...prev, state: value }))}
                    placeholder="State"
                />

                <Input
                    label="Postal Code"
                    value={formData.postal_code}
                    onChangeText={value => setFormData(prev => ({ ...prev, postal_code: value }))}
                    placeholder="Postal code"
                    keyboardType="numeric"
                />
                </View>

                {/* Farmer-specific Fields */}
                {isFarmer && (
                <>
                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Farmer Details</Text>
                    
                    <Input
                        label="Father's Name"
                        value={formData.father_name}
                        onChangeText={value => setFormData(prev => ({ ...prev, father_name: value }))}
                        placeholder="Enter father's name"
                    />

                    <Input
                        label="Total Land (Acres)"
                        value={formData.total_land_acres}
                        onChangeText={value => setFormData(prev => ({ ...prev, total_land_acres: value }))}
                        placeholder="Total farmland in acres"
                        keyboardType="numeric"
                    />

                    <Input
                        label="Farming Experience (Years)"
                        value={formData.farming_experience_years}
                        onChangeText={value => setFormData(prev => ({ ...prev, farming_experience_years: value }))}
                        placeholder="Years of experience"
                        keyboardType="numeric"
                    />

                    <Input
                        label="Village"
                        value={formData.village}
                        onChangeText={value => setFormData(prev => ({ ...prev, village: value }))}
                        placeholder="Village name"
                    />

                    <Input
                        label="Tehsil"
                        value={formData.tehsil}
                        onChangeText={value => setFormData(prev => ({ ...prev, tehsil: value }))}
                        placeholder="Tehsil/Taluka"
                    />

                    <Input
                        label="District"
                        value={formData.district}
                        onChangeText={value => setFormData(prev => ({ ...prev, district: value }))}
                        placeholder="District"
                    />
                    </View>

                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>KYC Details</Text>
                    
                    <Input
                        label="Aadhaar Number"
                        value={formData.aadhaar_number}
                        onChangeText={value => setFormData(prev => ({ ...prev, aadhaar_number: value }))}
                        placeholder="12-digit Aadhaar number"
                        keyboardType="numeric"
                        maxLength={12}
                    />

                    <Input
                        label="PAN Number"
                        value={formData.pan_number}
                        onChangeText={value => setFormData(prev => ({ ...prev, pan_number: value.toUpperCase() }))}
                        placeholder="PAN number"
                        autoCapitalize="characters"
                        maxLength={10}
                    />
                    </View>

                    <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Details</Text>
                    <Text style={styles.sectionSubtitle}>
                        Add your bank details to receive payments
                    </Text>

                    <Input
                        label="Bank Account Number"
                        value={formData.bank_account_number}
                        onChangeText={value => setFormData(prev => ({ ...prev, bank_account_number: value }))}
                        placeholder="Enter account number"
                        keyboardType="numeric"
                    />

                    <Input
                        label="IFSC Code"
                        value={formData.bank_ifsc_code}
                        onChangeText={value => setFormData(prev => ({ ...prev, bank_ifsc_code: value.toUpperCase() }))}
                        placeholder="Enter IFSC code"
                        autoCapitalize="characters"
                    />

                    <Input
                        label="Account Holder Name"
                        value={formData.bank_account_holder_name}
                        onChangeText={value => setFormData(prev => ({ ...prev, bank_account_holder_name: value }))}
                        placeholder="As per bank records"
                    />

                    <Input
                        label="Bank Name"
                        value={formData.bank_name}
                        onChangeText={value => setFormData(prev => ({ ...prev, bank_name: value }))}
                        placeholder="e.g., State Bank of India"
                    />

                    <Input
                        label="Bank Branch"
                        value={formData.bank_branch}
                        onChangeText={value => setFormData(prev => ({ ...prev, bank_branch: value }))}
                        placeholder="Branch name"
                    />
                    </View>
                </>
                )}

                {/* Logistics-specific Fields */}
                {isLogistics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Company Details</Text>

                    <Input
                    label="Company Name *"
                    value={formData.company_name}
                    onChangeText={value => setFormData(prev => ({ ...prev, company_name: value }))}
                    placeholder="Enter company name"
                    />

                    <Input
                    label="Registration Number"
                    value={formData.company_registration_number}
                    onChangeText={value => setFormData(prev => ({ ...prev, company_registration_number: value }))}
                    placeholder="Company registration number"
                    />

                    <Input
                    label="GST Number"
                    value={formData.gst_number}
                    onChangeText={value => setFormData(prev => ({ ...prev, gst_number: value.toUpperCase() }))}
                    placeholder="Enter GST number"
                    autoCapitalize="characters"
                    />
                </View>
                )}

                {/* Submit Button */}
                <Button
                title={loading ? 'Saving...' : 'Save Changes'}
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
                />
            </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: 16,
    gap: 24,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  photoHint: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
     