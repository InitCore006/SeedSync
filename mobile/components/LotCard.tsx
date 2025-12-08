import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { ProcurementLot } from '@/types/api';
import { COLORS } from '@/constants/colors';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';

interface LotCardProps {
  lot: ProcurementLot;
  onPress?: () => void;
  style?: ViewStyle;
}

export const LotCard: React.FC<LotCardProps> = ({ lot, onPress, style }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'bidding':
        return COLORS.warning;
      case 'sold':
        return COLORS.primary;
      case 'delivered':
        return COLORS.secondary;
      default:
        return COLORS.secondary;
    }
  };

  const getStatusText = (status: string) => {
    return lot.status_display || status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get primary image URL
  const primaryImage = lot.images && lot.images.length > 0 
    ? lot.images.find(img => img.is_primary)?.image || lot.images[0]?.image
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {primaryImage && (
        <Image source={{ uri: primaryImage }} style={styles.image} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.cropType}>
            {lot.crop_type_display || lot.crop_type}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(lot.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(lot.status)}</Text>
          </View>
        </View>

        {lot.crop_variety && (
          <Text style={styles.variety} numberOfLines={1}>
            {lot.crop_variety}
          </Text>
        )}

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>
            {formatQuantity(lot.quantity_quintals)} Quintals
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Price/Quintal:</Text>
          <Text style={styles.value}>
            {formatCurrency(lot.expected_price_per_quintal)}
          </Text>
        </View>

        {lot.warehouse_name && (
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Warehouse:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {lot.warehouse_name}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>
            {formatDate(lot.created_at)}
          </Text>
          {lot.lot_number && (
            <Text style={styles.lotNumber}>{lot.lot_number}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropType: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  variety: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  date: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  lotNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
