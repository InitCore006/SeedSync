import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegistrationStore } from '@/store/registrationStore';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { colors, withOpacity } from '@/lib/constants/colors';

const STEPS = [
  { number: 1, title: 'Personal', icon: 'person' },
  { number: 2, title: 'Address', icon: 'location' },
  { number: 3, title: 'Farm', icon: 'leaf' },
  { number: 4, title: 'Bank', icon: 'card' },
  { number: 5, title: 'Schemes', icon: 'shield' },
];

export default function Step4BankScreen() {
  const { bankInfo, updateBankInfo, nextStep, previousStep } = useRegistrationStore();

  const [bankName, setBankName] = useState(bankInfo.bankName);
  const [accountHolderName, setAccountHolderName] = useState(bankInfo.accountHolderName);
  const [accountNumber, setAccountNumber] = useState(bankInfo.accountNumber);
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(bankInfo.accountNumber);
  const [ifscCode, setIfscCode] = useState(bankInfo.ifscCode);
  const [skipBankDetails, setSkipBankDetails] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    if (skipBankDetails) return true;

    const newErrors: { [key: string]: string } = {};

    // If account number is provided, all fields are required
    if (accountNumber && accountNumber.trim()) {
      if (!bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
      if (accountNumber !== confirmAccountNumber) {
        newErrors.confirmAccountNumber = 'Account numbers do not match';
      }
      if (!ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
        newErrors.ifscCode = 'Valid IFSC code required (e.g., SBIN0001234)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all bank details correctly or skip this step');
      return;
    }

    // Save data to store
    if (!skipBankDetails && accountNumber) {
      updateBankInfo({
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      });
    } else {
      updateBankInfo({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
      });
    }

    // Navigate to next step
    nextStep();
    router.push('/(auth)/registration/step5-schemes');
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Bank Details',
      'You can add your bank details later from your profile settings. Continue without bank details?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            setSkipBankDetails(true);
            updateBankInfo({
              bankName: '',
              accountHolderName: '',
              accountNumber: '',
              ifscCode: '',
            });
            nextStep();
            router.push('/(auth)/registration/step5-schemes');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StatusBar style="dark" />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>Bank Details</Text>
              <Text style={styles.titleHindi}>बैंक विवरण</Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator currentStep={4} totalSteps={5} steps={STEPS} />

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.infoTitle}>Secure & Optional</Text>
                <Text style={styles.infoText}>
                  Your bank details are encrypted and used only for receiving payments. You can skip this step and add details later.
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name (बैंक का नाम)</Text>
                <View style={[styles.inputContainer, errors.bankName && styles.inputError]}>
                  <Ionicons name="business-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., State Bank of India"
                    placeholderTextColor={colors.text.disabled}
                    value={bankName}
                    onChangeText={(text) => {
                      setBankName(text);
                      setErrors((prev) => ({ ...prev, bankName: '' }));
                    }}
                  />
                </View>
                {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Holder Name (खाताधारक का नाम)</Text>
                <View style={[styles.inputContainer, errors.accountHolderName && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="As per bank records"
                    placeholderTextColor={colors.text.disabled}
                    value={accountHolderName}
                    onChangeText={(text) => {
                      setAccountHolderName(text);
                      setErrors((prev) => ({ ...prev, accountHolderName: '' }));
                    }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
                <Text style={styles.hint}>Enter name exactly as on bank passbook</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number (खाता संख्या)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter account number"
                    placeholderTextColor={colors.text.disabled}
                    keyboardType="number-pad"
                    value={accountNumber}
                    onChangeText={(text) => {
                      setAccountNumber(text);
                      setErrors((prev) => ({ ...prev, confirmAccountNumber: '' }));
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Account Number (खाता संख्या की पुष्टि)</Text>
                <View style={[styles.inputContainer, errors.confirmAccountNumber && styles.inputError]}>
                  <Ionicons name="card-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter account number"
                    placeholderTextColor={colors.text.disabled}
                    keyboardType="number-pad"
                    value={confirmAccountNumber}
                    onChangeText={(text) => {
                      setConfirmAccountNumber(text);
                      setErrors((prev) => ({ ...prev, confirmAccountNumber: '' }));
                    }}
                  />
                </View>
                {errors.confirmAccountNumber && <Text style={styles.errorText}>{errors.confirmAccountNumber}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>IFSC Code (आईएफएससी कोड)</Text>
                <View style={[styles.inputContainer, errors.ifscCode && styles.inputError]}>
                  <Ionicons name="code-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., SBIN0001234"
                    placeholderTextColor={colors.text.disabled}
                    autoCapitalize="characters"
                    maxLength={11}
                    value={ifscCode}
                    onChangeText={(text) => {
                      setIfscCode(text);
                      setErrors((prev) => ({ ...prev, ifscCode: '' }));
                    }}
                  />
                </View>
                {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}
                <Text style={styles.hint}>11-character code (e.g., SBIN0001234)</Text>
              </View>

              {/* Help Section */}
              <View style={styles.helpCard}>
                <Ionicons name="help-circle-outline" size={20} color={colors.info} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.helpTitle}>Where to find IFSC code?</Text>
                  <Text style={styles.helpText}>
                    • Check your bank passbook{'\n'}
                    • Visit your bank website{'\n'}
                    • Use online IFSC code finder
                  </Text>
                </View>
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.backButtonBottom}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip for now, Ill add later</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Your information is secure and encrypted
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  titleHindi: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: withOpacity(colors.success, 0.1),
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  form: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: withOpacity(colors.info, 0.1),
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  helpText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  backButtonBottom: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  skipButtonText: {
    fontSize: 15,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.text.disabled,
  },
});