import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, withOpacity } from '@/lib/constants/colors';

export default function RegistrationSuccessScreen() {
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Animate success icon
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    
    // Animate checkmark with delay
    checkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.3, { damping: 10 }),
        withSpring(1, { damping: 8 })
      )
    );
  }, []);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const handleContinue = () => {
    router.replace('/(farmer)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Success Animation */}
        <Animated.View style={styles.animationContainer} entering={FadeInUp.delay(100).springify()}>
          <Animated.View style={[styles.successCircleOuter, circleAnimatedStyle]}>
            <View style={styles.successCircleMiddle}>
              <View style={styles.successCircleInner}>
                <Animated.View style={checkAnimatedStyle}>
                  <Ionicons name="checkmark-circle" size={100} color={colors.success} />
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View 
          style={styles.messageContainer}
          entering={FadeInDown.delay(300).springify()}
        >
          <Text style={styles.title}>Registration Successful!</Text>
          <Text style={styles.titleHindi}>पंजीकरण सफल रहा!</Text>
          <Text style={styles.subtitle}>
            Welcome to the SeedSync family. Your farmer account has been created and verified successfully.
          </Text>
          <Text style={styles.subtitleHindi}>
            सीडसिंक परिवार में आपका स्वागत है। आपका किसान खाता सफलतापूर्वक बन गया है।
          </Text>
        </Animated.View>


        {/* Continue Button */}
        <Animated.View entering={FadeInDown.delay(1200).springify()}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Go to Dashboard</Text>
            <Text style={styles.continueButtonTextHindi}>डैशबोर्ड पर जाएं</Text>
            <Ionicons name="arrow-forward-circle" size={24} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by</Text>
          <Text style={styles.footerBrand}>InitCore Developers Group</Text>
          <Text style={styles.footerTagline}>Building Digital India 🇮🇳</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StepItem = ({
  number,
  icon,
  title,
  titleHindi,
  description,
  delay,
  isLast = false,
}: {
  number: string;
  icon: string;
  title: string;
  titleHindi: string;
  description: string;
  delay: number;
  isLast?: boolean;
}) => (
  <Animated.View 
    style={[styles.stepItem, !isLast && styles.stepItemBorder]}
    entering={FadeInDown.delay(delay).springify()}
  >
    <View style={styles.stepNumberContainer}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      {!isLast && <View style={styles.stepConnector} />}
    </View>
    <View style={styles.stepContent}>
      <View style={styles.stepIconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.stepTextContainer}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepTitleHindi}>{titleHindi}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  </Animated.View>
);

const BenefitItem = ({
  icon,
  title,
  titleHindi,
  color,
}: {
  icon: string;
  title: string;
  titleHindi: string;
  color: string;
}) => (
  <View style={styles.benefitItem}>
    <View style={[styles.benefitIconContainer, { backgroundColor: withOpacity(color, 0.1) }]}>
      <Ionicons name={icon as any} size={28} color={color} />
    </View>
    <Text style={styles.benefitTitle}>{title}</Text>
    <Text style={styles.benefitTitleHindi}>{titleHindi}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: withOpacity(colors.success, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircleMiddle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: withOpacity(colors.success, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withOpacity(colors.success, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleHindi: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  subtitleHindi: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginLeft: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  accountDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    marginLeft: 12,
    fontWeight: '500',
  },
  guideCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  guideHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  guideTitleHindi: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  stepsContainer: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    paddingBottom: 24,
  },
  stepItemBorder: {
    borderLeftWidth: 0,
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepConnector: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  stepTitleHindi: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  benefitsTitleHindi: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  benefitTitleHindi: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  supportCard: {
    backgroundColor: withOpacity(colors.primary, 0.05),
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    lineHeight: 22,
  },
  supportTextHindi: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 32,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  continueButtonTextHindi: {
    color: colors.white,
    fontSize: 14,
    marginRight: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 13,
    color: colors.text.disabled,
    marginBottom: 4,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});