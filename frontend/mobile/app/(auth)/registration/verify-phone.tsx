import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegistrationStore } from '@/store/registrationStore';
import { validatePhone, cleanPhoneNumber } from '@/lib/utils/validation';
import { colors, withOpacity } from '@/lib/constants/colors';

export default function VerifyPhoneScreen() {
  const { sendOTP, isLoading } = useRegistrationStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    Keyboard.dismiss();
    setError('');

    const cleaned = cleanPhoneNumber(phoneNumber);

    if (!cleaned) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(cleaned)) {
      setError('Invalid phone number. Enter 10 digits starting with 6-9');
      return;
    }

    try {
      await sendOTP(cleaned);
      router.push('/(auth)/registration/verify-otp');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP';
      Alert.alert('Error', errorMsg, [{ text: 'OK' }]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number to receive a verification code
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={[styles.inputContainer, error && styles.inputError]}>
                <View style={styles.prefixContainer}>
                  <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.prefix}>+91</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  placeholderTextColor={colors.text.disabled}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    setError('');
                  }}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendOTP}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.sendButtonText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                You'll receive a 6-digit OTP on this number
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made by InitCore Developer's Group
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    minHeight: 56,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: withOpacity(colors.error, 0.05),
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefix: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginLeft: 4,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 24,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: withOpacity(colors.primary, 0.1),
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.text.disabled,
  },
});