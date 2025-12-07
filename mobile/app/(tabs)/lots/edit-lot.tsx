import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { lotsAPI } from '@/services/lotsService';
import { useLotsStore } from '@/store/lotsStore';
import { ProcurementLot } from '@/types/api';

export default function EditLotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateLot } = useLotsStore();
  
  const [lot, setLot] = useState<ProcurementLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    quantity_quintals: '',
    expected_price_per_quintal: '',
    description: '',
    storage_conditions: '',
    pickup_address: '',
  });

  useEffect(() => {
    loadLot();
  }, [id]);

  const loadLot = async () => {
    try {
      setLoading(true);
      const response = await lotsAPI.getLot(id!);
      const lotData = response.data;
      setLot(lotData);
      
      // Pre-fill form with existing data
      setFormData({
        quantity_quintals: lotData.quantity_quintals?.toString() || '',
        expected_price_per_quintal: lotData.expected_price_per_quintal?.toString() || '',
        description: lotData.description || '',
        storage_conditions: lotData.storage_conditions || '',
        pickup_address: lotData.pickup_address || '',
      });
    } catch (error: any) {
      console.error('Failed to load lot:', error);
      Alert.alert('Error', 'Failed to load lot details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.quantity_quintals || !formData.expected_price_per_quintal) {
      Alert.alert('Required Fields', 'Please fill quantity and expected price');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        quantity_quintals: parseFloat(formData.quantity_quintals),
        expected_price_per_quintal: parseFloat(formData.expected_price_per_quintal),
        description: formData.description || '',
        storage_conditions: formData.storage_conditions || '',
        pickup_address: formData.pickup_address || '',
      };

      const response = await lotsAPI.updateLot(id!, updateData);
      const updatedLot = response.data;
      
      // Update store
      updateLot(id!, updatedLot);

      Alert.alert(
        'Success',
        'Lot updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Failed to update lot:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update lot';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading lot details...</Text>
      </View>
    );
  }

  if (!lot) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Edit Lot</Text>
            <Text style={styles.lotNumber}>{lot.lot_number}</Text>
          </View>
        </View>

        <View style={styles.readOnlySection}>
          <Text style={styles.sectionTitle}>Crop Information (Read-only)</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Crop Type:</Text>
            <Text style={styles.infoValue}>{lot.crop_type_display || lot.crop_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Variety:</Text>
            <Text style={styles.infoValue}>{lot.crop_variety}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Harvest Date:</Text>
            <Text style={styles.infoValue}>{new Date(lot.harvest_date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editable Details</Text>
          
          <Input
            label="Quantity (Quintals) *"
            placeholder="e.g., 50"
            value={formData.quantity_quintals}
            onChangeText={(text) => setFormData({ ...formData, quantity_quintals: text })}
            keyboardType="decimal-pad"
            
          />

          <Input
            label="Expected Price (₹/Quintal) *"
            placeholder="e.g., 7500"
            value={formData.expected_price_per_quintal}
            onChangeText={(text) => setFormData({ ...formData, expected_price_per_quintal: text })}
            keyboardType="decimal-pad"
           
          />

          <Input
            label="Storage Conditions"
            placeholder="How is the crop stored?"
            value={formData.storage_conditions}
            onChangeText={(text) => setFormData({ ...formData, storage_conditions: text })}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Pickup Address"
            placeholder="Complete address for pickup"
            value={formData.pickup_address}
            onChangeText={(text) => setFormData({ ...formData, pickup_address: text })}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Description"
            placeholder="Additional details about your lot"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={saving ? 'Updating...' : 'Update Lot'}
            onPress={handleUpdate}
            disabled={saving}
            loading={saving}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  lotNumber: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 4,
  },
  readOnlySection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});
