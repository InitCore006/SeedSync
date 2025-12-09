import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { authAPI } from '@/services/authService';
import { farmersAPI } from '@/services/farmersService';
import { logisticsAPI } from '@/services/logisticsService';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, getErrorTitle, getErrorDescription, logDetailedError } from '@/utils/errorHandler';
import { UserProfileCreateData, FarmerProfileCreateData, LogisticsPartnerCreateData } from '@/types/api';

export default function VerifyOTPScreen() {
  const { phone, type, role, user_id, profile_data } = useLocalSearchParams<{ 
    phone: string; 
    type: string;
    role?: string;
    user_id?: string;
    profile_data?: string;
  }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const { login } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]); // Re-run effect when timer changes (for reset)

  const createProfile = async (accessToken: string) => {
    if (!profile_data || !role) return;

    try {
      const data = JSON.parse(profile_data);
      console.log('Creating profiles for role:', role);
      console.log('Profile data:', data);

      // Step 1: Update UserProfile (backend creates it during registration, we just update it)
      const userProfileData: UserProfileCreateData = {
        full_name: data.full_name,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
      };

      console.log('Updating UserProfile...');
      await authAPI.updateProfile(userProfileData);
      console.log('UserProfile updated successfully');

      // Step 2: Create role-specific profile
      if (role === 'farmer') {
        const farmerProfileData: FarmerProfileCreateData = {
          full_name: data.full_name,
          father_name: data.father_name,
          total_land_acres: data.total_land_acres,
          village: data.village,
          district: data.district,
          state: data.state,
          pincode: data.pincode,
        };

        console.log('Creating FarmerProfile...');
        await farmersAPI.createProfile(farmerProfileData);
        console.log('FarmerProfile created successfully');

      } else if (role === 'logistics') {
        // Create logistics partner profile
        const logisticsProfileData: LogisticsPartnerCreateData = {
          company_name: data.company_name,
          contact_person: data.contact_person,
          phone: phone,
          address: `${data.city}, ${data.state}`,
          city: data.city,
          state: data.state,
        };

        console.log('Creating LogisticsPartner...');
        await logisticsAPI.createProfile(logisticsProfileData);
        console.log('LogisticsPartner created successfully');

        // Create vehicle
        console.log('Registering vehicle...');
        await logisticsAPI.addVehicle({
          vehicle_number: data.vehicle_number,
          vehicle_type: data.vehicle_type,
          capacity_quintals: data.capacity_quintals,
        });
        console.log('Vehicle registered successfully');
      }
    } catch (error: any) {
      console.log('Profile creation error:', error.response?.data || error.message);
      logDetailedError(error, 'Profile Creation');
      // Don't fail registration if profile creation fails
      // User can complete profile later
      Alert.alert(
        'Profile Setup',
        'Your account was created but profile setup encountered an issue. You can complete your profile from settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    console.log('\n=== OTP VERIFICATION ===');
    console.log('Phone:', phone);
    console.log('Type:', type);
    console.log('OTP Length:', otp.length);

    setLoading(true);
    try {
      const purpose = type === 'register' ? 'registration' : 'login';
      
      console.log(`Verifying OTP for ${purpose}...`);
      const response = await authAPI.verifyOTP({ 
        phone_number: phone, 
        otp,
        purpose 
      });
      console.log('OTP verified successfully');
      
      const { user, tokens } = response.data;
      console.log('User:', user.phone_number, '-', user.role_display);
      
      if (tokens) {
        // Login first
        await login(user, tokens.access, tokens.refresh);
        console.log('Auto-logged in after verification');

        // Create profile only for registration
        if (type === 'register') {
          await createProfile(tokens.access);
        }
        
        console.log('Navigating to main app...');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Success', 'Verification successful! Please login.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
      }
    } catch (error: any) {
      logDetailedError(error, `Verify OTP - ${type === 'register' ? 'Registration' : 'Login'}`);
      const errorTitle = getErrorTitle(error);
      const errorDescription = getErrorDescription(error);
      
      console.log('Error:', errorTitle);
      console.log('Description:', errorDescription);
      
      // Clear OTP field on error so user can enter new one
      setOtp('');
      
      Alert.alert(
        errorTitle,
        errorDescription,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    console.log('\n=== RESEND OTP ===');
    console.log('Phone:', phone);
    console.log('Type:', type);
    
    setResending(true);
    try {
      // Determine the purpose based on type
      const purpose = type === 'register' ? 'registration' : 'login';
      
      console.log(`Sending OTP for ${purpose}...`);
      console.log('Full phone number being sent:', phone);
      
      // Use sendOTP with explicit purpose parameter for both cases
      const response = await authAPI.sendOTP(phone, purpose);
      
      console.log('✅ OTP resent successfully');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
      
      Alert.alert(
        'OTP Sent',
        `A new verification code has been sent to +91 ${phone}`,
        [{ text: 'OK', style: 'default' }]
      );
      
      // Reset timer
      setTimer(60);
    } catch (error: any) {
      logDetailedError(error, 'Verify OTP - Resend OTP');
      const errorTitle = getErrorTitle(error);
      const errorDescription = getErrorDescription(error);
      
      console.log('❌ Resend OTP failed');
      console.log('Error:', errorTitle);
      console.log('Description:', errorDescription);
      
      Alert.alert(
        errorTitle,
        errorDescription,
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phone}>+91 {phone}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="OTP Code"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in {timer}s
              </Text>
            ) : (
              <Button
                title="Resend OTP"
                onPress={handleResendOTP}
                loading={resending}
                variant="outline"
              />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  phone: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});
