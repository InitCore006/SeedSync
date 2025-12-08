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
<<<<<<< Updated upstream
import { BidCard, Loading, AppHeader, Sidebar } from '@/components';
import { bidsAPI } from '@/services/bidsService';
import { lotsAPI } from '@/services/lotsService';
import { Bid } from '@/types/api';
import { useBidsStore } from '@/store/bidsStore';
import { useAuthStore } from '@/store/authStore';
=======
import { BidCard, Loading } from '@/components';
import { bidsAPI } from '@/services/bidsService';
import { Bid } from '@/types/api';
import { useBidsStore } from '@/store/bidsStore';
>>>>>>> Stashed changes

export default function BidsScreen() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [receivedBids, setReceivedBids] = useState<Bid[]>([]);
  const [sentBids, setSentBids] = useState<Bid[]>([]);
<<<<<<< Updated upstream
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
=======
>>>>>>> Stashed changes

  const fetchBids = async () => {
    try {
      const response = await bidsAPI.getMyBids();
<<<<<<< Updated upstream
      
      // For farmers who are not in FPO, filter received bids to only show bids for their own lots
      if (user?.role === 'farmer' && !user?.profile?.fpo_membership) {
        // Fetch farmer's own lots to get lot IDs
        const lotsResponse = await lotsAPI.getMyLots();
        const myLotIds = lotsResponse.data.results.map((lot: any) => lot.id);
        
        // Filter received bids to only include bids for farmer's own lots
        const filteredReceivedBids = response.data.received.filter(
          (bid: Bid) => myLotIds.includes(bid.lot)
        );
        setReceivedBids(filteredReceivedBids);
      } else {
        setReceivedBids(response.data.received);
      }
      
=======
      setReceivedBids(response.data.received);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    return (
      <View style={{ flex: 1 }}>
        <AppHeader title="My Bids" onMenuPress={() => setSidebarVisible(true)} />
        <Loading fullScreen />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      </View>
    );
=======
    return <Loading fullScreen />;
>>>>>>> Stashed changes
  }

  return (
    <View style={styles.container}>
<<<<<<< Updated upstream
      <AppHeader title="My Bids" onMenuPress={() => setSidebarVisible(true)} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
=======
>>>>>>> Stashed changes
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
