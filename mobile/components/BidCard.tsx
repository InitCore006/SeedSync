import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Bid } from '@/types/api';
import { getStatusInfo } from '@/constants/crops';

interface BidCardProps {
  bid: Bid;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export const BidCard: React.FC<BidCardProps> = ({ 
  bid, 
  onPress, 
  onAccept, 
  onReject,
  showActions = false 
}) => {
  const statusInfo = getStatusInfo(bid.status, 'bid');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.bidderInfo}>
          <Ionicons name="person-circle" size={40} color={COLORS.primary} />
          <View style={styles.bidderDetails}>
            <Text style={styles.bidderName}>{bid.bidder_name || 'Bidder'}</Text>
            {bid.bidder_type && (
              <Text style={styles.bidderType}>{bid.bidder_type.toUpperCase()}</Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Offered Price</Text>
          <Text style={styles.priceValue}>₹{bid.offered_price_per_quintal}/quintal</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Quantity</Text>
          <Text style={styles.quantityValue}>{bid.quantity_quintals} Q</Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{bid.total_amount.toLocaleString('en-IN')}</Text>
      </View>

      {bid.payment_terms && (
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.infoText}>
            Payment: {bid.payment_terms_display || bid.payment_terms.replace('_', ' ')}
          </Text>
        </View>
      )}

      {bid.expected_pickup_date && (
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.infoText}>
            Pickup: {new Date(bid.expected_pickup_date).toLocaleDateString()}
          </Text>
        </View>
      )}

      {bid.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText} numberOfLines={2}>{bid.message}</Text>
        </View>
      )}

      {showActions && bid.status === 'pending' && onAccept && onReject && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={(e) => {
              e.stopPropagation();
              onReject();
            }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]} 
            onPress={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.date}>
        Submitted {new Date(bid.submitted_at).toLocaleString()}
      </Text>
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
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bidderDetails: {
    marginLeft: 12,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bidderType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  priceBlock: {},
  priceLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.light + '30',
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
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
  messageBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 8,
  },
});
