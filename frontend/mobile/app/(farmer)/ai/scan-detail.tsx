import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAI } from '@/hooks/useAI';
import DetectionCard from '@/components/ai/DetectionCard';
import RecommendationCard from '@/components/ai/RecommendationCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function ScanDetailScreen() {
  const { scanId } = useLocalSearchParams();
  const { currentScan, getScanDetails, isLoading } = useAI();

  useEffect(() => {
    if (scanId) {
      getScanDetails(scanId as string);
    }
  }, [scanId]);

  if (isLoading || !currentScan) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'critical':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Scan Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Image source={{ uri: currentScan.imageUrl }} style={styles.image} />

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.cropName}>{currentScan.cropName}</Text>
                <Text style={styles.scanDate}>{formatDate(currentScan.timestamp)}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(currentScan.overallStatus)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(currentScan.overallStatus) },
                  ]}
                >
                  {currentScan.overallStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            {currentScan.growthStage && (
              <View style={styles.growthStageContainer}>
                <Text style={styles.growthStageLabel}>Growth Stage:</Text>
                <Text style={styles.growthStageValue}>{currentScan.growthStage}</Text>
              </View>
            )}

            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Health Score</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: getHealthColor(currentScan.healthScore) },
                  ]}
                >
                  {currentScan.healthScore}%
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>AI Confidence</Text>
                <Text style={styles.metricValue}>{currentScan.confidence}%</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Issues Found</Text>
                <Text style={[styles.metricValue, { color: colors.error }]}>
                  {currentScan.detections.length}
                </Text>
              </View>
            </View>
          </View>

          {currentScan.detections.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Issues</Text>
              {currentScan.detections.map((detection) => (
                <DetectionCard key={detection.id} detection={detection} />
              ))}
            </View>
          )}

          {currentScan.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Treatment Recommendations</Text>
              {currentScan.recommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </View>
          )}

          {currentScan.detections.length === 0 && (
            <View style={styles.healthyCard}>
              <Text style={styles.healthyIcon}>✅</Text>
              <Text style={styles.healthyTitle}>Crop Looks Healthy!</Text>
              <Text style={styles.healthyText}>
                No diseases, pests, or deficiencies detected. Continue with regular care and
                monitoring.
              </Text>
            </View>
          )}
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
    paddingBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.border,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  infoHeader: {
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
  scanDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  growthStageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.accent}15`,
    borderRadius: 8,
  },
  growthStageLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  growthStageValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.text.primary,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  healthyCard: {
    backgroundColor: `${colors.success}15`,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  healthyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  healthyTitle: {
    ...typography.h3,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  healthyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});