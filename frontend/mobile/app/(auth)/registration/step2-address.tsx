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
import { INDIAN_STATES } from '@/lib/constants/data';
import { colors, withOpacity } from '@/lib/constants/colors';

const STEPS = [
  { number: 1, title: 'Personal', icon: 'person' },
  { number: 2, title: 'Address', icon: 'location' },
  { number: 3, title: 'Farm', icon: 'leaf' },
  { number: 4, title: 'Bank', icon: 'card' },
  { number: 5, title: 'Schemes', icon: 'shield' },
];

export default function Step2AddressScreen() {
  const { addressInfo, updateAddressInfo, nextStep, previousStep } = useRegistrationStore();

  const [addressLine1, setAddressLine1] = useState(addressInfo.addressLine1);
  const [addressLine2, setAddressLine2] = useState(addressInfo.addressLine2);
  const [village, setVillage] = useState(addressInfo.village);
  const [block, setBlock] = useState(addressInfo.block);
  const [district, setDistrict] = useState(addressInfo.district);
  const [state, setState] = useState(addressInfo.state);
  const [pincode, setPincode] = useState(addressInfo.pincode);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!district.trim()) newErrors.district = 'District is required';
    if (!state) newErrors.state = 'State is required';
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Valid 6-digit pincode required';
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
    updateAddressInfo({
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      village: village.trim(),
      block: block.trim(),
      district: district.trim(),
      state,
      pincode: pincode.trim(),
    });

    // Navigate to next step
    nextStep();
    router.push('/(auth)/registration/step3-farm');
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
              <Text style={styles.title}>Address Details</Text>
              <Text style={styles.titleHindi}>पता विवरण</Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator currentStep={2} totalSteps={5} steps={STEPS} />

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.infoText}>
                Please provide your complete address details for proper identification and communication.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address Line 1 (पता पंक्ति 1)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="home-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="House/Flat No., Street"
                    placeholderTextColor={colors.text.disabled}
                    value={addressLine1}
                    onChangeText={setAddressLine1}
                  />
                </View>
                <Text style={styles.hint}>Example: House No. 123, Main Street</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address Line 2 (पता पंक्ति 2)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Locality, Area"
                    placeholderTextColor={colors.text.disabled}
                    value={addressLine2}
                    onChangeText={setAddressLine2}
                  />
                </View>
                <Text style={styles.hint}>Example: Near Temple, Gandhi Nagar</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Village/Town (गांव/शहर)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter village/town name"
                    placeholderTextColor={colors.text.disabled}
                    value={village}
                    onChangeText={setVillage}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Block/Tehsil (ब्लॉक/तहसील)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter block/tehsil"
                    placeholderTextColor={colors.text.disabled}
                    value={block}
                    onChangeText={setBlock}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>District (जिला) *</Text>
                <View style={[styles.inputContainer, errors.district && styles.inputError]}>
                  <Ionicons name="business-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter district"
                    placeholderTextColor={colors.text.disabled}
                    value={district}
                    onChangeText={(text) => {
                      setDistrict(text);
                      setErrors((prev) => ({ ...prev, district: '' }));
                    }}
                  />
                </View>
                {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State (राज्य) *</Text>
                <View style={[styles.pickerContainer, errors.state && styles.inputError]}>
                  <Picker
                    selectedValue={state}
                    onValueChange={(value) => {
                      setState(value);
                      setErrors((prev) => ({ ...prev, state: '' }));
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select State" value="" />
                    {INDIAN_STATES.map((stateName) => (
                      <Picker.Item key={stateName} label={stateName} value={stateName} />
                    ))}
                  </Picker>
                </View>
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pincode (पिनकोड) *</Text>
                <View style={[styles.inputContainer, errors.pincode && styles.inputError]}>
                  <Ionicons name="pin-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit pincode"
                    placeholderTextColor={colors.text.disabled}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={(text) => {
                      setPincode(text);
                      setErrors((prev) => ({ ...prev, pincode: '' }));
                    }}
                  />
                </View>
                {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
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
    backgroundColor: withOpacity(colors.primary, 0.1),
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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