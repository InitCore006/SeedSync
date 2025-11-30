import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import { useAuth } from '@/hooks/useAuth';
import PriceAlertCard from '@/components/market/PriceAlertCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function PriceAlertsScreen() {
  const { user } = useAuth();
  const {
    priceAlerts,
    crops,
    isLoading,
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert,
  } = useMarket();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPriceAlerts(user.id);
    }
  }, [user]);

  const handleCreateAlert = async () => {
    if (!selectedCrop || !targetPrice) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const crop = crops.find((c) => c.id === selectedCrop);
    if (!crop) return;

    setCreating(true);
    try {
      await createPriceAlert({
        userId: user?.id || 'user123',
        cropId: crop.id,
        cropName: crop.name,
        targetPrice: parseFloat(targetPrice),
        condition,
        isActive: true,
      });

      setShowCreateModal(false);
      setSelectedCrop('');
      setTargetPrice('');
      setCondition('above');
      Alert.alert('Success', 'Price alert created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create price alert');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    Alert.alert('Delete Alert', 'Are you sure you want to delete this alert?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePriceAlert(alertId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete alert');
          }
        },
      },
    ]);
  };

  const activeAlerts = priceAlerts.filter((a) => a.isActive);
  const triggeredAlerts = priceAlerts.filter((a) => a.triggeredAt);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Price Alerts</Text>
        <Pressable onPress={() => setShowCreateModal(true)}>
          <Text style={styles.addButton}>+</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeAlerts.length}</Text>
                <Text style={styles.statLabel}>Active Alerts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{triggeredAlerts.length}</Text>
                <Text style={styles.statLabel}>Triggered</Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Get notified when crop prices reach your target. Stay informed and make better
                selling decisions.
              </Text>
            </View>

            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Alerts</Text>
                {activeAlerts.map((alert) => (
                  <PriceAlertCard
                    key={alert.id}
                    alert={alert}
                    onDelete={() => handleDeleteAlert(alert.id)}
                  />
                ))}
              </View>
            )}

            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently Triggered</Text>
                {triggeredAlerts.map((alert) => (
                  <PriceAlertCard
                    key={alert.id}
                    alert={alert}
                    onDelete={() => handleDeleteAlert(alert.id)}
                  />
                ))}
              </View>
            )}

            {/* Empty State */}
            {priceAlerts.length === 0 && (
              <EmptyState
                icon="🔔"
                title="No Price Alerts"
                description="Create alerts to get notified when prices reach your target"
                actionLabel="Create Alert"
                onAction={() => setShowCreateModal(true)}
              />
            )}
          </View>
        </ScrollView>
      )}

      {/* Create Alert Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Price Alert</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {/* Crop Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Crop</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cropSelector}
                >
                  {crops.map((crop) => (
                    <Pressable
                      key={crop.id}
                      style={[
                        styles.cropOption,
                        selectedCrop === crop.id && styles.cropOptionActive,
                      ]}
                      onPress={() => setSelectedCrop(crop.id)}
                    >
                      <Text style={styles.cropOptionIcon}>{crop.icon}</Text>
                      <Text
                        style={[
                          styles.cropOptionText,
                          selectedCrop === crop.id && styles.cropOptionTextActive,
                        ]}
                      >
                        {crop.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Condition */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alert Condition</Text>
                <View style={styles.conditionSelector}>
                  <Pressable
                    style={[
                      styles.conditionButton,
                      condition === 'above' && styles.conditionButtonActive,
                    ]}
                    onPress={() => setCondition('above')}
                  >
                    <Text
                      style={[
                        styles.conditionButtonText,
                        condition === 'above' && styles.conditionButtonTextActive,
                      ]}
                    >
                      📈 Above
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.conditionButton,
                      condition === 'below' && styles.conditionButtonActive,
                    ]}
                    onPress={() => setCondition('below')}
                  >
                    <Text
                      style={[
                        styles.conditionButtonText,
                        condition === 'below' && styles.conditionButtonTextActive,
                      ]}
                    >
                      📉 Below
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Target Price */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter target price"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="numeric"
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                />
              </View>

              {/* Create Button */}
              <Pressable
                style={[styles.createButton, creating && styles.createButtonDisabled]}
                onPress={handleCreateAlert}
                disabled={creating}
              >
                <Text style={styles.createButtonText}>
                  {creating ? 'Creating...' : 'Create Alert'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.surface,
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
  addButton: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  modalBody: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cropSelector: {
    gap: spacing.sm,
  },
  cropOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.background,
    minWidth: 80,
  },
  cropOptionActive: {
    backgroundColor: colors.primary,
  },
  cropOptionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  cropOptionText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  cropOptionTextActive: {
    color: colors.surface,
  },
  conditionSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  conditionButtonActive: {
    backgroundColor: colors.primary,
  },
  conditionButtonText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  conditionButtonTextActive: {
    color: colors.surface,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
});