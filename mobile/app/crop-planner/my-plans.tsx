import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Loading } from '@/components';
import { cropPlannerService, CropPlanResponse } from '@/services/cropPlannerService';

const CROP_ICONS: Record<string, string> = {
  groundnut: '🥜',
  soybean: '🫘',
  sunflower: '🌻',
  mustard: '🌼',
  safflower: '🌸',
  sesame: '🌾',
  linseed: '🌿',
  niger: '🌱',
  castor: '🪴',
};

const STATUS_COLORS: Record<string, string> = {
  planned: '#3b82f6',
  sowing: '#f59e0b',
  growing: '#10b981',
  ready_to_harvest: '#8b5cf6',
  harvested: '#059669',
  converted_to_lot: '#6b7280',
};

export default function CropPlansScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [actualYieldInput, setActualYieldInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const loadPlans = async () => {
    try {
      console.log('🔄 Fetching crop plans...');
      const fetchedPlans = await cropPlannerService.getCropPlans();
      console.log('✅ Fetched plans:', fetchedPlans.length);
      console.log('📦 First plan sample:', JSON.stringify(fetchedPlans[0], null, 2));
      
      // Convert string numbers to actual numbers for calculations
      const parsedPlans = fetchedPlans.map((plan: any) => ({
        ...plan,
        land_acres: parseFloat(plan.land_acres),
        msp_price_per_quintal: parseFloat(plan.msp_price_per_quintal),
        estimated_yield_quintals: parseFloat(plan.estimated_yield_quintals),
        estimated_yield_per_acre: parseFloat(plan.estimated_yield_per_acre),
        gross_revenue: parseFloat(plan.gross_revenue),
        seed_cost: parseFloat(plan.seed_cost),
        fertilizer_cost: parseFloat(plan.fertilizer_cost),
        pesticide_cost: parseFloat(plan.pesticide_cost),
        labor_cost: parseFloat(plan.labor_cost),
        irrigation_cost: parseFloat(plan.irrigation_cost),
        total_input_costs: parseFloat(plan.total_input_costs),
        net_profit: parseFloat(plan.net_profit),
        profit_per_acre: parseFloat(plan.profit_per_acre),
        roi_percentage: parseFloat(plan.roi_percentage),
        actual_yield_quintals: plan.actual_yield_quintals ? parseFloat(plan.actual_yield_quintals) : null,
      }));
      
      console.log('🎯 Parsed plans:', parsedPlans.length);
      console.log('💰 First plan net_profit:', parsedPlans[0]?.net_profit);
      setPlans(parsedPlans);
    } catch (error: any) {
      console.error('❌ Load plans error:', error);
      console.error('❌ Error details:', error.message);
      Alert.alert('Error', 'Failed to load crop plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    return {
      backgroundColor: STATUS_COLORS[status] || '#6b7280',
    };
  };

  const handleUpdateStatus = (plan: any) => {
    const statusOptions = [
      { label: 'Planned', value: 'planned' },
      { label: 'Sowing', value: 'sowing' },
      { label: 'Growing', value: 'growing' },
      { label: 'Ready to Harvest', value: 'ready_to_harvest' },
      { label: 'Harvested', value: 'harvested' },
    ];

    const buttons = statusOptions.map((option) => ({
      text: option.label,
      onPress: async () => {
        // If status is harvested, show modal for actual yield input
        if (option.value === 'harvested') {
          setSelectedPlan({ ...plan, newStatus: option.value });
          setActualYieldInput(plan.estimated_yield_quintals.toFixed(1));
          setShowYieldModal(true);
        } else {
          // For other statuses, update without yield
          try {
            await cropPlannerService.updateCropPlanStatus(plan.id, option.value);
            Alert.alert('Success', `Status updated to ${option.label}`);
            loadPlans();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update status');
          }
        }
      },
    }));

    buttons.push({ text: 'Cancel', onPress: () => {}, style: 'cancel' } as any);

    Alert.alert('Update Status', `Select new status for ${plan.crop_name}:`, buttons);
  };

  const handleSubmitYield = async () => {
    if (!selectedPlan) return;

    const yieldValue = parseFloat(actualYieldInput);
    if (!yieldValue || yieldValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid yield value greater than 0');
      return;
    }

    try {
      await cropPlannerService.updateCropPlanStatus(
        selectedPlan.id,
        selectedPlan.newStatus,
        yieldValue
      );
      setShowYieldModal(false);
      Alert.alert('Success', `Status updated to Harvested with yield: ${yieldValue} quintals`);
      loadPlans();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const handleConvertToLot = (plan: any) => {
    // Check if actual yield is recorded
    if (!plan.actual_yield_quintals) {
      Alert.alert(
        'Actual Yield Required',
        `Please record the actual yield before converting to lot.\n\n` +
        `Update the status to "Harvested" with actual yield first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Convert to Lot',
      `Convert ${plan.crop_name} (${plan.actual_yield_quintals.toFixed(1)} quintals) to a procurement lot?\n\n` +
      `This will create a lot that can be listed in the marketplace.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              const result = await cropPlannerService.convertPlanToLot(plan.id);
              Alert.alert(
                'Success! 🎉',
                `Lot created successfully!\n\nLot Number: ${result.lot_number}\n\n` +
                `You can now view and manage this lot in the marketplace.`,
                [
                  {
                    text: 'View Lot',
                    onPress: () => router.push(`/lots/${result.lot_id}`),
                  },
                  { text: 'OK' },
                ]
              );
              loadPlans();
            } catch (error: any) {
              console.error('❌ Convert to Lot Error:', error);
              Alert.alert('Error', error.message || 'Failed to convert to lot');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading crop plans..." />;
  }

  return (
    <View style={styles.container}>
      <AppHeader title="My Crop Plans" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Crop Plans Yet</Text>
            <Text style={styles.emptyText}>
              Start by analyzing your land and getting AI-powered crop recommendations
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/crop-planner')}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Crop Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Ionicons name="leaf" size={24} color={COLORS.primary} />
                <Text style={styles.summaryValue}>{plans.length}</Text>
                <Text style={styles.summaryLabel}>Total Plans</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="trending-up" size={24} color="#10b981" />
                <Text style={styles.summaryValue}>
                  {plans.filter(p => p.status === 'growing').length}
                </Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="cash" size={24} color="#f59e0b" />
                <Text style={styles.summaryValue}>
                  {formatCurrency(plans.reduce((sum, p) => sum + p.net_profit, 0))}
                </Text>
                <Text style={styles.summaryLabel}>Total Profit</Text>
              </View>
            </View>

            {/* Crop Plans List */}
            <Text style={styles.sectionTitle}>Your Crop Plans</Text>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropEmoji}>
                      {CROP_ICONS[plan.crop_type] || '🌱'}
                    </Text>
                    <View>
                      <Text style={styles.cropName}>{plan.crop_name}</Text>
                      <Text style={styles.cropDetails}>
                        {plan.land_acres} acres · {plan.season_display}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(plan.status)]}>
                    <Text style={styles.statusText}>{plan.status_display}</Text>
                  </View>
                </View>

                <View style={styles.planStats}>
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="calendar" size={16} color="#6b7280" />
                      <Text style={styles.statText}>Sowing: {formatDate(plan.sowing_date)}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text style={styles.statText}>Harvest: {formatDate(plan.expected_harvest_date)}</Text>
                    </View>
                  </View>

                  {plan.days_until_harvest !== null && plan.days_until_harvest >= 0 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${plan.progress_percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {plan.days_until_harvest} days until harvest · {plan.progress_percentage}%
                      </Text>
                    </View>
                  )}

                  <View style={styles.financialRow}>
                    <View style={styles.financialItem}>
                      <Text style={styles.financialLabel}>Estimated Yield</Text>
                      <Text style={styles.financialValue}>
                        {plan.estimated_yield_quintals.toFixed(1)} Q
                      </Text>
                    </View>
                    <View style={styles.financialDivider} />
                    <View style={styles.financialItem}>
                      <Text style={styles.financialLabel}>MSP</Text>
                      <Text style={styles.financialValue}>
                        ₹{plan.msp_price_per_quintal}/Q
                      </Text>
                    </View>
                    <View style={styles.financialDivider} />
                    <View style={styles.financialItem}>
                      <Text style={styles.financialLabel}>Net Profit</Text>
                      <Text style={[styles.financialValue, { color: COLORS.success }]}>
                        {formatCurrency(plan.net_profit)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.roiContainer}>
                    <Text style={styles.roiText}>
                      ROI: <Text style={styles.roiValue}>{plan.roi_percentage.toFixed(1)}%</Text>
                    </Text>
                  </View>
                </View>

                {plan.notes && (
                  <View style={styles.notesContainer}>
                    <Ionicons name="information-circle" size={16} color="#6b7280" />
                    <Text style={styles.notesText} numberOfLines={2}>
                      {plan.notes}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {plan.status !== 'converted_to_lot' && plan.status !== 'harvested' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.updateButton]}
                      onPress={() => handleUpdateStatus(plan)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Update Status</Text>
                    </TouchableOpacity>
                  )}
                  
                  {plan.status === 'harvested' && !plan.converted_lot && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.convertButton]}
                      onPress={() => handleConvertToLot(plan)}
                    >
                      <Ionicons name="cube" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Convert to Lot</Text>
                    </TouchableOpacity>
                  )}

                  {plan.converted_lot && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewLotButton]}
                      onPress={() => router.push(`/lots/${plan.converted_lot}`)}
                    >
                      <Ionicons name="eye" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>View Lot</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {plans.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/crop-planner')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Yield Input Modal */}
      <Modal
        visible={showYieldModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYieldModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Actual Yield</Text>
            <Text style={styles.modalSubtitle}>
              {selectedPlan?.crop_name}
            </Text>
            <Text style={styles.modalHint}>
              Estimated: {selectedPlan?.estimated_yield_quintals?.toFixed(1)} quintals
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={actualYieldInput}
                onChangeText={setActualYieldInput}
                keyboardType="decimal-pad"
                placeholder="Enter actual yield"
                autoFocus
              />
              <Text style={styles.inputUnit}>quintals</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowYieldModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitYield}
              >
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cropDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  planStats: {
    marginTop: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  financialDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  roiContainer: {
    alignItems: 'center',
  },
  roiText: {
    fontSize: 13,
    color: '#6b7280',
  },
  roiValue: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  notesText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
  },
  convertButton: {
    backgroundColor: '#10b981',
  },
  viewLotButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#f9fafb',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    paddingVertical: 14,
  },
  inputUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
