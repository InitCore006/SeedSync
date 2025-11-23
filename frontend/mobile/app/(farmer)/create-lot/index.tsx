import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRegistrationStore } from '@/store/registrationStore';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius } from '@lib/constants/spacing';

const STEPS = [
  {
    number: 1,
    title: 'Basic Information',
    description: 'Crop type, variety, and quantity',
    icon: 'information-circle-outline' as const,
  },
  {
    number: 2,
    title: 'Quality Details',
    description: 'Quality parameters and grading',
    icon: 'star-outline' as const,
  },
  {
    number: 3,
    title: 'Pricing & Availability',
    description: 'Price, location, and availability',
    icon: 'pricetag-outline' as const,
  },
];

export default function CreateLotIndex() {
  const router = useRouter();
  const { currentStep, reset } = useRegistrationStore();

  React.useEffect(() => {
    // Reset on mount
    reset();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Lot</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Let's create your lot</Text>
        <Text style={styles.subtitle}>
          Follow these simple steps to list your produce for sale
        </Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step) => (
            <TouchableOpacity
              key={step.number}
              style={[
                styles.stepCard,
                currentStep >= step.number && styles.stepCardActive,
              ]}
              onPress={() => router.push(`/(farmer)/create-lot/step${step.number}` as any)}
            >
              <View
                style={[
                  styles.stepNumber,
                  currentStep >= step.number && styles.stepNumberActive,
                ]}
              >
                {currentStep > step.number ? (
                  <Ionicons name="checkmark" size={24} color={colors.text.inverse} />
                ) : (
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                )}
              </View>

              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons
                    name={step.icon}
                    size={24}
                    color={currentStep >= step.number ? colors.primary[500] : colors.gray[400]}
                  />
                  <Text
                    style={[
                      styles.stepTitle,
                      currentStep >= step.number && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/(farmer)/create-lot/step1')}
        >
          <Text style={styles.startButtonText}>Start Creating Lot</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
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
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
  },

  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },

  stepsContainer: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },

  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  stepCardActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },

  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  stepNumberActive: {
    backgroundColor: colors.primary[500],
  },

  stepNumberText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.gray[600],
  },

  stepContent: {
    flex: 1,
  },

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  stepTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
  },

  stepTitleActive: {
    color: colors.text.primary,
  },

  stepDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },

  startButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.inverse,
  },
});