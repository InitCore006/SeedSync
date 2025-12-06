import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Button, Loading, Input } from '@/components';
import { lotsAPI } from '@/services/lotsService';
import { bidsAPI } from '@/services/bidsService';
import { ProcurementLot, Bid } from '@/types/api';
import { formatCurrency, formatDate, formatQuantity } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';

export default function LotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [lot, setLot] = useState<ProcurementLot | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  const isMyLot = lot?.farmer === user?.id;

  const fetchLotDetails = async () => {
    try {
      const [lotRes, bidsRes] = await Promise.all([
        lotsAPI.getLot(parseInt(id)),
        bidsAPI.getLotBids(parseInt(id)),
      ]);
      setLot(lotRes.data);
      setBids(bidsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load lot details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotDetails();
  }, [id]);

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      Alert.alert('Error', 'Please enter bid amount');
      return;
    }

    setSubmittingBid(true);
    try {
      await bidsAPI.createBid({
        lot: parseInt(id),
        bid_amount: parseFloat(bidAmount),
      });
      Alert.alert('Success', 'Bid placed successfully');
      fetchLotDetails();
      setBidAmount('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: number) => {
    Alert.alert('Accept Bid', 'Are you sure you want to accept this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            await bidsAPI.acceptBid(bidId);
            Alert.alert('Success', 'Bid accepted successfully');
            fetchLotDetails();
          } catch (error) {
            Alert.alert('Error', 'Failed to accept bid');
          }
        },
      },
    ]);
  };

  const handleRejectBid = async (bidId: number) => {
    try {
      await bidsAPI.rejectBid(bidId);
      Alert.alert('Success', 'Bid rejected');
      fetchLotDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject bid');
    }
  };

  if (loading || !lot) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      {lot.images && lot.images.length > 0 && (
        <Image source={{ uri: lot.images[0] }} style={styles.image} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.cropType}>{lot.crop_type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>{lot.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.variety}>{lot.variety}</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>
              {formatQuantity(lot.quantity)} {lot.unit}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base Price</Text>
            <Text style={styles.infoValue}>{formatCurrency(lot.base_price)}</Text>
          </View>
          {lot.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{lot.location}</Text>
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

        {!isMyLot && lot.status === 'open' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Place Bid</Text>
            <Input
              placeholder="Enter your bid amount"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="decimal-pad"
            />
            <Button
              title="Place Bid"
              onPress={handlePlaceBid}
              loading={submittingBid}
            />
          </View>
        )}

        {isMyLot && bids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bids ({bids.length})</Text>
            {bids.map((bid) => (
              <View key={bid.id} style={styles.bidCard}>
                <View style={styles.bidHeader}>
                  <Text style={styles.bidAmount}>{formatCurrency(bid.bid_amount)}</Text>
                  <View
                    style={[
                      styles.bidStatus,
                      {
                        backgroundColor:
                          bid.status === 'accepted'
                            ? COLORS.success
                            : bid.status === 'rejected'
                            ? COLORS.error
                            : COLORS.warning,
                      },
                    ]}
                  >
                    <Text style={styles.bidStatusText}>{bid.status}</Text>
                  </View>
                </View>
                <Text style={styles.bidDate}>{formatDate(bid.created_at)}</Text>
                {bid.status === 'pending' && (
                  <View style={styles.bidActions}>
                    <Button
                      title="Accept"
                      onPress={() => handleAcceptBid(bid.id)}
                      size="small"
                      style={styles.bidButton}
                    />
                    <Button
                      title="Reject"
                      onPress={() => handleRejectBid(bid.id)}
                      variant="outline"
                      size="small"
                      style={styles.bidButton}
                    />
                  </View>
                )}
              </View>
            ))}
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
  },
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
    color: COLORS.text,
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
    color: COLORS.secondary,
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
    color: COLORS.secondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.secondary,
    lineHeight: 24,
  },
  bidCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bidStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bidStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  bidDate: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  bidActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bidButton: {
    flex: 1,
  },
});
