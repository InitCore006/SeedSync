import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Loading } from '@/components';
import { bidsAPI } from '@/services/bidsService';
import { Bid } from '@/types/api';
import { getStatusInfo } from '@/constants/crops';

export default function BidDetailScreen() {
  const { id } = useLocalSearchParams();
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBidDetail = async () => {
    try {
      const response = await bidsAPI.getBidDetail(Number(id));
      setBid(response.data);
    } catch (error) {
      console.error('Failed to load bid details:', error);
      Alert.alert('Error', 'Failed to load bid details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidDetail();
  }, [id]);

  const handleAccept = async () => {
    if (!bid) return;

    Alert.alert(
      'Accept Bid',
      `Accept this bid of ₹${bid.offered_price_per_quintal}/quintal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await bidsAPI.acceptBid(bid.id);
              Alert.alert('Success', 'Bid accepted successfully!', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to accept bid');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!bid) return;

    Alert.alert(
      'Reject Bid',
      'Are you sure you want to reject this bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await bidsAPI.rejectBid(bid.id);
              Alert.alert('Success', 'Bid rejected', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject bid');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!bid) {
    return null;
  }

  const statusInfo = getStatusInfo(bid.status, 'bid');

  return (
    <ScrollView style={styles.container}>
      {/* Status Badge */}
      <View style={[styles.statusBanner, { backgroundColor: statusInfo.color }]}>
        <Ionicons name={statusInfo.icon as any} size={24} color={COLORS.white} />
        <Text style={styles.statusText}>{statusInfo.label}</Text>
      </View>

      {/* Bidder Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bidder Information</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="person" size={20} color={COLORS.text.secondary} />
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{bid.bidder_name || 'Bidder'}</Text>
          </View>
          {bid.bidder_type && (
            <View style={styles.row}>
              <Ionicons name="business" size={20} color={COLORS.text.secondary} />
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{bid.bidder_type.toUpperCase()}</Text>
            </View>
          )}
          {bid.bidder_contact_info && (
            <View style={styles.row}>
              <Ionicons name="call" size={20} color={COLORS.text.secondary} />
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{bid.bidder_contact_info}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Lot Info */}
      {bid.lot_details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lot Details</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Crop:</Text>
              <Text style={styles.value}>{bid.lot_details.crop_type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Quantity:</Text>
              <Text style={styles.value}>{bid.lot_details.quantity_quintals} Quintals</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bid Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bid Details</Text>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Offered Price</Text>
            <Text style={styles.priceValue}>₹{bid.offered_price_per_quintal}/quintal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{bid.quantity_quintals} Quintals</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{bid.total_amount.toLocaleString('en-IN')}</Text>
          </View>
          {bid.payment_terms && (
            <View style={styles.row}>
              <Text style={styles.label}>Payment Terms:</Text>
              <Text style={styles.value}>{bid.payment_terms_display || bid.payment_terms}</Text>
            </View>
          )}
          {bid.advance_payment_percentage && (
            <View style={styles.row}>
              <Text style={styles.label}>Advance Payment:</Text>
              <Text style={styles.value}>{bid.advance_payment_percentage}%</Text>
            </View>
          )}
          {bid.expected_pickup_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Expected Pickup:</Text>
              <Text style={styles.value}>
                {new Date(bid.expected_pickup_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Message */}
      {bid.message && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message</Text>
          <View style={styles.card}>
            <Text style={styles.message}>{bid.message}</Text>
          </View>
        </View>
      )}

      {/* Farmer Response */}
      {bid.farmer_response && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Response</Text>
          <View style={styles.card}>
            <Text style={styles.message}>{bid.farmer_response}</Text>
          </View>
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Submitted:</Text>
            <Text style={styles.value}>
              {new Date(bid.submitted_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {new Date(bid.updated_at).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {bid.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Ionicons name="close-circle" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Reject Bid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Accept Bid</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 2,
    textAlign: 'right',
  },
  priceRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 2,
    textAlign: 'right',
  },
  message: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
