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
import { AppHeader, Sidebar, ShipmentCard, Loading } from '@/components';
import { logisticsAPI } from '@/services/logisticsService';
import { Shipment } from '@/types/api';
import { useLogisticsStore } from '@/store/logisticsStore';

export default function TripsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { shipments, setShipments, setActiveShipments } = useLogisticsStore();

  const fetchShipments = async () => {
    try {
      const response = await logisticsAPI.getShipments();
      const allShipments = response.data.results;
      setShipments(allShipments);
      
      const active = allShipments.filter(s => 
        s.status === 'accepted' || s.status === 'in_transit'
      );
      setActiveShipments(active);
    } catch (error) {
      console.error('Failed to load trips:', error);
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShipments();
  };

  const handleAcceptTrip = async (shipment: Shipment) => {
    Alert.alert(
      'Accept Trip',
      `Accept this trip to ${shipment.delivery_location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              // TODO: Select vehicle
              await logisticsAPI.acceptBooking(shipment.id, { vehicle_id: 1 });
              Alert.alert('Success', 'Trip accepted!');
              fetchShipments();
            } catch (error) {
              Alert.alert('Error', 'Failed to accept trip');
            }
          },
        },
      ]
    );
  };

  const handleRejectTrip = async (shipment: Shipment) => {
    Alert.alert(
      'Reject Trip',
      'Reject this trip booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await logisticsAPI.rejectBooking(shipment.id, {
                rejection_reason: 'Not available',
              });
              Alert.alert('Success', 'Trip rejected');
              fetchShipments();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject trip');
            }
          },
        },
      ]
    );
  };

  const getFilteredShipments = () => {
    switch (activeTab) {
      case 'pending':
        return shipments.filter(s => s.status === 'pending');
      case 'active':
        return shipments.filter(s => s.status === 'accepted' || s.status === 'in_transit');
      case 'completed':
        return shipments.filter(s => s.status === 'delivered');
      default:
        return shipments;
    }
  };

  const displayShipments = getFilteredShipments();

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader 
          title="My Trips"
          onMenuPress={() => setSidebarVisible(true)}
        />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="My Trips"
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trips List */}
      <FlatList
        data={displayShipments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ShipmentCard
            shipment={item}
            onPress={() => router.push(`/(tabs)/trips/${item.id}`)}
            onAccept={activeTab === 'pending' ? () => handleAcceptTrip(item) : undefined}
            onReject={activeTab === 'pending' ? () => handleRejectTrip(item) : undefined}
            showActions={activeTab === 'pending'}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === 'pending' && 'No pending trips'}
              {activeTab === 'active' && 'No active trips'}
              {activeTab === 'completed' && 'No completed trips yet'}
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
    fontSize: 14,
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
