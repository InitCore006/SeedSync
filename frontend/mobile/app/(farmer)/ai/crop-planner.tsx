import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Picker from '@/components/common/Picker';
import Switch from '@/components/common/Switch';
import CropRecommendationCard from '@/components/ai/CropRecommendationCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

const SEASONS = [
  { label: 'Kharif (Monsoon)', value: 'kharif' },
  { label: 'Rabi (Winter)', value: 'rabi' },
  { label: 'Zaid (Summer)', value: 'zaid' },
];

const SOIL_TYPES = [
  { label: 'Black Cotton Soil', value: 'black' },
  { label: 'Red Soil', value: 'red' },
  { label: 'Alluvial Soil', value: 'alluvial' },
  { label: 'Laterite Soil', value: 'laterite' },
  { label: 'Sandy Soil', value: 'sandy' },
  { label: 'Clay Soil', value: 'clay' },
];

const STATES = [
  { label: 'Maharashtra', value: 'maharashtra' },
  { label: 'Karnataka', value: 'karnataka' },
  { label: 'Tamil Nadu', value: 'tamilnadu' },
  { label: 'Punjab', value: 'punjab' },
  { label: 'Haryana', value: 'haryana' },
  { label: 'Uttar Pradesh', value: 'uttarpradesh' },
];

