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
      case 'draft':
        return COLORS.textSecondary;
      case 'open':
        return COLORS.success;
      case 'closed':
        return COLORS.error;
      case 'awarded':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {lot.images && lot.images.length > 0 && (
        <Image source={{ uri: lot.images[0] }} style={styles.image} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.cropType}>{lot.crop_type}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(lot.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(lot.status)}</Text>
          </View>
        </View>

        <Text style={styles.variety} numberOfLines={1}>
          {lot.variety}
        </Text>

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>
            {formatQuantity(lot.quantity)} {lot.unit}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Base Price:</Text>
          <Text style={styles.value}>{formatCurrency(lot.base_price)}</Text>
        </View>

        {lot.location && (
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {lot.location}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.date}>Listed: {formatDate(lot.created_at)}</Text>
          {lot.bid_count !== undefined && (
            <Text style={styles.bids}>{lot.bid_count} bids</Text>
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
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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
    color: COLORS.textSecondary,
  },
  bids: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
