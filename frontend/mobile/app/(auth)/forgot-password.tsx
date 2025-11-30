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
import { authService } from '@/services/auth.service';
import { validatePhone, cleanPhoneNumber } from '@/lib/utils/validation';
import { colors, withOpacity } from '@/lib/constants/colors';

type Step = 'phone' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = React.useRef<(TextInput | null)[]>([]);

  // ============================================================================
  // STEP 1: SEND OTP
  // ============================================================================

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

    setIsLoading(true);

    try {
      await authService.requestPasswordReset({ phone_number: cleaned });
      setStep('otp');
      Alert.alert('Success', 'OTP sent to your phone number', [{ text: 'OK' }]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP';
      setError(errorMsg);
      Alert.alert('Error', errorMsg, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // STEP 2: VERIFY OTP
  // ============================================================================

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setStep('password');
  };

  // ============================================================================
  // STEP 3: RESET PASSWORD
  // ============================================================================

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const otpCode = otp.join('');
      await authService.confirmPasswordReset({
        phone_number: phoneNumber,
        otp: otpCode,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      Alert.alert(
        'Success',
        'Password reset successfully. Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to reset password';
      setError(errorMsg);
      Alert.alert('Error', errorMsg, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      await authService.requestPasswordReset({ phone_number: phoneNumber });
      setOtp(['', '', '', '', '', '']);
      setError('');
      Alert.alert('Success', 'OTP sent successfully', [{ text: 'OK' }]);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend OTP', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderPhoneStep = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed-outline" size={50} color={colors.primary} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to receive a verification code
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
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
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Send OTP</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderOTPStep = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={50} color={colors.primary} />
        </View>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.phoneText}>+91 {phoneNumber}</Text>
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleOtpKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Verify & Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={isLoading}
        >
          <Text style={styles.resendText}>
            Didn't receive OTP?{' '}
            <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="key-outline" size={50} color={colors.primary} />
        </View>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your new password must be different from previously used passwords
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={[styles.inputContainer, error && error.includes('Password') && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter new password"
              placeholderTextColor={colors.text.disabled}
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setError('');
              }}
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputContainer, error && error.includes('match') && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={colors.text.disabled}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              autoCapitalize="none"
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
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Reset Password</Text>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

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

          {/* Render Current Step */}
          {step === 'phone' && renderPhoneStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'password' && renderPasswordStep()}

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
  phoneText: {
    fontWeight: '600',
    color: colors.primary,
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
    backgroundColor: colors.surface,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.05),
  },
  otpInputError: {
    borderColor: colors.error,
    backgroundColor: withOpacity(colors.error, 0.05),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[400],
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
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