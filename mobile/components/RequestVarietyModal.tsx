import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { cropsAPI, VarietyRequestData } from '@/services/cropsService';

interface RequestVarietyModalProps {
  visible: boolean;
  onClose: () => void;
  cropType: string;
  cropName: string;
}

export const RequestVarietyModal: React.FC<RequestVarietyModalProps> = ({
  visible,
  onClose,
  cropType,
  cropName,
}) => {
  const [formData, setFormData] = useState<VarietyRequestData>({
    crop_type: cropType,
    variety_name: '',
    variety_code: '',
    source: '',
    reason: '',
    characteristics: '',
    region: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof VarietyRequestData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.variety_name.trim()) {
      Alert.alert('Required Field', 'Please enter the variety name');
      return;
    }

    if (!formData.reason.trim()) {
      Alert.alert('Required Field', 'Please explain why you need this variety');
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData: VarietyRequestData = {
        ...formData,
        crop_type: cropType,
      };

      await cropsAPI.requestVariety(requestData);

      Alert.alert(
        'Request Submitted',
        'Your variety request has been submitted successfully. The government team will review it and add it to the system if approved.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to submit variety request:', error);
      Alert.alert(
        'Submission Failed',
        error.response?.data?.message || 'Failed to submit request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      crop_type: cropType,
      variety_name: '',
      variety_code: '',
      source: '',
      reason: '',
      characteristics: '',
      region: '',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Request New Variety</Text>
            <Text style={styles.subtitle}>{cropName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={22} color="#1e40af" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Request Guidelines</Text>
              <Text style={styles.infoText}>
                Submit a request for a crop variety that's not currently in our system.
                Government agriculture officials will review and approve if it meets
                official standards.
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Variety Name - Required */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Variety Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., JS 335, Pusa Bold"
                value={formData.variety_name}
                onChangeText={(text) => handleChange('variety_name', text)}
                placeholderTextColor={COLORS.secondary}
              />
            </View>

            {/* Variety Code - Optional */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Variety Code <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Official variety code if known"
                value={formData.variety_code}
                onChangeText={(text) => handleChange('variety_code', text)}
                placeholderTextColor={COLORS.secondary}
              />
              <Text style={styles.hint}>
                Enter the official code if you know it (e.g., JS-335, RH-30)
              </Text>
            </View>

            {/* Source - Optional */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Source <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., State Agriculture Dept, ICAR, Local Research Station"
                value={formData.source}
                onChangeText={(text) => handleChange('source', text)}
                placeholderTextColor={COLORS.secondary}
              />
              <Text style={styles.hint}>
                Where did you learn about this variety?
              </Text>
            </View>

            {/* Reason - Required */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Why do you need this variety? <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Explain why this variety is important for your farming (e.g., better suited for your region, higher yield, disease resistant)"
                value={formData.reason}
                onChangeText={(text) => handleChange('reason', text)}
                placeholderTextColor={COLORS.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Characteristics - Optional */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Known Characteristics <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any known details: maturity days, yield potential, oil content, disease resistance, etc."
                value={formData.characteristics}
                onChangeText={(text) => handleChange('characteristics', text)}
                placeholderTextColor={COLORS.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Region - Optional */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Suitable Region <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Madhya Pradesh, Rajasthan, North India"
                value={formData.region}
                onChangeText={(text) => handleChange('region', text)}
                placeholderTextColor={COLORS.secondary}
              />
              <Text style={styles.hint}>
                Which region/state is this variety best suited for?
              </Text>
            </View>

            {/* Review Process Info */}
            <View style={styles.processCard}>
              <View style={styles.processHeader}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.processTitle}>Review Process</Text>
              </View>
              <Text style={styles.processText}>
                1. Your request will be reviewed by government agriculture officials{'\n'}
                2. They will verify the variety with official sources{'\n'}
                3. If approved, it will be added to the system{'\n'}
                4. You'll be notified of the decision
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 24,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 19,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.secondary,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  hint: {
    fontSize: 12,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  processCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#86efac',
    marginTop: 8,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  processTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803d',
  },
  processText: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
