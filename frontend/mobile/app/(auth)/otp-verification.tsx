import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius } from '@lib/constants/spacing';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && index === OTP_LENGTH - 1) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsLoading(true);
    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to registration
      router.push('/(auth)/register');
    } catch (error) {
      console.error('OTP verification error:', error);
      // Reset OTP on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // Simulate resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset timer
      setTimer(30);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary[500]} />
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.description}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text.replace(/[^0-9]/g, ''), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Verify Button */}
        <Button
          title="Verify OTP"
          onPress={() => handleVerify(otp.join(''))}
          loading={isLoading}
          disabled={otp.some((digit) => digit === '')}
          style={styles.verifyButton}
        />

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in <Text style={styles.timerCount}>{timer}s</Text>
            </Text>
          )}
        </View>
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
  phoneNumber: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary[500],
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    backgroundColor: colors.background.default,
  },
  otpInputFilled: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  verifyButton: {
    marginBottom: spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary[500],
  },
  timerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  timerCount: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary[500],
  },
});