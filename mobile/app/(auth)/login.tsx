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

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerSection}>
            <Text style={styles.registerTitle}>New User?</Text>
            <Text style={styles.registerSubtitle}>Register as:</Text>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/register-farmer')}
            >
              <View style={styles.registerButtonIcon}>
                <Text style={styles.registerButtonEmoji}>🌾</Text>
              </View>
              <View style={styles.registerButtonContent}>
                <Text style={styles.registerButtonTitle}>Farmer</Text>
                <Text style={styles.registerButtonSubtitle}>Sell your produce directly</Text>
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/(auth)/register-logistics')}
            >
              <View style={styles.registerButtonIcon}>
                <Text style={styles.registerButtonEmoji}>🚚</Text>
              </View>
              <View style={styles.registerButtonContent}>
                <Text style={styles.registerButtonTitle}>Logistics Partner</Text>
                <Text style={styles.registerButtonSubtitle}>Transport agricultural products</Text>
              </View>
            </TouchableOpacity> */}
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  registerSection: {
    marginTop: 8,
  },
  registerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  registerSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  registerButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  registerButtonEmoji: {
    fontSize: 28,
  },
  registerButtonContent: {
    flex: 1,
  },
  registerButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  registerButtonSubtitle: {
    fontSize: 13,
    color: COLORS.secondary,
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
