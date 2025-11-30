import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import { useCrops } from '@/hooks/useCrops';
import Picker from '@/components/common/Picker';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function YieldPredictionScreen() {
  const { crops, getCrops } = useCrops();
  const { currentYieldPrediction, getYieldForecast, isLoading } = useAI();
  const [selectedCropId, setSelectedCropId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getCrops();
  }, []);

  const activeCrops = crops.filter((c) => c.status === 'active');
  const cropOptions = activeCrops.map((crop) => ({
    label: `${crop.cropName} - ${crop.variety}`,
    value: crop.id,
  }));

  const handleFetchPrediction = async () => {
    if (selectedCropId) {
      await getYieldForecast(selectedCropId);
    }
  };

  useEffect(() => {
    if (selectedCropId) {
      handleFetchPrediction();
    }
  }, [selectedCropId]);

  const onRefresh = async () => {
    if (selectedCropId) {
      setRefreshing(true);
      await getYieldForecast(selectedCropId);
      setRefreshing(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A':
        return colors.success;
      case 'B':
        return colors.warning;
      case 'C':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'easy':
        return colors.success;
      case 'moderate':
        return colors.warning;
      case 'difficult':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Yield Prediction</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📊</Text>
            <Text style={styles.infoTitle}>AI Yield Forecasting</Text>
            <Text style={styles.infoText}>
              Get accurate yield predictions based on crop variety, soil conditions, weather
              patterns, and farming practices. Optimize your harvest with AI insights.
            </Text>
          </View>

          <View style={styles.searchSection}>
            <Picker
              label="Select Your Crop"
              selectedValue={selectedCropId}
              onValueChange={setSelectedCropId}
              items={cropOptions}
              placeholder="Choose a crop"
            />
          </View>

          {isLoading && !refreshing ? (
            <LoadingSpinner />
          ) : currentYieldPrediction ? (
            <>
              <View style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <View>
                    <Text style={styles.cropName}>{currentYieldPrediction.cropName}</Text>
                    <Text style={styles.variety}>{currentYieldPrediction.variety}</Text>
                  </View>
                  <View
                    style={[
                      styles.qualityBadge,
                      {
                        backgroundColor: `${getQualityColor(
                          currentYieldPrediction.expectedQuality
                        )}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.qualityText,
                        { color: getQualityColor(currentYieldPrediction.expectedQuality) },
                      ]}
                    >
                      Grade {currentYieldPrediction.expectedQuality}
                    </Text>
                  </View>
                </View>

                <View style={styles.yieldContainer}>
                  <Text style={styles.yieldLabel}>Predicted Yield</Text>
                  <Text style={styles.yieldValue}>
                    {currentYieldPrediction.predictedYield} Q
                  </Text>
                  <Text style={styles.yieldArea}>
                    Per {currentYieldPrediction.area} acres
                  </Text>
                </View>

                <View style={styles.rangeContainer}>
                  <View style={styles.rangeItem}>
                    <Text style={styles.rangeLabel}>Minimum</Text>
                    <Text style={styles.rangeValue}>
                      {currentYieldPrediction.confidenceRange.min} Q
                    </Text>
                  </View>
                  <View style={styles.rangeDivider} />
                  <View style={styles.rangeItem}>
                    <Text style={styles.rangeLabel}>Maximum</Text>
                    <Text style={styles.rangeValue}>
                      {currentYieldPrediction.confidenceRange.max} Q
                    </Text>
                  </View>
                </View>

                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>AI Confidence:</Text>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceProgress,
                        { width: `${currentYieldPrediction.confidence}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceValue}>
                    {currentYieldPrediction.confidence}%
                  </Text>
                </View>

                <View style={styles.harvestDate}>
                  <Text style={styles.harvestLabel}>Expected Harvest Date:</Text>
                  <Text style={styles.harvestValue}>
                    {formatDate(currentYieldPrediction.harvestDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yield Factors</Text>
                <Text style={styles.sectionSubtitle}>
                  Factors affecting your crop yield
                </Text>
                {currentYieldPrediction.factors.map((factor, index) => (
                  <View key={index} style={styles.factorCard}>
                    <View style={styles.factorHeader}>
                      <Text
                        style={[
                          styles.factorIcon,
                          { color: factor.isPositive ? colors.success : colors.error },
                        ]}
                      >
                        {factor.isPositive ? '✓' : '✗'}
                      </Text>
                      <View style={styles.factorContent}>
                        <Text style={styles.factorName}>{factor.name}</Text>
                        <Text style={styles.factorDescription}>{factor.description}</Text>
                      </View>
                      <View style={styles.factorImpact}>
                        <Text
                          style={[
                            styles.factorImpactValue,
                            { color: factor.isPositive ? colors.success : colors.error },
                          ]}
                        >
                          {factor.impact > 0 ? '+' : ''}
                          {factor.impact}%
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Optimization Opportunities</Text>
                <Text style={styles.sectionSubtitle}>
                  Ways to improve your yield
                </Text>
                {currentYieldPrediction.optimizations.map((opt, index) => (
                  <View key={index} style={styles.optimizationCard}>
                    <View style={styles.optimizationHeader}>
                      <Text style={styles.optimizationTitle}>{opt.title}</Text>
                      <View
                        style={[
                          styles.feasibilityBadge,
                          {
                            backgroundColor: `${getFeasibilityColor(opt.feasibility)}20`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.feasibilityText,
                            { color: getFeasibilityColor(opt.feasibility) },
                          ]}
                        >
                          {opt.feasibility.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.optimizationDescription}>{opt.description}</Text>
                    <View style={styles.optimizationMetrics}>
                      <View style={styles.optimizationMetric}>
                        <Text style={styles.optimizationMetricLabel}>Yield Increase:</Text>
                        <Text style={styles.optimizationMetricValue}>
                          +{opt.expectedIncrease}%
                        </Text>
                      </View>
                      {opt.cost && (
                        <View style={styles.optimizationMetric}>
                          <Text style={styles.optimizationMetricLabel}>Investment:</Text>
                          <Text style={styles.optimizationMetricValue}>
                            ₹{opt.cost.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk Assessment</Text>
                <Text style={styles.sectionSubtitle}>
                  Potential risks and mitigation strategies
                </Text>
                {currentYieldPrediction.risks.map((risk, index) => (
                  <View key={index} style={styles.riskCard}>
                    <View style={styles.riskHeader}>
                      <Text style={styles.riskIcon}>⚠️</Text>
                      <View style={styles.riskContent}>
                        <Text style={styles.riskTitle}>{risk.title}</Text>
                        <View style={styles.riskMetrics}>
                          <View style={styles.riskMetric}>
                            <Text style={styles.riskMetricLabel}>Probability:</Text>
                            <Text style={styles.riskMetricValue}>{risk.probability}%</Text>
                          </View>
                          <View style={styles.riskMetric}>
                            <Text style={styles.riskMetricLabel}>Impact:</Text>
                            <Text style={[styles.riskMetricValue, { color: colors.error }]}>
                              -{risk.potentialImpact}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.riskDescription}>{risk.description}</Text>
                    <View style={styles.mitigationSection}>
                      <Text style={styles.mitigationTitle}>Mitigation Steps:</Text>
                      {risk.mitigation.map((step, idx) => (
                        <Text key={idx} style={styles.mitigationStep}>
                          • {step}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>📈</Text>
                <Text style={styles.summaryTitle}>Yield Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Base Yield:</Text>
                  <Text style={styles.summaryValue}>
                    {currentYieldPrediction.predictedYield} Q
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>With Optimizations:</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {(
                      currentYieldPrediction.predictedYield *
                      (1 +
                        currentYieldPrediction.optimizations.reduce(
                          (sum, opt) => sum + opt.expectedIncrease,
                          0
                        ) /
                          100)
                    ).toFixed(1)}{' '}
                    Q
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Expected Quality:</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: getQualityColor(currentYieldPrediction.expectedQuality) },
                    ]}
                  >
                    Grade {currentYieldPrediction.expectedQuality}
                  </Text>
                </View>
              </View>
            </>
          ) : activeCrops.length === 0 ? (
            <EmptyState
              icon="🌾"
              title="No Active Crops"
              description="Add crops to your farm to see yield predictions"
              actionLabel="Add Crop"
              onAction={() => router.push('/(farmer)/crops/add-crop')}
            />
          ) : (
            <EmptyState
              icon="📊"
              title="Select a Crop"
              description="Choose one of your active crops to view yield predictions"
            />
          )}

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerIcon}>ℹ️</Text>
            <Text style={styles.disclaimerText}>
              Yield predictions are AI-generated estimates based on current conditions, historical
              data, and farming practices. Actual yields may vary based on weather, pest control,
              and other factors.
            </Text>
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
  searchSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  predictionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cropName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  variety: {
    ...typography.body,
    color: colors.text.secondary,
  },
  qualityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  qualityText: {
    ...typography.caption,
    fontWeight: '700',
  },
  yieldContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  yieldLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  yieldValue: {
    ...typography.h1,
    fontSize: 56,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  yieldArea: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  rangeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  rangeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  rangeValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rangeDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  confidenceValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.primary,
  },
  harvestDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
  },
  harvestLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  harvestValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
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
  factorCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  factorIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  factorContent: {
    flex: 1,
  },
  factorName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  factorDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  factorImpact: {
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  factorImpactValue: {
    ...typography.h4,
    fontWeight: '700',
  },
  optimizationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optimizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optimizationTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  feasibilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  feasibilityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  optimizationDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  optimizationMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optimizationMetric: {
    flex: 1,
  },
  optimizationMetricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  optimizationMetricValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.success,
  },
  riskCard: {
    backgroundColor: `${colors.error}10`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  riskHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  riskIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  riskContent: {
    flex: 1,
  },
  riskTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  riskMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  riskMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskMetricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  riskMetricValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  riskDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  mitigationSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mitigationTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mitigationStep: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: `${colors.success}15`,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  disclaimerCard: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
});