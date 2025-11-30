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
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView, 
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

const SCHEMES_INFO = [
  {
    name: 'Kisan Credit Card (KCC)',
    nameHindi: 'किसान क्रेडिट कार्ड',
    description: 'Get easy credit for agricultural needs',
    icon: 'card',
    color: colors.primary,
  },
  {
    name: 'PMFBY Crop Insurance',
    nameHindi: 'प्रधानमंत्री फसल बीमा योजना',
    description: 'Protect your crops from natural calamities',
    icon: 'shield-checkmark',
    color: colors.success,
  },
];

export default function Step5SchemesScreen() {
  const { govtSchemes, updateGovtSchemes, registerFarmer, isLoading, previousStep } = useRegistrationStore();

  const [hasKCC, setHasKCC] = useState(govtSchemes.hasKCC);
  const [kccNumber, setKccNumber] = useState(govtSchemes.kccNumber);
  const [hasPMFBY, setHasPMFBY] = useState(govtSchemes.hasPMFBY);
  const [pmfbyPolicy, setPmfbyPolicy] = useState(govtSchemes.pmfbyPolicy);

  const handleRegister = async () => {
    Keyboard.dismiss();

    // Save government schemes data
    updateGovtSchemes({
      hasKCC,
      kccNumber: hasKCC ? kccNumber.trim() : '',
      hasPMFBY,
      pmfbyPolicy: hasPMFBY ? pmfbyPolicy.trim() : '',
    });

    try {
      await registerFarmer();
      // Navigation handled in store
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'Registration failed';
      Alert.alert('Registration Failed', errorMsg, [{ text: 'OK' }]);
    }
  };

  const handleBack = () => {
    previousStep();
    router.back();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Government Schemes',
      'You can add scheme details later from your profile. Complete registration now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Registration',
          onPress: () => {
            updateGovtSchemes({
              hasKCC: false,
              kccNumber: '',
              hasPMFBY: false,
              pmfbyPolicy: '',
            });
            handleRegister();
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
              <Text style={styles.title}>Government Schemes</Text>
              <Text style={styles.titleHindi}>सरकारी योजनाएं</Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator currentStep={5} totalSteps={5} steps={STEPS} />

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.info} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.infoTitle}>Optional Information</Text>
                <Text style={styles.infoText}>
                  Help us serve you better by providing your government scheme details. This is completely optional.
                </Text>
              </View>
            </View>

            {/* Schemes Section */}
            <View style={styles.form}>
              {/* KCC Section */}
              <View style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <View style={[styles.schemeIcon, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
                    <Ionicons name="card" size={28} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.schemeName}>Kisan Credit Card</Text>
                    <Text style={styles.schemeNameHindi}>किसान क्रेडिट कार्ड</Text>
                    <Text style={styles.schemeDescription}>
                      Easy credit facility for agricultural and allied activities
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setHasKCC(!hasKCC)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, hasKCC && styles.checkboxChecked]}>
                    {hasKCC && <Ionicons name="checkmark" size={18} color={colors.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>I have a Kisan Credit Card</Text>
                </TouchableOpacity>

                {hasKCC && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>KCC Number (केसीसी नंबर)</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="card-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your KCC number"
                        placeholderTextColor={colors.text.disabled}
                        value={kccNumber}
                        onChangeText={setKccNumber}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* PMFBY Section */}
              <View style={styles.schemeCard}>
                <View style={styles.schemeHeader}>
                  <View style={[styles.schemeIcon, { backgroundColor: withOpacity(colors.success, 0.1) }]}>
                    <Ionicons name="shield-checkmark" size={28} color={colors.success} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.schemeName}>PMFBY Crop Insurance</Text>
                    <Text style={styles.schemeNameHindi}>प्रधानमंत्री फसल बीमा योजना</Text>
                    <Text style={styles.schemeDescription}>
                      Comprehensive insurance coverage for crop losses
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setHasPMFBY(!hasPMFBY)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, hasPMFBY && styles.checkboxChecked]}>
                    {hasPMFBY && <Ionicons name="checkmark" size={18} color={colors.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>I have PMFBY insurance</Text>
                </TouchableOpacity>

                {hasPMFBY && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Policy Number (पॉलिसी नंबर)</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="document-text-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter policy number"
                        placeholderTextColor={colors.text.disabled}
                        value={pmfbyPolicy}
                        onChangeText={setPmfbyPolicy}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Learn More Card */}
              <View style={styles.learnMoreCard}>
                <Ionicons name="bulb-outline" size={24} color={colors.warning} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.learnMoreTitle}>Want to learn more?</Text>
                  <Text style={styles.learnMoreText}>
                    Visit our resources section to know about various government schemes for farmers
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
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Complete Registration</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip and complete registration</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                You're almost done! Complete registration to access all features
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
    backgroundColor: withOpacity(colors.info, 0.1),
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
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
  schemeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  schemeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  schemeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  schemeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  schemeNameHindi: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  schemeDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  inputGroup: {
    marginTop: 8,
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
    backgroundColor: colors.background,
    minHeight: 56,
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
  learnMoreCard: {
    flexDirection: 'row',
    backgroundColor: withOpacity(colors.warning, 0.1),
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  learnMoreTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  learnMoreText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  backButtonBottom: {
    flex: 0.4,
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
  registerButton: {
    flex: 0.6,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  registerButtonText: {
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
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.disabled,
    textAlign: 'center',
    lineHeight: 18,
  },
});