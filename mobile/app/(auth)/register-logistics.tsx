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
import { logisticsAPI } from '@/services/logisticsService';
import { useAuthStore } from '@/store/authStore';
import { useLogisticsStore } from '@/store/logisticsStore';
import { INDIAN_STATES } from '@/constants/states';

export default function RegisterLogisticsScreen() {
  const { login } = useAuthStore();
  const { setProfile } = useLogisticsStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Basic Info + OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState('');
  
  // Step 2: Company & Personal Details
  const [formData, setFormData] = useState({
    // Personal (UserProfile)
    full_name: '',
    email: '',
    
    // Company Details
    company_name: '',
    gst_number: '',
    transport_license: '',
    
    // Address
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    
    // Service Areas (will be converted to JSON array)
    service_states: '',
    
    // Bank Details
    bank_account_number: '',
    bank_account_holder_name: '',
    bank_ifsc_code: '',
    bank_name: '',
    bank_branch: '',
    
    // Vehicle Details (Optional - can be added later)
    vehicle_type: '',
    vehicle_number: '',
    vehicle_capacity: '',
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
        role: 'logistics',
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
    if (!formData.full_name || !formData.company_name) {
      Alert.alert('Required Fields', 'Please fill in your name and company name');
      return;
    }

    if (!formData.address || !formData.city || !formData.state) {
      Alert.alert('Required Fields', 'Please fill in complete address details');
      return;
    }

    setLoading(true);
    try {
      // Create UserProfile first
      await authAPI.updateProfile({
        full_name: formData.full_name,
        email: formData.email || undefined,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
      });

      // Parse service states into array
      const serviceStatesArray = formData.service_states
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Create LogisticsPartner Profile
      const logisticsProfileData = {
        company_name: formData.company_name,
        gst_number: formData.gst_number || undefined,
        transport_license: formData.transport_license || undefined,
        bank_account_number: formData.bank_account_number || undefined,
        bank_account_holder_name: formData.bank_account_holder_name || undefined,
        bank_ifsc_code: formData.bank_ifsc_code || undefined,
        bank_name: formData.bank_name || undefined,
        bank_branch: formData.bank_branch || undefined,
        service_states: serviceStatesArray.length > 0 ? serviceStatesArray : undefined,
      };

      const profileResponse = await logisticsAPI.createProfile(logisticsProfileData);
      setProfile(profileResponse.data);

      // If vehicle details provided, add vehicle
      if (formData.vehicle_number && formData.vehicle_type) {
        try {
          await logisticsAPI.addVehicle({
            vehicle_number: formData.vehicle_number,
            vehicle_type: formData.vehicle_type,
            capacity_tonnes: formData.vehicle_capacity ? 
              parseFloat(formData.vehicle_capacity) : undefined,
          });
        } catch (vehicleError) {
          console.warn('Vehicle creation failed, but registration succeeded:', vehicleError);
        }
      }

      Alert.alert(
        'Registration Complete! 🎉',
        'Welcome to SeedSync! You can now start accepting transport requests.',
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
          <Text style={styles.title}>Logistics Partner Registration</Text>
          <Text style={styles.subtitle}>Join our transport network</Text>
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
          <Text style={styles.subtitle}>Provide your business details</Text>
        </View>
      </View>

      {/* Personal Details Section */}
      <Text style={styles.sectionTitle}>Contact Person</Text>
      
      <Input
        label="Full Name *"
        placeholder="Your full name"
        value={formData.full_name}
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
        icon="person-outline"
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

      {/* Company Details Section */}
      <Text style={styles.sectionTitle}>Company Information</Text>

      <Input
        label="Company Name *"
        placeholder="Your company/business name"
        value={formData.company_name}
        onChangeText={(text) => setFormData({ ...formData, company_name: text })}
        icon="business-outline"
      />

      <Input
        label="GST Number (Optional)"
        placeholder="15-character GSTIN"
        value={formData.gst_number}
        onChangeText={(text) => setFormData({ ...formData, gst_number: text.toUpperCase() })}
        maxLength={15}
        autoCapitalize="characters"
      />

      <Input
        label="Transport License (Optional)"
        placeholder="License number"
        value={formData.transport_license}
        onChangeText={(text) => setFormData({ ...formData, transport_license: text })}
      />

      {/* Address Section */}
      <Text style={styles.sectionTitle}>Business Address</Text>

      <Input
        label="Complete Address *"
        placeholder="Building, street, area"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
        multiline
        numberOfLines={3}
        icon="location-outline"
      />

      <Input
        label="City *"
        placeholder="City name"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />

      <Input
        label="District"
        placeholder="District name"
        value={formData.district}
        onChangeText={(text) => setFormData({ ...formData, district: text })}
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

      {/* Service Areas Section */}
      <Text style={styles.sectionTitle}>Service Coverage</Text>

      <Input
        label="Service States (Optional)"
        placeholder="Enter states separated by commas (e.g., Punjab, Haryana)"
        value={formData.service_states}
        onChangeText={(text) => setFormData({ ...formData, service_states: text })}
        multiline
        numberOfLines={2}
      />
      <Text style={styles.hint}>States where you provide transport services</Text>

      {/* Bank Details Section */}
      <Text style={styles.sectionTitle}>Bank Details (Optional)</Text>
      <Text style={styles.sectionHint}>Required for receiving payments</Text>

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
        value={formData.bank_ifsc_code}
        onChangeText={(text) => setFormData({ ...formData, bank_ifsc_code: text.toUpperCase() })}
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

      {/* Vehicle Details Section */}
      <Text style={styles.sectionTitle}>First Vehicle (Optional)</Text>
      <Text style={styles.sectionHint}>You can add more vehicles later from your profile</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={formData.vehicle_type}
            onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
          >
            <Picker.Item label="Select Type" value="" />
            <Picker.Item label="Truck" value="truck" />
            <Picker.Item label="Tempo" value="tempo" />
            <Picker.Item label="Mini Truck" value="mini_truck" />
            <Picker.Item label="Container" value="container" />
            <Picker.Item label="Tractor" value="tractor" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <Input
        label="Vehicle Number"
        placeholder="e.g., PB01AB1234"
        value={formData.vehicle_number}
        onChangeText={(text) => setFormData({ ...formData, vehicle_number: text.toUpperCase() })}
        autoCapitalize="characters"
        icon="car-outline"
      />

      <Input
        label="Capacity (Tonnes)"
        placeholder="e.g., 10"
        value={formData.vehicle_capacity}
        onChangeText={(text) => setFormData({ ...formData, vehicle_capacity: text })}
        keyboardType="decimal-pad"
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
  hint: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: -12,
    marginBottom: 16,
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
