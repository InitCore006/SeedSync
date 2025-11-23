import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRegistrationStore } from '@/store/registrationStore';
import { lotStep2Schema } from '@lib/schemas/farmer.schema';
import { Input } from '@/components/common/Input';
import { Select, SelectOption } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing } from '@lib/constants/spacing';

interface Step2FormData {
  quality_grade: string;
  moisture_content?: string;
  oil_content?: string;
  foreign_matter?: string;
  damaged_seeds?: string;
  description?: string;
}

const QUALITY_GRADES: SelectOption[] = [
  { label: 'A Grade (Premium)', value: 'A', icon: '⭐' },
  { label: 'B Grade (Good)', value: 'B', icon: '✨' },
  { label: 'C Grade (Standard)', value: 'C', icon: '⚡' },
];

export default function CreateLotStep2() {
  const router = useRouter();
  const { step2Data, saveStepData, nextStep, previousStep } = useRegistrationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(lotStep2Schema),
    defaultValues: step2Data || {
      quality_grade: '',
      moisture_content: '',
      oil_content: '',
      foreign_matter: '',
      damaged_seeds: '',
      description: '',
    },
  });

  const onSubmit = (data: Step2FormData) => {
    saveStepData(2, data);
    nextStep();
    router.push('/(farmer)/create-lot/step3');
  };

  const handleBack = () => {
    previousStep();
    router.back();
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
            onPress={handleBack}
            icon={<Ionicons name="arrow-back" size={20} color={colors.primary[500]} />}
            iconPosition="left"
          />
          <Text style={styles.headerTitle}>Step 2 of 3</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66.66%' }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Ionicons name="star" size={32} color={colors.primary[500]} />
            <Text style={styles.title}>Quality Details</Text>
            <Text style={styles.subtitle}>
              Provide quality parameters for better buyer confidence
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Quality Grade */}
            <Controller
              control={control}
              name="quality_grade"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Quality Grade"
                  placeholder="Select quality grade"
                  value={value}
                  options={QUALITY_GRADES}
                  onSelect={onChange}
                  error={errors.quality_grade?.message}
                  required
                />
              )}
            />

            {/* Moisture Content */}
            <Controller
              control={control}
              name="moisture_content"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Moisture Content (%)"
                  placeholder="e.g., 8.5"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.moisture_content?.message}
                  keyboardType="decimal-pad"
                  leftIcon="water-outline"
                />
              )}
            />

            {/* Oil Content */}
            <Controller
              control={control}
              name="oil_content"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Oil Content (%)"
                  placeholder="e.g., 42.5"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.oil_content?.message}
                  keyboardType="decimal-pad"
                  leftIcon="flask-outline"
                />
              )}
            />

            {/* Foreign Matter */}
            <Controller
              control={control}
              name="foreign_matter"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Foreign Matter (%)"
                  placeholder="e.g., 2.0"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.foreign_matter?.message}
                  keyboardType="decimal-pad"
                  leftIcon="leaf-outline"
                />
              )}
            />

            {/* Damaged Seeds */}
            <Controller
              control={control}
              name="damaged_seeds"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Damaged Seeds (%)"
                  placeholder="e.g., 1.5"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.damaged_seeds?.message}
                  keyboardType="decimal-pad"
                  leftIcon="alert-circle-outline"
                />
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Description"
                  placeholder="Additional details about your produce..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={4}
                  style={{ height: 100, textAlignVertical: 'top' }}
                />
              )}
            />

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={styles.infoText}>
                Providing accurate quality parameters helps buyers make informed decisions and can
                lead to better prices.
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