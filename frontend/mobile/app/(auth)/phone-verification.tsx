import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useRegistrationStore } from '@/store/registrationStore';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const { verifyPhone, isLoading, clearError } = useRegistrationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

 const onSubmit = async (data: PhoneFormData) => {
  clearError();
  
  try {
    // 🔥 SIMULATED OTP FOR DEVELOPMENT - Remove in production
    const simulatedOTP = '123456';
    
    // Show simulated OTP to user
    Alert.alert(
      '📱 OTP Sent (Simulated)',
      `Your verification code is: ${simulatedOTP}\n\nFor testing purposes, the OTP is shown here. In production, it will be sent via SMS.`,
      [
        {
          text: 'OK, Continue',
          onPress: () => {
            // Navigate to OTP verification with simulated OTP
            router.push({
              pathname: '/(auth)/otp-verification',
              params: { 
                phoneNumber: data.phoneNumber,
                simulatedOTP: simulatedOTP, // Pass simulated OTP for testing
              },
            });
          },
        },
      ]
    );

    // Still call the backend API for consistency (it will generate OTP on server)
    // but we're using simulated one for testing
    await verifyPhone({ phone_number: data.phoneNumber });
    
  } catch (error: any) {
    Alert.alert(
      'Error', 
      error.response?.data?.detail || 'Failed to send OTP. Please try again.'
    );
  }
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait-outline" size={48} color={colors.primary[500]} />
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Enter Phone Number</Text>
          <Text style={styles.description}>
            We ll send you a verification code to confirm your phone number
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="Enter 10-digit mobile number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  keyboardType="phone-pad"
                  maxLength={10}
                  leftIcon="call-outline"
                  autoFocus
                />
              )}
            />

            <Button
              title="Send OTP"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary[500],
  },
});