export default function CropPlannerScreen() {
  const { currentPlan, createCropPlan, isLoading } = useAI();
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    season: 'kharif',
    state: 'maharashtra',
    district: '',
    soilType: 'black',
    area: '',
    irrigationAvailable: true,
  });

  const handleGeneratePlan = async () => {
    if (!formData.district.trim()) {
      Alert.alert('District Required', 'Please enter your district name');
      return;
    }
    if (!formData.area.trim() || parseFloat(formData.area) <= 0) {
      Alert.alert('Area Required', 'Please enter valid land area in acres');
      return;
    }

    try {
      await createCropPlan({
        season: formData.season,
        location: {
          district: formData.district,
          state: formData.state,
        },
        soilType: formData.soilType,
        area: parseFloat(formData.area),
        irrigationAvailable: formData.irrigationAvailable,
      });
      setShowForm(false);
      Alert.alert('Success', 'Crop plan generated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate crop plan');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>AI Crop Planner</Text>
        <Pressable onPress={() => router.push('/(farmer)/ai/plan-history')}>
          <Text style={styles.historyButton}>History</Text>
        </Pressable>
      </View>

      {showForm ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🌾</Text>
              <Text style={styles.infoTitle}>Smart Crop Recommendations</Text>
              <Text style={styles.infoText}>
                Get AI-powered crop recommendations based on your soil type, climate, and season for
                maximum profitability.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.formTitle}>Enter Your Details</Text>

              <Picker
                label="Season"
                selectedValue={formData.season}
                onValueChange={(value) => setFormData({ ...formData, season: value })}
                items={SEASONS}
              />

              <Picker
                label="State"
                selectedValue={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
                items={STATES}
              />

              <Input
                label="District"
                placeholder="Enter your district"
                value={formData.district}
                onChangeText={(text) => setFormData({ ...formData, district: text })}
              />

              <Picker
                label="Soil Type"
                selectedValue={formData.soilType}
                onValueChange={(value) => setFormData({ ...formData, soilType: value })}
                items={SOIL_TYPES}
              />

              <Input
                label="Land Area (Acres)"
                placeholder="Enter land area"
                value={formData.area}
                onChangeText={(text) => setFormData({ ...formData, area: text })}
                keyboardType="decimal-pad"
              />

              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchText}>Irrigation Available?</Text>
                  <Text style={styles.switchSubtext}>
                    Do you have access to irrigation facilities?
                  </Text>
                </View>
                <Switch
                  value={formData.irrigationAvailable}
                  onValueChange={(value) =>
                    setFormData({ ...formData, irrigationAvailable: value })
                  }
                />
              </View>

              <Button
                title={isLoading ? 'Generating Plan...' : 'Generate Crop Plan'}
                onPress={handleGeneratePlan}
                disabled={isLoading}
                style={styles.generateButton}
              />
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What You will Get:</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🎯</Text>
                  <Text style={styles.benefitText}>
                    Top crop recommendations based on your conditions
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>💰</Text>
                  <Text style={styles.benefitText}>
                    Expected yield and profit estimates
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>📅</Text>
                  <Text style={styles.benefitText}>
                    Complete farming calendar with activities
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🔄</Text>
                  <Text style={styles.benefitText}>
                    Crop rotation plan for sustainable farming
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>⚠️</Text>
                  <Text style={styles.benefitText}>Risk assessment and mitigation strategies</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : currentPlan ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.planHeader}>
              <View style={styles.planHeaderLeft}>
                <Text style={styles.planSeason}>{currentPlan.season.toUpperCase()} {currentPlan.year}</Text>
                <Text style={styles.planLocation}>
                  {currentPlan.location.district}, {currentPlan.location.state}
                </Text>
              </View>
              <Pressable
                style={styles.newPlanButton}
                onPress={() => setShowForm(true)}
              >
                <Text style={styles.newPlanText}>New Plan</Text>
              </Pressable>
            </View>

            <View style={styles.planSummaryCard}>
              <Text style={styles.planSummaryTitle}>Expected Revenue</Text>
              <Text style={styles.planSummaryValue}>
                ₹{currentPlan.expectedRevenue.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.planSummaryLabel}>
                Based on {currentPlan.recommendations.length} crop recommendations
              </Text>
            </View>

            <View style={styles.planDetailsCard}>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>Soil Type:</Text>
                <Text style={styles.planDetailValue}>{currentPlan.soilType}</Text>
              </View>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>Irrigation:</Text>
                <Text style={styles.planDetailValue}>
                  {currentPlan.irrigationAvailable ? 'Available' : 'Not Available'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Crops</Text>
              <Text style={styles.sectionSubtitle}>
                Sorted by suitability and profitability
              </Text>
              {currentPlan.recommendations.map((rec, index) => (
                <CropRecommendationCard
                  key={index}
                  recommendation={rec}
                  onSelect={() => {
                    // Navigate to detailed view
                  }}
                />
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Crop Rotation Plan</Text>
              <Text style={styles.sectionSubtitle}>
                Optimize soil health and productivity
              </Text>
              {currentPlan.rotationPlan.map((rotation, index) => (
                <View key={index} style={styles.rotationCard}>
                  <View style={styles.rotationHeader}>
                    <Text style={styles.rotationSeason}>
                      {rotation.season} {rotation.year}
                    </Text>
                    <Text style={styles.rotationCrop}>{rotation.primaryCrop}</Text>
                  </View>
                  {rotation.secondaryCrop && (
                    <Text style={styles.rotationSecondary}>
                      Secondary: {rotation.secondaryCrop}
                    </Text>
                  )}
                  <View style={styles.rotationBenefits}>
                    <Text style={styles.rotationBenefitsTitle}>Benefits:</Text>
                    {rotation.benefits.map((benefit, idx) => (
                      <Text key={idx} style={styles.rotationBenefit}>
                        • {benefit}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk Assessment</Text>
              <View
                style={[
                  styles.riskCard,
                  {
                    backgroundColor:
                      currentPlan.riskAssessment.overallRisk === 'low'
                        ? `${colors.success}15`
                        : currentPlan.riskAssessment.overallRisk === 'medium'
                        ? `${colors.warning}15`
                        : `${colors.error}15`,
                  },
                ]}
              >
                <View style={styles.riskHeader}>
                  <Text style={styles.riskTitle}>Overall Risk Level</Text>
                  <Text
                    style={[
                      styles.riskLevel,
                      {
                        color:
                          currentPlan.riskAssessment.overallRisk === 'low'
                            ? colors.success
                            : currentPlan.riskAssessment.overallRisk === 'medium'
                            ? colors.warning
                            : colors.error,
                      },
                    ]}
                  >
                    {currentPlan.riskAssessment.overallRisk.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.riskScore}>
                  Risk Score: {currentPlan.riskAssessment.riskScore}/100
                </Text>

                <View style={styles.riskFactors}>
                  <Text style={styles.riskFactorsTitle}>Risk Factors:</Text>
                  {currentPlan.riskAssessment.factors.map((factor, index) => (
                    <View key={index} style={styles.riskFactorItem}>
                      <Text style={styles.riskFactorCategory}>{factor.category}:</Text>
                      <Text style={styles.riskFactorText}>{factor.risk}</Text>
                      <Text style={styles.riskFactorMitigation}>
                        Mitigation: {factor.mitigation}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.riskRecommendations}>
                  <Text style={styles.riskRecommendationsTitle}>Recommendations:</Text>
                  {currentPlan.riskAssessment.recommendations.map((rec, index) => (
                    <Text key={index} style={styles.riskRecommendationItem}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <Button
              title="View Full Calendar"
              onPress={() =>
                router.push({
                  pathname: '/(farmer)',
                  params: { planId: currentPlan.id },
                })
              }
              style={styles.calendarButton}
            />
          </View>
        </ScrollView>
      ) : null}
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
  historyButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  switchLabel: {
    flex: 1,
  },
  switchText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  generateButton: {
    marginTop: spacing.md,
  },
  benefitsSection: {
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
  },
  benefitsTitle: {
    ...typography.body,
    fontWeight: '700',
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
    fontSize: 20,
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planHeaderLeft: {
    flex: 1,
  },
  planSeason: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  planLocation: {
    ...typography.body,
    color: colors.text.secondary,
  },
  newPlanButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  newPlanText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  planSummaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  planSummaryTitle: {
    ...typography.body,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  planSummaryValue: {
    ...typography.h1,
    color: colors.surface,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  planSummaryLabel: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.9,
  },
  planDetailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planDetailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  planDetailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  rotationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rotationSeason: {
    ...typography.body,
    color: colors.text.secondary,
  },
  rotationCrop: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  rotationSecondary: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  rotationBenefits: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rotationBenefitsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  rotationBenefit: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  riskCard: {
    borderRadius: 12,
    padding: spacing.md,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  riskTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  riskLevel: {
    ...typography.body,
    fontWeight: '700',
  },
  riskScore: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  riskFactors: {
    marginBottom: spacing.md,
  },
  riskFactorsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  riskFactorItem: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  riskFactorCategory: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  riskFactorText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  riskFactorMitigation: {
    ...typography.caption,
    color: colors.accent,
    fontStyle: 'italic',
  },
  riskRecommendations: {},
  riskRecommendationsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  riskRecommendationItem: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  calendarButton: {
    marginTop: spacing.md,
  },
});