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
    gender: 'male',
    date_of_birth: '',
    email: '',
    
    // Address
    address: '',
    village: '',
    post_office: '',
    tehsil: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    
    // Farm Details
    total_land_acres: '',
    farming_experience_years: '',
    
    // Bank Details
    bank_account_number: '',
    bank_account_holder_name: '',
    ifsc_code: '',
    bank_name: '',
    bank_branch: '',
    
    // KYC (Optional)
    aadhaar_number: '',
    pan_number: '',
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
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      'Failed to send OTP';
      Alert.alert('Error', errorMsg);
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
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      'Invalid OTP';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    // Validate required fields
    if (!formData.full_name || !formData.district || !formData.state) {
      Alert.alert('Required Fields', 'Please fill in full name, district, and state');
      return;
    }

    if (!formData.total_land_acres) {
      Alert.alert('Required Field', 'Please enter your total farmland area');
      return;
    }

    setLoading(true);
    try {
      // Create UserProfile first
      await authAPI.updateProfile({
        full_name: formData.full_name,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        aadhaar_number: formData.aadhaar_number || undefined,
        pan_number: formData.pan_number || undefined,
      });

      // Create FarmerProfile
      const farmerProfileData = {
        full_name: formData.full_name,
        father_name: formData.father_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || undefined,
        total_land_acres: parseFloat(formData.total_land_acres),
        farming_experience_years: formData.farming_experience_years ? 
          parseInt(formData.farming_experience_years) : 0,
        village: formData.village,
        tehsil: formData.tehsil,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        post_office: formData.post_office,
        bank_account_number: formData.bank_account_number,
        bank_account_holder_name: formData.bank_account_holder_name,
        ifsc_code: formData.ifsc_code,
        bank_name: formData.bank_name,
        bank_branch: formData.bank_branch,
        aadhaar_number: formData.aadhaar_number || undefined,
        pan_number: formData.pan_number || undefined,
      };

      const profileResponse = await farmersAPI.createProfile(farmerProfileData);
      setProfile(profileResponse.data);

      Alert.alert(
        'Registration Complete! 🎉',
        'Welcome to SeedSync! You can now start listing your produce.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message ||
                      JSON.stringify(error.response?.data) ||
                      'Failed to complete registration';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.stepIndicator}>Step 1 of 2</Text>
          <Text style={styles.title}>Farmer Registration</Text>
          <Text style={styles.subtitle}>Enter your phone number to get started</Text>
        </View>
      </View>

      <Input
        label="Phone Number *"
        placeholder="10-digit mobile number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        maxLength={10}
        editable={!otpSent}
        icon="call-outline"
      />

      {otpSent && (
        <Input
          label="OTP *"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          icon="shield-checkmark-outline"
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
          <Button
            title="Resend OTP"
            onPress={handleSendOTP}
            variant="outline"
            disabled={loading}
            style={styles.button}
          />
        </>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
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
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
        icon="person-outline"
      />

      <Input
        label="Father's Name"
        placeholder="Father's name"
        value={formData.father_name}
        onChangeText={(text) => setFormData({ ...formData, father_name: text })}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <Input
        label="Date of Birth (YYYY-MM-DD)"
        placeholder="1990-01-15"
        value={formData.date_of_birth}
        onChangeText={(text) => setFormData({ ...formData, date_of_birth: text })}
        icon="calendar-outline"
      />

      <Input
        label="Email (Optional)"
        placeholder="your.email@example.com"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail-outline"
      />

      {/* Address Section */}
      <Text style={styles.sectionTitle}>Address Details</Text>

      <Input
        label="Village"
        placeholder="Your village name"
        value={formData.village}
        onChangeText={(text) => setFormData({ ...formData, village: text })}
      />

      <Input
        label="Post Office"
        placeholder="Post office name"
        value={formData.post_office}
        onChangeText={(text) => setFormData({ ...formData, post_office: text })}
      />

      <Input
        label="Tehsil"
        placeholder="Tehsil/Taluka name"
        value={formData.tehsil}
        onChangeText={(text) => setFormData({ ...formData, tehsil: text })}
      />

      <Input
        label="City"
        placeholder="City name"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />

      <Input
        label="District *"
        placeholder="District name"
        value={formData.district}
        onChangeText={(text) => setFormData({ ...formData, district: text })}
        icon="location-outline"
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
        onChangeText={(text) => setFormData({ ...formData, pincode: text })}
        keyboardType="number-pad"
        maxLength={6}
      />

      <Input
        label="Complete Address"
        placeholder="House number, street, landmark"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
        multiline
        numberOfLines={3}
      />

      {/* Farm Details Section */}
      <Text style={styles.sectionTitle}>Farm Information</Text>

      <Input
        label="Total Land (Acres) *"
        placeholder="e.g., 5.5"
        value={formData.total_land_acres}
        onChangeText={(text) => setFormData({ ...formData, total_land_acres: text })}
        keyboardType="decimal-pad"
        icon="leaf-outline"
      />

      <Input
        label="Farming Experience (Years)"
        placeholder="e.g., 10"
        value={formData.farming_experience_years}
        onChangeText={(text) => setFormData({ ...formData, farming_experience_years: text })}
        keyboardType="number-pad"
      />

      {/* Bank Details Section */}
      <Text style={styles.sectionTitle}>Bank Details (Optional)</Text>

      <Input
        label="Account Holder Name"
        placeholder="Name as per bank account"
        value={formData.bank_account_holder_name}
        onChangeText={(text) => setFormData({ ...formData, bank_account_holder_name: text })}
      />

      <Input
        label="Account Number"
        placeholder="Bank account number"
        value={formData.bank_account_number}
        onChangeText={(text) => setFormData({ ...formData, bank_account_number: text })}
        keyboardType="number-pad"
        icon="card-outline"
      />

      <Input
        label="IFSC Code"
        placeholder="11-character IFSC code"
        value={formData.ifsc_code}
        onChangeText={(text) => setFormData({ ...formData, ifsc_code: text.toUpperCase() })}
        maxLength={11}
        autoCapitalize="characters"
      />

      <Input
        label="Bank Name"
        placeholder="e.g., State Bank of India"
        value={formData.bank_name}
        onChangeText={(text) => setFormData({ ...formData, bank_name: text })}
      />

      <Input
        label="Branch Name"
        placeholder="Branch location"
        value={formData.bank_branch}
        onChangeText={(text) => setFormData({ ...formData, bank_branch: text })}
      />

      {/* KYC Section */}
      <Text style={styles.sectionTitle}>KYC Details (Optional)</Text>
      <Text style={styles.sectionHint}>You can add these later from your profile</Text>

      <Input
        label="Aadhaar Number"
        placeholder="12-digit Aadhaar number"
        value={formData.aadhaar_number}
        onChangeText={(text) => setFormData({ ...formData, aadhaar_number: text })}
        keyboardType="number-pad"
        maxLength={12}
      />

      <Input
        label="PAN Number"
        placeholder="10-character PAN (e.g., ABCDE1234F)"
        value={formData.pan_number}
        onChangeText={(text) => setFormData({ ...formData, pan_number: text.toUpperCase() })}
        maxLength={10}
        autoCapitalize="characters"
      />

      <Button
        title="Complete Registration"
        onPress={handleCompleteRegistration}
        loading={loading}
        style={styles.button}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
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
    color: COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  button: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
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
    color: COLORS.dark,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
});
