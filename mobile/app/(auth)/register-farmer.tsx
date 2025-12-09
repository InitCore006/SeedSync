import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { authAPI } from '@/services/authService';
import { farmersAPI } from '@/services/farmersService';
import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';
import { INDIAN_STATES } from '@/constants/states';
import { getErrorMessage, getErrorTitle, getErrorDescription, logDetailedError } from '@/utils/errorHandler';
import type { FarmerProfileCreateData, UserProfileCreateData } from '@/types/api';

export default function RegisterFarmerScreen() {
  const { login } = useAuthStore();
  const { setProfile } = useFarmerStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Basic Info + OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState('');
  
  // Step 2: Personal Details
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    
    // Address
    village: '',
    district: '',
    state: '',
    pincode: '',
    
    // Farm Details
    total_land_acres: '',
    
    // Location coordinates (auto-populated)
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        phone_number: phoneNumber,
        role: 'farmer',
      });
      
      setUserId(response.data.user_id);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Please check your phone for the verification code');
    } catch (error: any) {
      logDetailedError(error, 'Register Farmer - Send OTP');
      const errorTitle = getErrorTitle(error);
      const errorDescription = getErrorDescription(error);
      
      Alert.alert(
        errorTitle,
        errorDescription,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        phone_number: phoneNumber,
        otp: otp,
        purpose: 'registration',
      });
      
      // Store tokens but don't navigate yet - need to complete profile
      await login(
        response.data.user,
        response.data.tokens.access,
        response.data.tokens.refresh
      );
      
      setStep(2);
      Alert.alert('Success', 'Phone verified! Please complete your profile');
    } catch (error: any) {
      logDetailedError(error, 'Register Farmer - Verify OTP');
      const errorTitle = getErrorTitle(error);
      const errorDescription = getErrorDescription(error);
      
      Alert.alert(
        errorTitle,
        errorDescription,
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    // Validate required fields
    if (!formData.full_name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }

    if (!formData.district.trim() || !formData.state) {
      Alert.alert('Required Fields', 'Please select both district and state');
      return;
    }

    if (!formData.total_land_acres || parseFloat(formData.total_land_acres) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid farmland area greater than 0');
      return;
    }

    setLoading(true);
    try {
      // Fetch coordinates from address using geocoding
      let latitude = null;
      let longitude = null;
      
      try {
        const stateName = INDIAN_STATES.find(s => s.value === formData.state)?.label || formData.state;
        const address = `${formData.village ? formData.village + ', ' : ''}${formData.district}, ${stateName}, ${formData.pincode || ''}`;
        
        console.log('Fetching coordinates for address:', address);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          {
            headers: {
              'User-Agent': 'SeedSync Mobile App'
            }
          }
        );
        
        const data = await response.json();
        if (data && data.length > 0) {
          // Limit to 6 decimal places for precision
          latitude = parseFloat(parseFloat(data[0].lat).toFixed(6));
          longitude = parseFloat(parseFloat(data[0].lon).toFixed(6));
          console.log('Coordinates fetched:', { latitude, longitude });
        } else {
          console.log('No coordinates found for address');
        }
      } catch (geoError) {
        console.log('Geocoding error:', geoError);
        // Continue without coordinates - it's optional
      }

      // Update user profile with address and coordinates
      const userProfileData: Partial<UserProfileCreateData> = {
        district: formData.district.trim(),
        state: formData.state,
        pincode: formData.pincode?.trim() || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      };
      
      await authAPI.updateProfile(userProfileData);

      // Create FarmerProfile (village is farmer-specific)
      const farmerProfileData: FarmerProfileCreateData = {
        full_name: formData.full_name.trim(),
        father_name: formData.father_name?.trim() || undefined,
        total_land_acres: parseFloat(formData.total_land_acres),
        village: formData.village?.trim() || undefined,
        district: formData.district.trim(),
        state: formData.state,
        pincode: formData.pincode?.trim() || '',
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      };

      console.log('Creating farmer profile with data:', farmerProfileData);
      const profileResponse = await farmersAPI.createProfile(farmerProfileData);
      setProfile(profileResponse.data.data || null);

      Alert.alert(
        'Registration Complete! 🎉',
        'Welcome to SeedSync! You can now start listing your produce.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      logDetailedError(error, 'Register Farmer - Complete Registration');
      const errorTitle = getErrorTitle(error);
      const errorDescription = getErrorDescription(error);
      
      Alert.alert(
        errorTitle,
        errorDescription,
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.stepIndicator}>Step 1 of 2</Text>
          <Text style={styles.title}>Farmer Registration</Text>
          <Text style={styles.subtitle}>Enter your phone number to get started</Text>
        </View>
      </View>

      <Input
        label="Phone Number *"
        placeholder="Enter 10-digit phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        maxLength={10}
        editable={!otpSent}
      />

      {otpSent && (
        <Input
          label="OTP *"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
      )}

      {!otpSent ? (
        <Button
          title="Send OTP"
          onPress={handleSendOTP}
          loading={loading}
          style={styles.button}
        />
      ) : (
        <>
          <Button
            title="Verify & Continue"
            onPress={handleVerifyOTP}
            loading={loading}
            style={styles.button}
          />
          {/* <Button
            title="Resend OTP"
            onPress={handleSendOTP}
            variant="outline"
            disabled={loading}
            style={styles.button}
          /> */}
        </>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.stepIndicator}>Step 2 of 2</Text>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Fill in your details to continue</Text>
        </View>
      </View>

      {/* Personal Details Section */}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <Input
        label="Full Name *"
        placeholder="Your full name"
        value={formData.full_name}
        onChangeText={(text) => {
          // Only allow letters and spaces
          const filtered = text.replace(/[^a-zA-Z\s]/g, '');
          setFormData({ ...formData, full_name: filtered });
        }}
        maxLength={100}
      />

      <Input
        label="Father's Name"
        placeholder="Father's name"
        value={formData.father_name}
        onChangeText={(text) => {
          // Only allow letters and spaces
          const filtered = text.replace(/[^a-zA-Z\s]/g, '');
          setFormData({ ...formData, father_name: filtered });
        }}
        maxLength={100}
      />

      {/* Address Section */}
      <Text style={styles.sectionTitle}>Address Details</Text>

      <Input
        label="Village"
        placeholder="Your village name"
        value={formData.village}
        onChangeText={(text) => {
          // Allow letters, spaces, and some special characters
          const filtered = text.replace(/[^a-zA-Z\s\-,.']/g, '');
          setFormData({ ...formData, village: filtered });
        }}
        maxLength={100}
      />

      <Input
        label="District *"
        placeholder="District name"
        value={formData.district}
        onChangeText={(text) => {
          // Only allow letters and spaces
          const filtered = text.replace(/[^a-zA-Z\s]/g, '');
          setFormData({ ...formData, district: filtered });
        }}
        maxLength={50}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>State *</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={formData.state}
            onValueChange={(value) => setFormData({ ...formData, state: value })}
          >
            <Picker.Item label="Select State" value="" />
            {INDIAN_STATES.map((state) => (
              <Picker.Item key={state.value} label={state.label} value={state.value} />
            ))}
          </Picker>
        </View>
      </View>

      <Input
        label="Pincode"
        placeholder="6-digit pincode"
        value={formData.pincode}
        onChangeText={(text) => {
          // Only allow numbers
          const filtered = text.replace(/[^0-9]/g, '');
          setFormData({ ...formData, pincode: filtered });
        }}
        keyboardType="number-pad"
        maxLength={6}
      />

      {/* Farm Details Section */}
      <Text style={styles.sectionTitle}>Farm Information</Text>

      <Input
        label="Total Land (Acres) *"
        placeholder="e.g., 5.5"
        value={formData.total_land_acres}
        onChangeText={(text) => {
          // Only allow numbers and one decimal point
          const filtered = text.replace(/[^0-9.]/g, '');
          // Ensure only one decimal point
          const parts = filtered.split('.');
          const validInput = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filtered;
          setFormData({ ...formData, total_land_acres: validInput });
        }}
        keyboardType="decimal-pad"
        maxLength={10}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Complete Registration"
          onPress={handleCompleteRegistration}
          loading={loading}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {step === 1 ? renderStep1() : renderStep2()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 12,
    marginTop: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  stepIndicator: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  button: {
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: -12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
});
