import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';

interface Step {
  number: number;
  title: string;
  icon: string;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

      {/* Steps Indicator */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isPending = step.number > currentStep;

          return (
            <View key={step.number} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent,
                  isPending && styles.stepPending,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent && styles.stepNumberCurrent,
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  (isCompleted || isCurrent) && styles.stepTitleActive,
                ]}
                numberOfLines={2}
              >
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    isCompleted && styles.stepConnectorCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  stepCompleted: {
    backgroundColor: colors.primary,
  },
  stepCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  stepPending: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  stepNumberCurrent: {
    color: colors.white,
  },
  stepTitle: {
    fontSize: 11,
    color: colors.text.disabled,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  stepTitleActive: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  stepConnectorCompleted: {
    backgroundColor: colors.primary,
  },
});