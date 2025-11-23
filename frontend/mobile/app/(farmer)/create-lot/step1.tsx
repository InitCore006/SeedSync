import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRegistrationStore } from '@/store/registrationStore';
import { lotStep1Schema } from '@lib/schemas/farmer.schema';
import { Input } from '@/components/common/Input';
import { Select, SelectOption } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';
import { CROP_TYPES, CROP_VARIETIES } from '@lib/constants/options';

interface Step1FormData {
  crop_type: string;
  variety: string;
  quantity: string;
  packaging_type: string;
}

const PACKAGING_OPTIONS: SelectOption[] = [
  { label: 'Jute Bags', value: 'JUTE_BAGS', icon: '📦' },
  { label: 'Plastic Bags', value: 'PLASTIC_BAGS', icon: '🛍️' },
  { label: 'Loose', value: 'LOOSE', icon: '📭' },
];

export default function CreateLotStep1() {
  const router = useRouter();
  const { step1Data, saveStepData, setStep, nextStep } = useRegistrationStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(lotStep1Schema),
    defaultValues: step1Data || {
      crop_type: '',
      variety: '',
      quantity: '',
      packaging_type: '',
    },
  });

  const selectedCrop = watch('crop_type');
  const varietyOptions = selectedCrop ? CROP_VARIETIES[selectedCrop] || [] : [];

  const onSubmit = (data: Step1FormData) => {
    saveStepData(1, data);
    nextStep();
    router.push('/(farmer)/create-lot/step2');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="Back"
            variant="text"
            onPress={() => router.back()}
            icon={<Ionicons name="arrow-back" size={20} color={colors.primary[500]} />}
            iconPosition="left"
          />
          <Text style={styles.headerTitle}>Step 1 of 3</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33.33%' }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Ionicons name="information-circle" size={32} color={colors.primary[500]} />
            <Text style={styles.title}>Basic Information</Text>
            <Text style={styles.subtitle}>
              Tell us about the crop you want to sell
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Crop Type */}
            <Controller
              control={control}
              name="crop_type"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Crop Type"
                  placeholder="Select crop type"
                  value={value}
                  options={CROP_TYPES}
                  onSelect={onChange}
                  error={errors.crop_type?.message}
                  required
                />
              )}
            />

            {/* Variety */}
            {selectedCrop && (
              <Controller
                control={control}
                name="variety"
                render={({ field: { onChange, value } }) => (
                  <Select
                    label="Variety"
                    placeholder="Select variety"
                    value={value}
                    options={varietyOptions}
                    onSelect={onChange}
                    error={errors.variety?.message}
                    required
                  />
                )}
              />
            )}

            {/* Quantity */}
            <Controller
              control={control}
              name="quantity"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Quantity (Quintals)"
                  placeholder="Enter quantity in quintals"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.quantity?.message}
                  keyboardType="decimal-pad"
                  leftIcon="cube-outline"
                  required
                />
              )}
            />

            {/* Packaging Type */}
            <Controller
              control={control}
              name="packaging_type"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Packaging Type"
                  placeholder="Select packaging type"
                  value={value}
                  options={PACKAGING_OPTIONS}
                  onSelect={onChange}
                  error={errors.packaging_type?.message}
                  required
                />
              )}
            />

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={styles.infoText}>
                1 Quintal = 100 kg. Make sure to provide accurate quantity for better pricing.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Next Step"
            onPress={handleSubmit(onSubmit)}
            fullWidth
            icon={<Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />}
            iconPosition="right"
          />
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
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  headerTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
  },

  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },

  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  formContainer: {
    flex: 1,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.info,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },

  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.default,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});