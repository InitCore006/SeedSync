import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Shipment } from '@/types/api';
import { getCropIcon, getStatusInfo } from '@/constants/crops';

interface ShipmentCardProps {
  shipment: Shipment;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ 
  shipment, 
  onPress, 
  onAccept, 
  onReject,
  showActions = false 
}) => {
  const statusInfo = getStatusInfo(shipment.status, 'shipment');
  const cropIcon = shipment.lot_details ? getCropIcon(shipment.lot_details.crop_type) : '📦';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.shipmentInfo}>
          <Text style={styles.cropIcon}>{cropIcon}</Text>
          <View>
            <Text style={styles.lotNumber}>{shipment.lot_number || 'Lot'}</Text>
            {shipment.lot_details && (
              <Text style={styles.quantity}>{shipment.lot_details.quantity_quintals} Quintals</Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={COLORS.success} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {shipment.pickup_location}
            </Text>
          </View>
        </View>
        <Ionicons name="arrow-down" size={16} color={COLORS.text.tertiary} style={styles.arrow} />
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={COLORS.error} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Delivery</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {shipment.delivery_location}
            </Text>
          </View>
        </View>
      </View>

      {shipment.distance_km && (
        <View style={styles.infoRow}>
          <Ionicons name="navigate" size={16} color={COLORS.text.secondary} />
          <Text style={styles.infoText}>{shipment.distance_km} km</Text>
        </View>
      )}

      {shipment.scheduled_pickup_date && (
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.infoText}>
            Pickup: {new Date(shipment.scheduled_pickup_date).toLocaleDateString()}
          </Text>
        </View>
      )}

      {shipment.farmer_name && (
        <View style={styles.contactRow}>
          <Ionicons name="person" size={16} color={COLORS.text.secondary} />
          <Text style={styles.contactText}>{shipment.farmer_name}</Text>
          {shipment.farmer_phone && (
            <Ionicons name="call" size={16} color={COLORS.primary} />
          )}
        </View>
      )}

      {showActions && shipment.status === 'pending' && onAccept && onReject && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={(e) => {
              e.stopPropagation();
              onReject();
            }}
          >
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]} 
            onPress={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <Text style={styles.actionText}>Accept Trip</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shipmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  lotNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  quantity: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationSection: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
