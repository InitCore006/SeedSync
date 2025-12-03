import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useCropStore } from '@/store/cropStore';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';
import { CROP_STATUS_CONFIG } from '@/lib/constants/crops';
import { useCropDetail } from '@/hooks/useCrops';

const { width } = Dimensions.get('window');

export default function CropDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const cropId = params.id;
  
  const {
    crop,
    inputs,
    observations,
    harvests,
    timeline,
    isLoading,
    refreshing,
    refresh,
    error: detailError,
  } = useCropDetail(cropId);

  const { deleteCrop, updateCropStatus } = useCropStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'inputs' | 'observations' | 'timeline'>('overview');

  const handleStatusUpdate = () => {
    if (!crop) return;

    const statusOptions = [
      { label: 'Growing', value: 'growing' },
      { label: 'Flowering', value: 'flowering' },
      { label: 'Matured', value: 'matured' },
      { label: 'Harvested', value: 'harvested' },
    ];

    Alert.alert(
      'Update Status',
      'Select new crop status:',
      [
        ...statusOptions.map((option) => ({
          text: option.label,
          onPress: async () => {
            try {
              await updateCropStatus(crop.id, option.value);
              Alert.alert('Success', 'Crop status updated successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to update status.');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDelete = () => {
    if (!crop) return;

    Alert.alert(
      'Delete Crop',
      'Are you sure you want to delete this crop? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCrop(crop.id);
              Alert.alert('Success', 'Crop deleted successfully!', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete crop.');
            }
          },
        },
      ]
    );
  };

const handleAddInput = () => {
  if (!cropId) return;
  router.push(`/(farmer)/crops/addInput?cropId=${cropId}` as any);
};

const handleAddObservation = () => {
  if (!cropId) return;
  router.push(`/(farmer)/crops/addObservation?cropId=${cropId}` as any);
};

const handleRecordHarvest = () => {
  if (!cropId) return;
  router.push(`/(farmer)/crops/harvest-history?cropId=${cropId}` as any);
};


  // Show loading state
  if (isLoading && !crop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading crop details...</Text>
      </View>
    );
  }

  // Show error state
  if (detailError || !crop) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>
          {detailError || 'Crop not found'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusKey = crop.status as keyof typeof CROP_STATUS_CONFIG;
  const statusConfig = CROP_STATUS_CONFIG[statusKey];
  const daysProgress = Math.max(0, crop.days_since_planting);
  const totalDays = daysProgress + Math.max(0, crop.days_until_harvest);
  const progress = totalDays > 0 ? (daysProgress / totalDays) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[statusConfig.color, withOpacity(statusConfig.color, 0.8)]}
        style={[styles.header, { paddingTop: insets.top + spacing.xs }]}
      >
        <View style={styles.headerTop}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed
              ]}
              onPress={() => router.push(`/(farmer)/crops/edit-crop?id=${cropId}` as any)}
            >
              <Ionicons name="create-outline" size={24} color={colors.white} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed
              ]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.cropInfo}>
            <View style={styles.cropTitleSection}>
              <Text style={styles.cropTitle}>{crop.crop_type_display}</Text>
              <Text style={styles.cropVariety}>{crop.variety}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.statusButton,
                pressed && styles.statusButtonPressed
              ]}
              onPress={handleStatusUpdate}
            >
              <View style={styles.statusBadge}>
                <Ionicons name={statusConfig.icon as any} size={14} color={colors.white} />
                <Text style={styles.statusText}>{statusConfig.label}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.white} />
              </View>
            </Pressable>
          </View>

          <Text style={styles.cropId}>ID: {crop.crop_id}</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <View style={styles.progressItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.white} />
              <Text style={styles.progressItemText}>
                {crop.days_since_planting}d planted
              </Text>
            </View>
            {crop.days_until_harvest > 0 && (
              <View style={styles.progressItem}>
                <Ionicons name="time-outline" size={14} color={colors.white} />
                <Text style={styles.progressItemText}>
                  {crop.days_until_harvest}d left
                </Text>
              </View>
            )}
            <View style={styles.progressItem}>
              <Ionicons name="resize-outline" size={14} color={colors.white} />
              <Text style={styles.progressItemText}>
                {crop.planted_area} acres
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'inputs' && styles.tabActive]}
            onPress={() => setActiveTab('inputs')}
          >
            <Text style={[styles.tabText, activeTab === 'inputs' && styles.tabTextActive]}>
              Inputs ({inputs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'observations' && styles.tabActive]}
            onPress={() => setActiveTab('observations')}
          >
            <Text style={[styles.tabText, activeTab === 'observations' && styles.tabTextActive]}>
              Observations ({observations.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'timeline' && styles.tabActive]}
            onPress={() => setActiveTab('timeline')}
          >
            <Text style={[styles.tabText, activeTab === 'timeline' && styles.tabTextActive]}>
              Timeline
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && <OverviewTab crop={crop} harvests={harvests} />}
        {activeTab === 'inputs' && <InputsTab inputs={inputs} onAdd={handleAddInput} />}
        {activeTab === 'observations' && (
          <ObservationsTab observations={observations} onAdd={handleAddObservation} />
        )}
        {activeTab === 'timeline' && <TimelineTab events={timeline} />}
      </ScrollView>

      {/* Quick Actions */}
      <View style={[styles.quickActions, { paddingBottom: insets.bottom || spacing.md }]}>
        {crop.status !== 'harvested' && crop.status !== 'sold' && (
          <>
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed
              ]} 
              onPress={handleAddInput}
            >
              <Ionicons name="flask-outline" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Add Input</Text>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed
              ]} 
              onPress={handleAddObservation}
            >
              <Ionicons name="eye-outline" size={20} color={colors.info} />
              <Text style={styles.actionButtonText}>Observe</Text>
            </Pressable>
          </>
        )}
        {(crop.status === 'matured' || crop.status === 'harvested') &&
          harvests.length === 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonPrimary,
                pressed && styles.actionButtonPrimaryPressed
              ]}
              onPress={handleRecordHarvest}
            >
              <Ionicons name="checkmark-done-outline" size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Record Harvest
              </Text>
            </Pressable>
          )}
      </View>
    </View>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ crop, harvests }: { crop: any; harvests: any[] }) {
  const latestHarvest = harvests[0];

  return (
    <View style={styles.tabContent}>
      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>
            {new Date(crop.planting_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
          <Text style={styles.statLabel}>Planted</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: withOpacity(colors.accent, 0.1) }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.accent} />
          </View>
          <Text style={styles.statValue}>
            {new Date(crop.expected_harvest_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
          <Text style={styles.statLabel}>Expected Harvest</Text>
        </View>

        {crop.estimated_yield && (
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: withOpacity(colors.success, 0.1) }]}>
              <Ionicons name="trending-up-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{crop.estimated_yield}</Text>
            <Text style={styles.statLabel}>Est. Yield (qt)</Text>
          </View>
        )}

        {latestHarvest && (
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: withOpacity(colors.info, 0.1) }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{latestHarvest.total_yield}</Text>
            <Text style={styles.statLabel}>Actual Yield (qt)</Text>
          </View>
        )}
      </View>

      {/* Location */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Location</Text>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationAddress}>{crop.location_address || 'No address provided'}</Text>
          <Text style={styles.locationDistrict}>
            {crop.district}, {crop.state}
          </Text>
          {crop.latitude && crop.longitude && (
            <Text style={styles.locationCoords}>
              Coordinates: {typeof crop.latitude === 'number' 
                ? crop.latitude.toFixed(6) 
                : parseFloat(crop.latitude).toFixed(6)}, {typeof crop.longitude === 'number'
                ? crop.longitude.toFixed(6)
                : parseFloat(crop.longitude).toFixed(6)}
            </Text>
          )}
        </View>
      </View>

      {/* Harvest Record */}
      {latestHarvest && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={20} color={colors.success} />
            <Text style={styles.cardTitle}>Harvest Details</Text>
          </View>
          <View style={styles.harvestGrid}>
            <View style={styles.harvestItem}>
              <Text style={styles.harvestLabel}>Total Yield</Text>
              <Text style={styles.harvestValue}>{latestHarvest.total_yield} qt</Text>
            </View>
            <View style={styles.harvestItem}>
              <Text style={styles.harvestLabel}>Oil Content</Text>
              <Text style={styles.harvestValue}>{latestHarvest.oil_content}%</Text>
            </View>
            <View style={styles.harvestItem}>
              <Text style={styles.harvestLabel}>Moisture</Text>
              <Text style={styles.harvestValue}>{latestHarvest.moisture_level}%</Text>
            </View>
            <View style={styles.harvestItem}>
              <Text style={styles.harvestLabel}>Quality</Text>
              <View style={styles.gradeTag}>
                <Text style={styles.gradeText}>Grade {latestHarvest.quality_grade}</Text>
              </View>
            </View>
          </View>
          {latestHarvest.total_revenue && (
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>
                ₹{latestHarvest.total_revenue.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Farmer Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person" size={20} color={colors.info} />
          <Text style={styles.cardTitle}>Farmer Information</Text>
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{crop.farmer_name}</Text>
          {crop.fpo_name && (
            <Text style={styles.fpoName}>FPO: {crop.fpo_name}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// INPUTS TAB
// ============================================================================

function InputsTab({ inputs, onAdd }: { inputs: any[]; onAdd: () => void }) {
  const totalCost = inputs.reduce((sum, input) => sum + (input.cost || 0), 0);

  return (
    <View style={styles.tabContent}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Ionicons name="flask" size={24} color={colors.primary} />
          <Text style={styles.summaryValue}>{inputs.length}</Text>
          <Text style={styles.summaryLabel}>Total Inputs</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="cash" size={24} color={colors.error} />
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            ₹{totalCost.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summaryLabel}>Total Cost</Text>
        </View>
      </View>

      {/* Inputs List */}
      {inputs.length > 0 ? (
        inputs.map((input) => (
          <View key={input.id} style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <View style={[
                styles.inputIcon,
                { backgroundColor: withOpacity(getInputColor(input.input_type), 0.1) }
              ]}>
                <Ionicons
                  name={getInputIcon(input.input_type)}
                  size={20}
                  color={getInputColor(input.input_type)}
                />
              </View>
              <View style={styles.inputInfo}>
                <Text style={styles.inputName}>{input.input_name}</Text>
                <Text style={styles.inputType}>{input.input_type_display}</Text>
              </View>
              {input.cost && (
                <Text style={styles.inputCost}>₹{input.cost.toLocaleString('en-IN')}</Text>
              )}
            </View>
            <View style={styles.inputDetails}>
              <View style={styles.inputDetail}>
                <Ionicons name="cube-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.inputDetailText}>
                  {input.quantity} {input.unit}
                </Text>
              </View>
              <View style={styles.inputDetail}>
                <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.inputDetailText}>
                  {new Date(input.application_date).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </View>
            {input.notes && (
              <Text style={styles.inputNotes}>{input.notes}</Text>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="flask-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Inputs Added</Text>
          <Text style={styles.emptySubtitle}>
            Track fertilizers, pesticides, and other inputs
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Text style={styles.emptyButtonText}>Add First Input</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// OBSERVATIONS TAB
// ============================================================================

function ObservationsTab({ observations, onAdd }: { observations: any[]; onAdd: () => void }) {
  return (
    <View style={styles.tabContent}>
      {observations.length > 0 ? (
        observations.map((obs) => (
          <View key={obs.id} style={styles.observationCard}>
            <View style={styles.observationHeader}>
              <View style={styles.observationDate}>
                <Ionicons name="calendar" size={16} color={colors.primary} />
                <Text style={styles.observationDateText}>
                  {new Date(obs.observation_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              {(obs.pest_infestation || obs.disease_detected) && (
                <View style={styles.alertBadge}>
                  <Ionicons name="warning" size={14} color={colors.error} />
                  <Text style={styles.alertText}>Alert</Text>
                </View>
              )}
            </View>

            {obs.image_url && (
              <Image source={{ uri: obs.image_url }} style={styles.observationImage} />
            )}

            <View style={styles.observationMetrics}>
              {obs.plant_height && (
                <View style={styles.metricChip}>
                  <Ionicons name="resize-outline" size={14} color={colors.primary} />
                  <Text style={styles.metricText}>{obs.plant_height} cm</Text>
                </View>
              )}
              {obs.soil_moisture && (
                <View style={styles.metricChip}>
                  <Ionicons name="water-outline" size={14} color={colors.info} />
                  <Text style={styles.metricText}>{obs.soil_moisture}%</Text>
                </View>
              )}
              {obs.temperature && (
                <View style={styles.metricChip}>
                  <Ionicons name="thermometer-outline" size={14} color={colors.warning} />
                  <Text style={styles.metricText}>{obs.temperature}°C</Text>
                </View>
              )}
            </View>

            {obs.disease_detected && obs.disease_name && (
              <View style={styles.diseaseAlert}>
                <Ionicons name="bug" size={20} color={colors.error} />
                <Text style={styles.diseaseText}>{obs.disease_name}</Text>
              </View>
            )}

            {obs.notes && (
              <Text style={styles.observationNotes}>{obs.notes}</Text>
            )}

            <Text style={styles.observationRecorder}>
              By {obs.recorded_by_name}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="eye-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Observations</Text>
          <Text style={styles.emptySubtitle}>
            Record plant health, weather, and growth conditions
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Text style={styles.emptyButtonText}>Add First Observation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// TIMELINE TAB
// ============================================================================

function TimelineTab({ events }: { events: any[] }) {
  return (
    <View style={styles.tabContent}>
      {events.length > 0 ? (
        <View style={styles.timeline}>
          {events.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < events.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineEvent}>{event.event}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(event.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                {event.notes && (
                  <Text style={styles.timelineNotes}>{event.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Timeline Events</Text>
          <Text style={styles.emptySubtitle}>
            Timeline will be generated from your activities
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInputIcon(type: string): any {
  const icons: { [key: string]: any } = {
    fertilizer: 'flask-outline',
    pesticide: 'bug-outline',
    herbicide: 'leaf-outline',
    seed: 'water-outline',
    irrigation: 'water-outline',
  };
  return icons[type] || 'cube-outline';
}

function getInputColor(type: string): string {
  const colors_map: { [key: string]: string } = {
    fertilizer: colors.success,
    pesticide: colors.error,
    herbicide: colors.warning,
    seed: colors.primary,
    irrigation: colors.info,
  };
  return colors_map[type] || colors.gray[500];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
  header: {
    paddingBottom: spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(colors.white, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    backgroundColor: withOpacity(colors.white, 0.3),
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  cropInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cropTitleSection: {
    flex: 1,
  },
  cropTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  cropVariety: {
    ...typography.body,
    color: withOpacity(colors.white, 0.9),
    fontSize: 14,
  },
  cropId: {
    ...typography.caption,
    color: withOpacity(colors.white, 0.8),
    fontSize: 11,
  },
  statusButton: {
    marginLeft: spacing.sm,
  },
  statusButtonPressed: {
    opacity: 0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withOpacity(colors.white, 0.25),
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: withOpacity(colors.white, 0.25),
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressItemText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    fontSize: 11,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  tabContent: {
    gap: spacing.md,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  // Location
  locationInfo: {
    gap: spacing.xs,
  },
  locationAddress: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  locationDistrict: {
    ...typography.body,
    color: colors.text.secondary,
  },
  locationCoords: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },

  // Harvest
  harvestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  harvestItem: {
    flex: 1,
    minWidth: '45%',
  },
  harvestLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  harvestValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  gradeTag: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  gradeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  revenueCard: {
    backgroundColor: withOpacity(colors.success, 0.1),
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  revenueValue: {
    ...typography.h4,
    color: colors.success,
    fontWeight: '700',
  },

  // Farmer Info
  farmerInfo: {
    gap: spacing.xs,
  },
  farmerName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  fpoName: {
    ...typography.body,
    color: colors.text.secondary,
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },

  // Input Card
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputInfo: {
    flex: 1,
  },
  inputName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  inputType: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  inputCost: {
    ...typography.body,
    color: colors.error,
    fontWeight: '700',
  },
  inputDetails: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  inputDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputDetailText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  inputNotes: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },

  // Observation Card
  observationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  observationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  observationDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  observationDateText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withOpacity(colors.error, 0.1),
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  alertText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 11,
  },
  observationImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  observationMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  metricText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  diseaseAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: withOpacity(colors.error, 0.1),
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  diseaseText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  observationNotes: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  observationRecorder: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },

  // Timeline
  timeline: {
    paddingLeft: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: spacing.lg,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  timelineEvent: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  timelineNotes: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    ...typography.button,
    color: colors.white,
  },

  // Quick Actions
  quickActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  actionButtonPressed: {
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonPrimaryPressed: {
    backgroundColor: colors.primaryDark,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  },
});