import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { authAPI } from '@/services/authService';
import { getErrorMessage, getErrorTitle, logDetailedError } from '@/utils/errorHandler';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    console.log('\n📱 === LOGIN ATTEMPT ===');
    console.log('📱 Phone:', phoneNumber);
    
    setLoading(true);
    try {
      console.log('🔄 Sending OTP for login...');
      const response = await authAPI.sendLoginOTP(phoneNumber);
      
      console.log('✅ OTP sent successfully');
      console.log('📄 Response:', JSON.stringify(response.data, null, 2));
      
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: phoneNumber, type: 'login' },
      });
    } catch (error: any) {
      logDetailedError(error, 'Login Screen - Send OTP');
      const errorTitle = getErrorTitle(error);
      const errorMessage = getErrorMessage(error);
      
      console.log('❌ Showing error alert:', errorTitle, '-', errorMessage);
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🌾</Text>
          <Text style={styles.title}>SeedSync</Text>
          <Text style={styles.subtitle}>
            Connecting farmers to better markets
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Button
            title="Send OTP"
            onPress={handleSendOTP}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Button
              title="Register"
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
              size="small"
            />
          </View>
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
});
