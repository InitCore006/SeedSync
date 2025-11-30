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
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useRegistrationStore } from '@/store/registrationStore';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { colors, withOpacity } from '@/lib/constants/colors';

const FARMER_CATEGORIES = [
  { label: 'Marginal (< 1 hectare) - सीमांत', value: 'marginal' },
  { label: 'Small (1-2 hectares) - लघु', value: 'small' },
  { label: 'Semi-Medium (2-4 hectares) - अर्ध मध्यम', value: 'semi_medium' },
  { label: 'Medium (4-10 hectares) - मध्यम', value: 'medium' },
  { label: 'Large (> 10 hectares) - बड़ा', value: 'large' },
];

const CASTE_CATEGORIES = [
  { label: 'General (सामान्य)', value: 'general' },
  { label: 'OBC (अन्य पिछड़ा वर्ग)', value: 'obc' },
  { label: 'SC (अनुसूचित जाति)', value: 'sc' },
  { label: 'ST (अनुसूचित जनजाति)', value: 'st' },
];

const STEPS = [
  { number: 1, title: 'Personal', icon: 'person' },
  { number: 2, title: 'Address', icon: 'location' },
  { number: 3, title: 'Farm', icon: 'leaf' },
  { number: 4, title: 'Bank', icon: 'card' },
  { number: 5, title: 'Schemes', icon: 'shield' },
];

export default function Step3FarmScreen() {
  const { farmInfo, updateFarmInfo, nextStep, previousStep } = useRegistrationStore();

  const [totalLandArea, setTotalLandArea] = useState(farmInfo.totalLandArea);
  const [irrigatedLand, setIrrigatedLand] = useState(farmInfo.irrigatedLand);
  const [rainFedLand, setRainFedLand] = useState(farmInfo.rainFedLand);
  const [farmerCategory, setFarmerCategory] = useState(farmInfo.farmerCategory);
  const [casteCategory, setCasteCategory] = useState(farmInfo.casteCategory);
  const [isFPOMember, setIsFPOMember] = useState(farmInfo.isFPOMember);
  const [primaryFPO, setPrimaryFPO] = useState(farmInfo.primaryFPO);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!totalLandArea || parseFloat(totalLandArea) <= 0) {
      newErrors.totalLandArea = 'Valid land area required';
    }

    const total = parseFloat(totalLandArea) || 0;
    const irrigated = parseFloat(irrigatedLand) || 0;
    const rainFed = parseFloat(rainFedLand) || 0;

    if (irrigated + rainFed > total) {
      newErrors.landArea = 'Irrigated + Rain-fed cannot exceed total land';
    }

    if (isFPOMember && !primaryFPO.trim()) {
      newErrors.primaryFPO = 'Please enter FPO name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    // Save data to store
    updateFarmInfo({
      totalLandArea,
      irrigatedLand,
      rainFedLand,
      farmerCategory,
      casteCategory,
      isFPOMember,
      primaryFPO: primaryFPO.trim(),
    });

    // Navigate to next step
    nextStep();
    router.push('/(auth)/registration/step4-bank');
  };

  const handleBack = () => {
    previousStep();
    router.back();
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
              <Text style={styles.title}>Farm Details</Text>
              <Text style={styles.titleHindi}>खेत विवरण</Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator currentStep={3} totalSteps={5} steps={STEPS} />

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="leaf" size={24} color={colors.success} />
              <Text style={styles.infoText}>
                Provide accurate information about your farmland to help us serve you better with relevant schemes and services.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Land Area in Acres (कुल भूमि क्षेत्र एकड़ में) *</Text>
                <View style={[styles.inputContainer, errors.totalLandArea && styles.inputError]}>
                  <Ionicons name="resize-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 2.5"
                    placeholderTextColor={colors.text.disabled}
                    keyboardType="decimal-pad"
                    value={totalLandArea}
                    onChangeText={(text) => {
                      setTotalLandArea(text);
                      setErrors((prev) => ({ ...prev, totalLandArea: '', landArea: '' }));
                    }}
                  />
                </View>
                {errors.totalLandArea && <Text style={styles.errorText}>{errors.totalLandArea}</Text>}
                <Text style={styles.hint}>1 Acre = 0.4047 Hectare</Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Irrigated Land (सिंचित भूमि)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="water-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.text.disabled}
                      keyboardType="decimal-pad"
                      value={irrigatedLand}
                      onChangeText={(text) => {
                        setIrrigatedLand(text);
                        setErrors((prev) => ({ ...prev, landArea: '' }));
                      }}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Rain-fed Land (वर्षा आधारित)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="rainy-outline" size={20} color={colors.info} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.text.disabled}
                      keyboardType="decimal-pad"
                      value={rainFedLand}
                      onChangeText={(text) => {
                        setRainFedLand(text);
                        setErrors((prev) => ({ ...prev, landArea: '' }));
                      }}
                    />
                  </View>
                </View>
              </View>
              {errors.landArea && <Text style={styles.errorText}>{errors.landArea}</Text>}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Farmer Category (किसान श्रेणी) *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={farmerCategory}
                    onValueChange={(value) => setFarmerCategory(value as any)}
                    style={styles.picker}
                  >
                    {FARMER_CATEGORIES.map((cat) => (
                      <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Caste Category (जाति श्रेणी) *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={casteCategory}
                    onValueChange={(value) => setCasteCategory(value as any)}
                    style={styles.picker}
                  >
                    {CASTE_CATEGORIES.map((cat) => (
                      <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* FPO Membership */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>FPO Membership (एफपीओ सदस्यता)</Text>
                
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setIsFPOMember(!isFPOMember)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isFPOMember && styles.checkboxChecked]}>
                    {isFPOMember && <Ionicons name="checkmark" size={18} color={colors.white} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checkboxLabel}>I am a member of an FPO</Text>
                    <Text style={styles.checkboxLabelHindi}>(मैं एक एफपीओ का सदस्य हूं)</Text>
                  </View>
                </TouchableOpacity>

                {isFPOMember && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>FPO Name (एफपीओ का नाम) *</Text>
                    <View style={[styles.inputContainer, errors.primaryFPO && styles.inputError]}>
                      <Ionicons name="people-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter FPO name"
                        placeholderTextColor={colors.text.disabled}
                        value={primaryFPO}
                        onChangeText={(text) => {
                          setPrimaryFPO(text);
                          setErrors((prev) => ({ ...prev, primaryFPO: '' }));
                        }}
                      />
                    </View>
                    {errors.primaryFPO && <Text style={styles.errorText}>{errors.primaryFPO}</Text>}
                  </View>
                )}
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>* Required fields</Text>
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
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  form: {
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
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
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  picker: {
    height: 56,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
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
  checkboxLabelHindi: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
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
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.text.disabled,
  },
});