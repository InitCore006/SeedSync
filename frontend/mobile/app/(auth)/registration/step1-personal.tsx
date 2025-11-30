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
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRegistrationStore } from '@/store/registrationStore';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';
import { colors, withOpacity } from '@/lib/constants/colors';

const LANGUAGES = [
  { label: 'English (अंग्रेजी)', value: 'en' },
  { label: 'Hindi (हिंदी)', value: 'hi' },
  { label: 'Bengali (বাংলা)', value: 'bn' },
  { label: 'Telugu (తెలుగు)', value: 'te' },
  { label: 'Marathi (मराठी)', value: 'mr' },
  { label: 'Tamil (தமிழ்)', value: 'ta' },
  { label: 'Gujarati (ગુજરાતી)', value: 'gu' },
  { label: 'Kannada (ಕನ್ನಡ)', value: 'kn' },
  { label: 'Malayalam (മലയാളം)', value: 'ml' },
  { label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'pa' },
];

const GENDER_OPTIONS = [
  { label: 'Male (पुरुष)', value: 'M' },
  { label: 'Female (महिला)', value: 'F' },
  { label: 'Other (अन्य)', value: 'O' },
];

const EDUCATION_LEVELS = [
  { label: 'No Formal Education (बिना शिक्षा)', value: 'no_formal' },
  { label: 'Primary (प्राथमिक)', value: 'primary' },
  { label: 'Secondary (माध्यमिक)', value: 'secondary' },
  { label: 'Higher Secondary (उच्च माध्यमिक)', value: 'higher_secondary' },
  { label: 'Graduate (स्नातक)', value: 'graduate' },
  { label: 'Post Graduate (स्नातकोत्तर)', value: 'postgraduate' },
];

const STEPS = [
  { number: 1, title: 'Personal', icon: 'person' },
  { number: 2, title: 'Address', icon: 'location' },
  { number: 3, title: 'Farm', icon: 'leaf' },
  { number: 4, title: 'Bank', icon: 'card' },
  { number: 5, title: 'Schemes', icon: 'shield' },
];

export default function Step1PersonalScreen() {
  const { personalInfo, updatePersonalInfo, nextStep } = useRegistrationStore();

  const [fullName, setFullName] = useState(personalInfo.fullName);
  const [email, setEmail] = useState(personalInfo.email);
  const [password, setPassword] = useState(personalInfo.password);
  const [confirmPassword, setConfirmPassword] = useState(personalInfo.password);
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState(personalInfo.gender);
  const [preferredLanguage, setPreferredLanguage] = useState(personalInfo.preferredLanguage);
  const [educationLevel, setEducationLevel] = useState(personalInfo.educationLevel);
  const [profileImage, setProfileImage] = useState<string>('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
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
    updatePersonalInfo({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
      gender,
      preferredLanguage,
      educationLevel,
    });

    // Navigate to next step
    nextStep();
    router.push('/(auth)/registration/step2-address');
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
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>Personal Information</Text>
              <Text style={styles.titleHindi}>व्यक्तिगत जानकारी</Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator currentStep={1} totalSteps={5} steps={STEPS} />

            {/* Profile Picture */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Photo (प्रोफाइल फोटो)</Text>
              <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="camera" size={40} color={colors.text.disabled} />
                    <Text style={styles.profileImageText}>Upload Photo</Text>
                    <Text style={styles.profileImageHint}>(Optional)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name (पूरा नाम) *</Text>
                <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.text.disabled}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth (जन्म तिथि)</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <Text style={dateOfBirth ? styles.inputText : styles.inputPlaceholder}>
                    {dateOfBirth ? dateOfBirth.toLocaleDateString('en-IN') : 'Select date of birth'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1940, 0, 1)}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender (लिंग) *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={(value) => setGender(value as 'M' | 'F' | 'O')}
                    style={styles.picker}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email (ईमेल)</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com (Optional)"
                    placeholderTextColor={colors.text.disabled}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Language (पसंदीदा भाषा) *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={preferredLanguage}
                    onValueChange={(value) => setPreferredLanguage(value)}
                    style={styles.picker}
                  >
                    {LANGUAGES.map((lang) => (
                      <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Education Level (शिक्षा स्तर)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={educationLevel}
                    onValueChange={(value) => setEducationLevel(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Education Level (Optional)" value="" />
                    {EDUCATION_LEVELS.map((edu) => (
                      <Picker.Item key={edu.value} label={edu.label} value={edu.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Create Password (पासवर्ड बनाएं) *</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.text.disabled}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password (पासवर्ड की पुष्टि) *</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.text.disabled}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    autoCapitalize="none"
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignSelf: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  profileImageHint: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 4,
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
  inputText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[400],
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
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
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 24,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
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