import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { BidCard, Loading } from '@/components';
import { bidsAPI } from '@/services/bidsService';
import { Bid } from '@/types/api';
import { useBidsStore } from '@/store/bidsStore';

export default function BidsScreen() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [receivedBids, setReceivedBids] = useState<Bid[]>([]);
  const [sentBids, setSentBids] = useState<Bid[]>([]);

  const fetchBids = async () => {
    try {
      const response = await bidsAPI.getMyBids();
      setReceivedBids(response.data.received);
      setSentBids(response.data.sent);
    } catch (error) {
      console.error('Failed to load bids:', error);
      Alert.alert('Error', 'Failed to load bids');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBids();
  };

  const handleAcceptBid = async (bid: Bid) => {
    Alert.alert(
      'Accept Bid',
      `Accept bid of ₹${bid.offered_price_per_quintal}/quintal from ${bid.bidder_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await bidsAPI.acceptBid(bid.id);
              Alert.alert('Success', 'Bid accepted successfully!');
              fetchBids();
            } catch (error) {
              Alert.alert('Error', 'Failed to accept bid');
            }
          },
        },
      ]
    );
  };

  const handleRejectBid = async (bid: Bid) => {
    Alert.alert(
      'Reject Bid',
      `Reject bid from ${bid.bidder_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await bidsAPI.rejectBid(bid.id);
              Alert.alert('Success', 'Bid rejected');
              fetchBids();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject bid');
            }
          },
        },
      ]
    );
  };

  const displayBids = activeTab === 'received' ? receivedBids : sentBids;

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received ({receivedBids.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent ({sentBids.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bids List */}
      <FlatList
        data={displayBids}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BidCard
            bid={item}
            onPress={() => router.push(`/(tabs)/bids/${item.id}`)}
            onAccept={activeTab === 'received' && item.status === 'pending' ? () => handleAcceptBid(item) : undefined}
            onReject={activeTab === 'received' && item.status === 'pending' ? () => handleRejectBid(item) : undefined}
            showActions={activeTab === 'received' && item.status === 'pending'}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === 'received' 
                ? 'No bids received yet' 
                : 'You haven\'t sent any bids yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  list: {
    padding: 16,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
