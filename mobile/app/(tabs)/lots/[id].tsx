import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ImageStyle,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Loading, Button } from '@/components';
import { lotsAPI } from '@/services/lotsService';
import { ProcurementLot } from '@/types/api';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';

export default function LotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [lot, setLot] = useState<ProcurementLot | null>(null);
  const [loading, setLoading] = useState(true);

  const isMyLot = lot?.farmer === user?.id;

  const fetchLotDetails = async () => {
    try {
      const lotRes = await lotsAPI.getLot(id);
      setLot(lotRes.data);
      
      // Increment view count (don't await, fire and forget)
      if (lotRes.data && !isMyLot) {
        lotsAPI.incrementViews(id).catch(err => console.log('Failed to increment views:', err));
      }
    } catch (error) {
      console.error('Failed to load lot details:', error);
      Alert.alert('Error', 'Failed to load lot details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotDetails();
  }, [id]);
  
  const handleDeleteLot = () => {
    Alert.alert(
      'Delete Lot',
      'Are you sure you want to delete this lot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await lotsAPI.deleteLot(id);
              Alert.alert('Success', 'Lot deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete lot');
            }
          },
        },
      ]
    );
  };

  if (loading || !lot) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      {lot.images && lot.images.length > 0 && (
        <Image source={{ uri: lot.images[0].image }} style={styles.image} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.cropType}>
            {lot.crop_type_display || lot.crop_type}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>
              {lot.status_display || lot.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {lot.crop_variety && (
          <Text style={styles.variety}>{lot.crop_variety}</Text>
        )}

        {/* Lot Number */}
        {lot.lot_number && (
          <Text style={styles.lotNumber}>Lot #{lot.lot_number}</Text>
        )}

        {/* FPO Info Card - If FPO Aggregated */}
        {lot.listing_type === 'fpo_aggregated' && lot.fpo_name && (
          <View style={styles.fpoCard}>
            <View style={styles.fpoHeader}>
              <Ionicons name="business" size={24} color={COLORS.primary} />
              <View style={styles.fpoHeaderText}>
                <Text style={styles.fpoTitle}>FPO Aggregated Lot</Text>
                <Text style={styles.fpoName}>{lot.fpo_name}</Text>
              </View>
            </View>
            {lot.warehouse_name && (
              <View style={styles.fpoDetail}>
                <Ionicons name="location" size={16} color={COLORS.text.secondary} />
                <Text style={styles.fpoDetailText}>Warehouse: {lot.warehouse_name}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>
              {formatQuantity(lot.quantity_quintals)} Quintals
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price/Quintal</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(lot.expected_price_per_quintal)}
            </Text>
          </View>
          {lot.harvest_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Harvest Date</Text>
              <Text style={styles.infoValue}>{formatDate(lot.harvest_date)}</Text>
            </View>
          )}
          {lot.warehouse_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Warehouse</Text>
              <Text style={styles.infoValue}>{lot.warehouse_name}</Text>
            </View>
          )}
          {lot.pickup_address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pickup Location</Text>
              <Text style={styles.infoValue}>{lot.pickup_address}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Listed</Text>
            <Text style={styles.infoValue}>{formatDate(lot.created_at)}</Text>
          </View>
        </View>

        {lot.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{lot.description}</Text>
          </View>
        )}

        {/* Farmer Info (if viewing someone else's lot) */}
        {!isMyLot && lot.farmer_name && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farmer Information</Text>
            <View style={styles.farmerCard}>
              <Ionicons name="person-circle" size={48} color={COLORS.primary} />
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{lot.farmer_name}</Text>
                {lot.fpo_name && (
                  <Text style={styles.farmerFpo}>Member of {lot.fpo_name}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons for My Lots */}
        {isMyLot && (
          <View style={styles.actionButtons}>
            <Button
              title="Edit Lot"
              onPress={() => router.push(`/(tabs)/lots/edit-lot?id=${id}`)}
              variant="outline"
            />
            <Button
              title="Delete Lot"
              onPress={handleDeleteLot}
              variant="outline"
              style={{ borderColor: COLORS.error }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: 250,
  } as ImageStyle,
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropType: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  variety: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  lotNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  qualityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
    flex: 1,
  },
  qualityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  farmerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  farmerFpo: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  actionButtons: {
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  fpoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '08',
    padding: 16,
    marginBottom: 20,
  },
  fpoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  fpoHeaderText: {
    flex: 1,
  },
  fpoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  fpoName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  fpoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fpoDetailText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});
