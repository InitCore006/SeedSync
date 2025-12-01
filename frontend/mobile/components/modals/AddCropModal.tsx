import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, withOpacity } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface AddCropModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (cropData: any) => Promise<void>;
}

const OILSEED_CROPS = [
  { id: 'groundnut', label: 'मूंगफली', sublabel: 'Groundnut' },
  { id: 'mustard', label: 'सरसों', sublabel: 'Mustard' },
  { id: 'sunflower', label: 'सूरजमुखी', sublabel: 'Sunflower' },
  { id: 'soybean', label: 'सोयाबीन', sublabel: 'Soybean' },
  { id: 'sesame', label: 'तिल', sublabel: 'Sesame' },
  { id: 'safflower', label: 'कुसुम', sublabel: 'Safflower' },
  { id: 'castor', label: 'अरंडी', sublabel: 'Castor' },
  { id: 'linseed', label: 'अलसी', sublabel: 'Linseed' },
  { id: 'niger', label: 'रामतिल', sublabel: 'Niger' },
];

const INDIAN_STATES = [
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Karnataka',
  'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Uttar Pradesh', 'Punjab'
];

export default function AddCropModal({ visible, onClose, onSubmit }: AddCropModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedCrop, setSelectedCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [plantedArea, setPlantedArea] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
  );
  const [locationAddress, setLocationAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [estimatedYield, setEstimatedYield] = useState('');
  
  const [showPlantingDatePicker, setShowPlantingDatePicker] = useState(false);
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCrop) {
      newErrors.cropType = 'कृपया फसल चुनें (Please select crop)';
    }
    if (!variety.trim()) {
      newErrors.variety = 'कृपया किस्म दर्ज करें (Please enter variety)';
    }
    if (!plantedArea.trim() || isNaN(Number(plantedArea)) || Number(plantedArea) <= 0) {
      newErrors.plantedArea = 'कृपया सही क्षेत्रफल दर्ज करें (Please enter valid area)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!district.trim()) {
      newErrors.district = 'कृपया जिला दर्ज करें (Please enter district)';
    }
    if (!state.trim()) {
      newErrors.state = 'कृपया राज्य चुनें (Please select state)';
    }

    if (expectedHarvestDate <= plantingDate) {
      newErrors.expectedHarvestDate = 'कटाई की तारीख बुवाई के बाद होनी चाहिए';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const cropData = {
        crop_type: selectedCrop,
        variety: variety.trim(),
        planted_area: Number(plantedArea),
        planting_date: plantingDate.toISOString().split('T')[0],
        expected_harvest_date: expectedHarvestDate.toISOString().split('T')[0],
        location_address: locationAddress.trim() || undefined,
        district: district.trim(),
        state: state.trim(),
        estimated_yield: estimatedYield ? Number(estimatedYield) : undefined,
      };

      await onSubmit(cropData);
      handleClose();
    } catch (error: any) {
      Alert.alert(
        'त्रुटि (Error)',
        error.response?.data?.message || 'फसल जोड़ने में समस्या (Failed to add crop)'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCrop('');
    setVariety('');
    setPlantedArea('');
    setPlantingDate(new Date());
    setExpectedHarvestDate(new Date(Date.now() + 120 * 24 * 60 * 60 * 1000));
    setLocationAddress('');
    setDistrict('');
    setState('');
    setEstimatedYield('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {step === 2 && (
                <Pressable onPress={() => setStep(1)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
              )}
              <View>
                <Text style={styles.headerTitle}>
                  {step === 1 ? 'नई फसल जोड़ें' : 'स्थान विवरण'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {step === 1 ? 'Add New Crop' : 'Location Details'}
                </Text>
              </View>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: Crop Details */}
            {step === 1 && (
              <>
                {/* Crop Type Selection */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    फसल का प्रकार / Crop Type *
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.cropScrollView}
                  >
                    {OILSEED_CROPS.map((crop) => (
                      <Pressable
                        key={crop.id}
                        style={[
                          styles.cropCard,
                          selectedCrop === crop.id && styles.cropCardSelected,
                        ]}
                        onPress={() => {
                          setSelectedCrop(crop.id);
                          if (errors.cropType) setErrors({ ...errors, cropType: '' });
                        }}
                      >
                        <Text style={[
                          styles.cropLabelHindi,
                          selectedCrop === crop.id && styles.cropLabelSelected,
                        ]}>
                          {crop.label}
                        </Text>
                        <Text style={[
                          styles.cropLabelEnglish,
                          selectedCrop === crop.id && styles.cropLabelEnglishSelected,
                        ]}>
                          {crop.sublabel}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  {errors.cropType && (
                    <Text style={styles.errorText}>{errors.cropType}</Text>
                  )}
                </View>

                {/* Variety */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    किस्म / Variety *
                  </Text>
                  <TextInput
                    style={[styles.input, errors.variety && styles.inputError]}
                    placeholder="उदा. JS 335, TG 37A"
                    placeholderTextColor={colors.text.disabled}
                    value={variety}
                    onChangeText={(text) => {
                      setVariety(text);
                      if (errors.variety) setErrors({ ...errors, variety: '' });
                    }}
                  />
                  {errors.variety && (
                    <Text style={styles.errorText}>{errors.variety}</Text>
                  )}
                </View>

                {/* Planted Area */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    क्षेत्रफल (एकड़ में) / Area (in acres) *
                  </Text>
                  <TextInput
                    style={[styles.input, errors.plantedArea && styles.inputError]}
                    placeholder="उदा. 2.5"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.text.disabled}
                    value={plantedArea}
                    onChangeText={(text) => {
                      setPlantedArea(text);
                      if (errors.plantedArea) setErrors({ ...errors, plantedArea: '' });
                    }}
                  />
                  {errors.plantedArea && (
                    <Text style={styles.errorText}>{errors.plantedArea}</Text>
                  )}
                </View>

                {/* Planting Date */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    बुवाई की तारीख / Planting Date *
                  </Text>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => setShowPlantingDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.dateButtonText}>
                      {plantingDate.toLocaleDateString('en-IN')}
                    </Text>
                  </Pressable>
                  {showPlantingDatePicker && (
                    <DateTimePicker
                      value={plantingDate}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowPlantingDatePicker(false);
                        if (date) setPlantingDate(date);
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {/* Expected Harvest Date */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    अनुमानित कटाई तारीख / Expected Harvest Date *
                  </Text>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => setShowHarvestDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.dateButtonText}>
                      {expectedHarvestDate.toLocaleDateString('en-IN')}
                    </Text>
                  </Pressable>
                  {showHarvestDatePicker && (
                    <DateTimePicker
                      value={expectedHarvestDate}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowHarvestDatePicker(false);
                        if (date) setExpectedHarvestDate(date);
                      }}
                      minimumDate={new Date()}
                    />
                  )}
                  {errors.expectedHarvestDate && (
                    <Text style={styles.errorText}>{errors.expectedHarvestDate}</Text>
                  )}
                </View>
              </>
            )}

            {/* STEP 2: Location Details */}
            {step === 2 && (
              <>
                {/* District */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    जिला / District *
                  </Text>
                  <TextInput
                    style={[styles.input, errors.district && styles.inputError]}
                    placeholder="उदा. नागपुर, अहमदाबाद"
                    placeholderTextColor={colors.text.disabled}
                    value={district}
                    onChangeText={(text) => {
                      setDistrict(text);
                      if (errors.district) setErrors({ ...errors, district: '' });
                    }}
                  />
                  {errors.district && (
                    <Text style={styles.errorText}>{errors.district}</Text>
                  )}
                </View>

                {/* State */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    राज्य / State *
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.stateScrollView}
                  >
                    {INDIAN_STATES.map((s) => (
                      <Pressable
                        key={s}
                        style={[
                          styles.stateChip,
                          state === s && styles.stateChipSelected,
                        ]}
                        onPress={() => {
                          setState(s);
                          if (errors.state) setErrors({ ...errors, state: '' });
                        }}
                      >
                        <Text style={[
                          styles.stateChipText,
                          state === s && styles.stateChipTextSelected,
                        ]}>
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  {errors.state && (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  )}
                </View>

                {/* Location Address */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    पता (वैकल्पिक) / Address (Optional)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="गांव / शहर का नाम"
                    placeholderTextColor={colors.text.disabled}
                    value={locationAddress}
                    onChangeText={setLocationAddress}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {/* Estimated Yield */}
                <View style={styles.section}>
                  <Text style={styles.label}>
                    अनुमानित उपज (क्विंटल में) / Expected Yield (Optional)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="उदा. 20"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.text.disabled}
                    value={estimatedYield}
                    onChangeText={setEstimatedYield}
                  />
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.info} />
                  <Text style={styles.infoText}>
                    आप बाद में और जानकारी जोड़ सकते हैं जैसे खाद, दवाई आदि।
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            {step === 1 ? (
              <Pressable
                style={({ pressed }) => [
                  styles.nextButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>आगे बढ़ें / Next</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'जोड़ा जा रहा है...' : 'फसल जोड़ें / Add Crop'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray[300],
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  scrollView: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cropScrollView: {
    flexDirection: 'row',
  },
  cropCard: {
    minWidth: 100,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cropCardSelected: {
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderColor: colors.primary,
  },
  cropLabelHindi: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  cropLabelEnglish: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  cropLabelSelected: {
    color: colors.primary,
  },
  cropLabelEnglishSelected: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  dateButtonText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  stateScrollView: {
    flexDirection: 'row',
  },
  stateChip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateChipText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  stateChipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: withOpacity(colors.info, 0.1),
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  infoText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.xs,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  submitButtonText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});