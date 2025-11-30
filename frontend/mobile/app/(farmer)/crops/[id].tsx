import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAI } from '@/hooks/useAI';
import Card from '@/components/common/Card';
import { colors } from '@/lib/constants/colors';
import { spacing, borderRadius } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';

export default function CropDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getYieldForecast } = useAI();

  // Mock data - replace with actual API call
  const crop = {
    id,
    name: 'Soybean',
    variety: 'JS 335',
    area: 12.5,
    plantingDate: '2024-06-15',
    expectedHarvestDate: '2024-10-15',
    status: 'Growing',
    healthScore: 85,
    soilType: 'Clay Loam',
    irrigationType: 'Drip',
    currentStage: 'Flowering',
    daysToHarvest: 45,
  };

  const activities = [
    { id: 1, type: 'Irrigation', date: '2024-11-25', status: 'Completed' },
    { id: 2, type: 'Fertilization', date: '2024-11-20', status: 'Completed' },
    { id: 3, type: 'Pest Control', date: '2024-11-15', status: 'Completed' },
  ];

  const metrics = [
    { label: 'Health Score', value: `${crop.healthScore}%`, icon: 'heart-outline', color: colors.success },
    { label: 'Days to Harvest', value: crop.daysToHarvest, icon: 'calendar-outline', color: colors.primary },
    { label: 'Area', value: `${crop.area} Ac`, icon: 'resize-outline', color: colors.secondary },
    { label: 'Stage', value: crop.currentStage, icon: 'flower-outline', color: colors.accent },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/crops/edit-crop?id=${id}` as any)}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Crop Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.cropHeader}>
            <View>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.cropVariety}>{crop.variety}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{crop.status}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Growth Progress</Text>
              <Text style={styles.progressValue}>{crop.healthScore}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${crop.healthScore}%` }]} />
            </View>
          </View>
        </Card>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <Card key={index} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
                <Ionicons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </Card>
          ))}
        </View>

        {/* Details Section */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Crop Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Planting Date</Text>
            <Text style={styles.detailValue}>
              {new Date(crop.plantingDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected Harvest</Text>
            <Text style={styles.detailValue}>
              {new Date(crop.expectedHarvestDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Soil Type</Text>
            <Text style={styles.detailValue}>{crop.soilType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Irrigation</Text>
            <Text style={styles.detailValue}>{crop.irrigationType}</Text>
          </View>
        </Card>

        {/* Recent Activities */}
        <Card style={styles.activitiesCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityType}>{activity.type}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.activityStatus}>
                <Text style={styles.activityStatusText}>{activity.status}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <View style={styles.aiActionsGrid}>
            <Pressable
              style={styles.aiActionCard}
              onPress={() => router.push({
                pathname: '/(farmer)/ai/crop-scanner',
                params: { cropId: id }
              })}
            >
              <Text style={styles.aiActionIcon}>📸</Text>
              <Text style={styles.aiActionText}>Scan Health</Text>
            </Pressable>
            
            <Pressable
              style={styles.aiActionCard}
              onPress={() => router.push({
                pathname: '/(farmer)/ai/yield-prediction' as any,
                params: { cropId: id }
              } as any)}
            >
              <Text style={styles.aiActionIcon}>📊</Text>
              <Text style={styles.aiActionText}>Yield Forecast</Text>
            </Pressable>
            
            <Pressable
              style={styles.aiActionCard}
              onPress={() => router.push({
                pathname: '/(farmer)/ai/price-prediction',
                params: { cropName: crop.name }
              })}
            >
              <Text style={styles.aiActionIcon}>💰</Text>
              <Text style={styles.aiActionText}>Price Trends</Text>
            </Pressable>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => {}}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.primaryActionText}>Add Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => {}}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryActionText}>Get Advice</Text>
          </TouchableOpacity>
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
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  cropName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 4,
  },
  cropVariety: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  progressValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.md,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  activitiesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activityStatus: {
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activityStatusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryActionText: {
    ...typography.button,
    color: colors.primary,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  // Add styles
aiActionsGrid: {
  flexDirection: 'row',
  gap: spacing.sm,
},
aiActionCard: {
  flex: 1,
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: 'center',
  elevation: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
},
aiActionIcon: {
  fontSize: 32,
  marginBottom: spacing.xs,
},
aiActionText: {
  ...typography.caption,
  color: colors.text.primary,
  fontWeight: '600',
  textAlign: 'center',
},
});