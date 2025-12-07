import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { logisticsAPI } from '@/services/logisticsService';
import { Shipment } from '@/types/api';
import { getCropIcon, getCropLabel, getStatusInfo } from '@/constants/crops';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      const response = await logisticsAPI.getShipmentById(parseInt(id));
      setShipment(response.data);
    } catch (error) {
      console.error('Failed to fetch shipment details:', error);
      Alert.alert('Error', 'Failed to load shipment details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const makePhoneCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const openWhatsApp = (number: string) => {
    Linking.openURL(`whatsapp://send?phone=+91${number}`);
  };

  const getDirections = (address: string) => {
    const url = Platform.OS === 'ios' 
      ? `maps:0,0?q=${encodeURIComponent(address)}`
      : `geo:0,0?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleStartTrip = async () => {
    Alert.alert(
      'Start Trip',
      'Are you sure you want to start this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await logisticsAPI.updateShipmentStatus(parseInt(id), {
                status: 'in_transit',
              });
              await fetchShipmentDetails();
              Alert.alert('Success', 'Trip started successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to start trip');
            }
          },
        },
      ]
    );
  };

  const handleMarkPickup = () => {
    router.push(`/trips/pickup/${id}`);
  };

  const handleMarkDelivery = () => {
    router.push(`/trips/delivery/${id}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (!shipment) {
    return null;
  }

  const statusInfo = getStatusInfo('shipment', shipment.status);

  return (
    <ScrollView style={styles.container}>
      {/* Map Section - Placeholder (react-native-maps not installed) */}
      {shipment.pickup_location && shipment.delivery_location && (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapSubtext}>
            Install react-native-maps for map visualization
          </Text>
        </View>
      )}

      {/* Status */}
      <View style={styles.section}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Shipment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipment Details</Text>
        <View style={styles.cropRow}>
          <Text style={styles.cropIcon}>{getCropIcon(shipment.lot.crop_type)}</Text>
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{getCropLabel(shipment.lot.crop_type)}</Text>
            <Text style={styles.lotNumber}>Lot #{shipment.lot.lot_number}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="cube" size={20} color={COLORS.secondary} />
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{shipment.quantity_quintals} Q</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="navigate" size={20} color={COLORS.secondary} />
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{shipment.distance_km} km</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={20} color={COLORS.secondary} />
            <Text style={styles.detailLabel}>Freight</Text>
            <Text style={styles.detailValue}>
              ₹{shipment.freight_charge.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      {/* Pickup Location */}
      <View style={styles.section}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Pickup Location</Text>
        </View>
        <Text style={styles.address}>{shipment.pickup_address}</Text>
        <Text style={styles.dateTime}>
          Scheduled: {new Date(shipment.pickup_date).toLocaleString('en-IN')}
        </Text>
        {shipment.farmer && (
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Ionicons name="person" size={20} color={COLORS.secondary} />
              <View>
                <Text style={styles.contactName}>{shipment.farmer.user.full_name}</Text>
                <Text style={styles.contactPhone}>{shipment.farmer.user.phone_number}</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => makePhoneCall(shipment.farmer.user.phone_number)}
              >
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => openWhatsApp(shipment.farmer.user.phone_number)}
              >
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => getDirections(shipment.pickup_address)}
              >
                <Ionicons name="navigate" size={20} color={COLORS.info} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Delivery Location */}
      <View style={styles.section}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={24} color={COLORS.error} />
          <Text style={styles.sectionTitle}>Delivery Location</Text>
        </View>
        <Text style={styles.address}>{shipment.delivery_address}</Text>
        <Text style={styles.dateTime}>
          Scheduled: {new Date(shipment.delivery_date).toLocaleString('en-IN')}
        </Text>
        {shipment.buyer && (
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Ionicons name="business" size={20} color={COLORS.secondary} />
              <View>
                <Text style={styles.contactName}>{shipment.buyer.user.full_name}</Text>
                <Text style={styles.contactPhone}>{shipment.buyer.user.phone_number}</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => makePhoneCall(shipment.buyer.user.phone_number)}
              >
                <Ionicons name="call" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => getDirections(shipment.delivery_address)}
              >
                <Ionicons name="navigate" size={20} color={COLORS.info} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Timeline */}
      {shipment.pickup_completed_at || shipment.delivery_completed_at && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Booked</Text>
                <Text style={styles.timelineDate}>
                  {new Date(shipment.created_at).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
            {shipment.pickup_completed_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Picked Up</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(shipment.pickup_completed_at).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}
            {shipment.delivery_completed_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Delivered</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(shipment.delivery_completed_at).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {shipment.status === 'confirmed' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTrip}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Start Trip</Text>
          </TouchableOpacity>
        )}
        {shipment.status === 'in_transit' && !shipment.pickup_completed_at && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleMarkPickup}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Mark Pickup Complete</Text>
          </TouchableOpacity>
        )}
        {shipment.pickup_completed_at && shipment.status !== 'delivered' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleMarkDelivery}>
            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Mark Delivery Complete</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapPlaceholder: {
    height: 250,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cropIcon: {
    fontSize: 40,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  lotNumber: {
    fontSize: 13,
    color: COLORS.secondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  address: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  contactPhone: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  actionButtons: {
    padding: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});
