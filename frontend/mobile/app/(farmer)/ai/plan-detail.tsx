import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import Button from '@/components/common/Button';
import CropRecommendationCard from '@/components/ai/CropRecommendationCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function PlanDetailScreen() {
  const { planId } = useLocalSearchParams();
  const { currentPlan, getPlanDetails, deletePlan, isLoading } = useAI();

  useEffect(() => {
    if (planId) {
      getPlanDetails(planId as string);
    }
  }, [planId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this crop plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePlan(planId as string);
            Alert.alert('Success', 'Plan deleted successfully');
            router.back();
          },
        },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert('Export Plan', 'Plan exported successfully!');
  };

  if (isLoading || !currentPlan) {
    return <LoadingSpinner />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Plan Details</Text>
        <Pressable onPress={handleDelete}>
          <Text style={styles.deleteButton}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Same content as in crop-planner.tsx when plan is shown */}
          <View style={styles.planHeader}>
            <View style={styles.planHeaderLeft}>
              <Text style={styles.planSeason}>
                {currentPlan.season.toUpperCase()} {currentPlan.year}
              </Text>
              <Text style={styles.planDate}>{formatDate(currentPlan.id)}</Text>
              <Text style={styles.planLocation}>
                {currentPlan.location.district}, {currentPlan.location.state}
              </Text>
            </View>
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
              <Text style={styles.planDetailLabel}>Land Area:</Text>
              <Text style={styles.planDetailValue}>{currentPlan.id} acres</Text>
            </View>
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
            {currentPlan.recommendations.map((rec, index) => (
              <CropRecommendationCard
                key={index}
                recommendation={rec}
                onSelect={() => {}}
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Assessment</Text>
            <View
              style={[
                styles.riskCard,
                {
                  backgroundColor: `${getRiskColor(currentPlan.riskAssessment.overallRisk)}15`,
                },
              ]}
            >
              <View style={styles.riskHeader}>
                <Text style={styles.riskTitle}>Overall Risk Level</Text>
                <Text
                  style={[
                    styles.riskLevel,
                    { color: getRiskColor(currentPlan.riskAssessment.overallRisk) },
                  ]}
                >
                  {currentPlan.riskAssessment.overallRisk.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.riskScore}>
                Risk Score: {currentPlan.riskAssessment.riskScore}/100
              </Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Button
              title="View Full Calendar"
              onPress={() =>
                router.push({
                  pathname: '/(farmer)/ai/farming-calendar',
                  params: { planId: currentPlan.id },
                })
              }
            />
            <Button
              title="Export Plan"
              onPress={handleExport}
              variant="outline"
              style={styles.exportButton}
            />
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
  deleteButton: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planHeaderLeft: {},
  planSeason: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 4,
  },
  planDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  planLocation: {
    ...typography.body,
    color: colors.text.secondary,
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
    marginBottom: spacing.md,
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
  },
  actionsSection: {
    gap: spacing.sm,
  },
  exportButton: {
    marginTop: spacing.xs,
  },
});