import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

const AI_FEATURES = [
  {
    id: 'crop-scanner',
    title: 'Crop Scanner',
    description: 'Detect diseases, pests, and deficiencies using AI',
    icon: '📸',
    route: '/(farmer)/ai/crop-scanner',
    color: colors.success,
  },
  {
    id: 'crop-planner',
    title: 'Crop Planner',
    description: 'Get AI recommendations for crop selection',
    icon: '🌾',
    route: '/(farmer)/ai/crop-planner',
    color: colors.primary,
  },
  {
    id: 'price-prediction',
    title: 'Price Prediction',
    description: 'Forecast market prices for next 30-90 days',
    icon: '💰',
    route: '/(farmer)/ai/price-prediction',
    color: colors.warning,
  },
  {
    id: 'yield-prediction',
    title: 'Yield Prediction',
    description: 'Estimate your crop yield with AI',
    icon: '📊',
    route: '/(farmer)/ai/yield-prediction',
    color: colors.secondary,
  },
  {
    id: 'chatbot',
    title: 'AI Assistant',
    description: 'Chat with AI farming expert',
    icon: '🤖',
    route: '/(farmer)/ai/chatbot',
    color: colors.accent,
  },
];

export default function AIAssistantScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>AI Assistant</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.introCard}>
            <Text style={styles.introIcon}>🤖✨</Text>
            <Text style={styles.introTitle}>Powered by AI</Text>
            <Text style={styles.introText}>
              Advanced artificial intelligence to help you make better farming decisions
            </Text>
          </View>

          <Text style={styles.sectionTitle}>AI Features</Text>
          {AI_FEATURES.map((feature) => (
            <Pressable
              key={feature.id}
              style={styles.featureCard}
              onPress={() => router.push(feature.route as any)}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}20` }]}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Text style={styles.featureArrow}>›</Text>
            </Pressable>
          ))}

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Use AI?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Accurate disease detection within seconds
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Data-driven crop recommendations
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Market price forecasting for better planning
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Yield optimization strategies
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  24/7 farming expert at your fingertips
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  introIcon: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  introTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  introText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  featureArrow: {
    fontSize: 24,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  benefitsSection: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  benefitsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    ...typography.body,
    color: colors.success,
    fontWeight: '700',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  benefitText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});