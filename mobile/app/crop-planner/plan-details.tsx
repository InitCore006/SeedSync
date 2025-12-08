import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Button } from '@/components';
import { cropPlannerService, CultivationTask } from '@/services/cropPlannerService';

const CROP_ICONS: Record<string, string> = {
  groundnut: '🥜',
  soybean: '🫘',
  sunflower: '🌻',
  mustard: '🌼',
  safflower: '🌸',
  sesame: '🌾',
};

export default function PlanDetailsScreen() {
  const params = useLocalSearchParams();
  const [saving, setSaving] = useState(false);
  const [plantingDate, setPlantingDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const cropName = params.crop_name as string;
  const cropType = params.crop_type as string;
  const landAcres = parseFloat(params.land_acres as string);
  const estimatedYield = parseFloat(params.estimated_yield as string);
  const estimatedRevenue = parseFloat(params.estimated_revenue as string);
  const growingPeriodDays = parseInt(params.growing_period_days as string);
  const netProfit = parseFloat(params.net_profit as string);
  const inputCosts = JSON.parse(params.input_costs as string);

  // Calculate harvest date
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + growingPeriodDays);

  // Generate cultivation timeline
  const cultivationTasks = cropPlannerService.calculateCultivationTimeline(
    plantingDate,
    growingPeriodDays
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const plan = await cropPlannerService.createCropPlan({
        crop_type: cropType,
        crop_name: cropName,
        land_allocated_acres: landAcres,
        planting_date: plantingDate,
        expected_harvest_date: harvestDate.toISOString().split('T')[0],
        estimated_yield: estimatedYield,
        estimated_revenue: estimatedRevenue,
      });

      Alert.alert(
        'Success!',
        'Your crop plan has been saved successfully. You can track progress from your dashboard.',
        [
          {
            text: 'View My Plans',
            onPress: () => router.replace('/(tabs)'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      console.error('Save plan error:', error);
      Alert.alert('Error', error.message || 'Failed to save crop plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Cultivation Plan" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crop Header */}
        <View style={styles.headerCard}>
          <Text style={styles.cropEmoji}>{CROP_ICONS[cropType] || '🌱'}</Text>
          <Text style={styles.cropTitle}>{cropName} Cultivation Plan</Text>
          <Text style={styles.cropSubtitle}>
            {landAcres} acres · {growingPeriodDays} days
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{formatDate(plantingDate)}</Text>
            <Text style={styles.statLabel}>Planting Date</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{formatDate(harvestDate.toISOString())}</Text>
            <Text style={styles.statLabel}>Expected Harvest</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#22c55e" />
            <Text style={styles.statValue}>{estimatedYield.toFixed(1)} Q</Text>
            <Text style={styles.statLabel}>Est. Yield</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color="#10b981" />
            <Text style={styles.statValue}>
              {formatCurrency(netProfit).substring(0, 8)}...
            </Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Financial Summary</Text>
          </View>

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Estimated Revenue</Text>
            <Text style={styles.financialValue}>
              {formatCurrency(estimatedRevenue)}
            </Text>
          </View>

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total Input Costs</Text>
            <Text style={[styles.financialValue, { color: '#ef4444' }]}>
              -{formatCurrency(inputCosts.total)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { fontWeight: '700', fontSize: 16 }]}>
              Net Profit
            </Text>
            <Text style={[styles.financialValue, { fontWeight: '700', fontSize: 18, color: COLORS.success }]}>
              {formatCurrency(netProfit)}
            </Text>
          </View>

          <View style={styles.roiCard}>
            <Text style={styles.roiLabel}>Return on Investment (ROI)</Text>
            <Text style={styles.roiValue}>
              {((netProfit / inputCosts.total) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Cultivation Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Cultivation Timeline</Text>
          </View>
          <Text style={styles.timelineSubtitle}>
            Complete schedule from preparation to harvest
          </Text>

          <View style={styles.timeline}>
            {cultivationTasks.map((task, index) => (
              <View key={task.id} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <View style={styles.timelineDotInner} />
                </View>
                {index < cultivationTasks.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineContent}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.task_name}</Text>
                    <Text style={styles.taskDate}>{formatDate(task.scheduled_date)}</Text>
                  </View>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text style={styles.cardTitle}>Important Notes</Text>
          </View>

          <View style={styles.noteItem}>
            <Ionicons name="warning" size={18} color="#f59e0b" />
            <Text style={styles.noteText}>
              Weather conditions can affect yield. Monitor regularly and adjust irrigation accordingly.
            </Text>
          </View>

          <View style={styles.noteItem}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
            <Text style={styles.noteText}>
              Use certified seeds and recommended fertilizers for best results.
            </Text>
          </View>

          <View style={styles.noteItem}>
            <Ionicons name="bug" size={18} color="#ef4444" />
            <Text style={styles.noteText}>
              Regular pest monitoring is crucial. Consult our disease detection tool if you notice any issues.
            </Text>
          </View>

          <View style={styles.noteItem}>
            <Ionicons name="cash-outline" size={18} color="#10b981" />
            <Text style={styles.noteText}>
              Revenue calculations are based on current MSP. Actual prices may vary at harvest time.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Save This Plan"
            onPress={handleSavePlan}
            loading={saving}
            style={styles.saveButton}
            icon={<Ionicons name="bookmark" size={20} color="#fff" />}
          />

          <TouchableOpacity
            style={styles.modifyButton}
            onPress={() => router.back()}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.modifyButtonText}>Modify Selection</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  cropTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  cropSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  roiCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  roiLabel: {
    fontSize: 12,
    color: '#166534',
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginRight: 12,
    zIndex: 1,
  },
  timelineDotInner: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    position: 'absolute',
    left: 9,
    top: 20,
    bottom: -20,
    width: 2,
    backgroundColor: '#d1d5db',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
  },
  saveButton: {
    marginBottom: 0,
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  modifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
});
