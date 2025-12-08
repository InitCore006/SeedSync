import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
<<<<<<< Updated upstream
import { AppHeader, Sidebar, ShipmentCard, Loading } from '@/components';
=======
import { ShipmentCard, Loading } from '@/components';
>>>>>>> Stashed changes
import { logisticsAPI } from '@/services/logisticsService';
import { useLogisticsStore } from '@/store/logisticsStore';

export default function HistoryScreen() {
<<<<<<< Updated upstream
  const [sidebarVisible, setSidebarVisible] = useState(false);
=======
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { tripHistory, setTripHistory, earnings, setEarnings } = useLogisticsStore();

  const fetchData = async () => {
    try {
      const [historyRes, earningsRes] = await Promise.all([
        logisticsAPI.getTripHistory(),
        logisticsAPI.getEarnings(),
      ]);

      setTripHistory(historyRes.data.results);
      setEarnings(earningsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
<<<<<<< Updated upstream
    return (
      <View style={{ flex: 1 }}>
        <AppHeader 
          title="Trip History"
          onMenuPress={() => setSidebarVisible(true)}
        />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        title="Trip History"
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
=======
    return <Loading fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
>>>>>>> Stashed changes
      {/* Earnings Summary */}
      {earnings && (
        <View style={styles.earningsSection}>
          <Text style={styles.sectionTitle}>Earnings Summary</Text>
          
          <View style={styles.earningsCard}>
            <View style={styles.totalEarnings}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalValue}>
                ₹{earnings.total_earnings.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.earningsGrid}>
              <View style={styles.earningItem}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
                <Text style={styles.earningValue}>
                  ₹{earnings.current_month_earnings.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.earningLabel}>This Month</Text>
              </View>

              <View style={styles.earningItem}>
                <Ionicons name="time" size={24} color={COLORS.warning} />
                <Text style={styles.earningValue}>
                  ₹{earnings.pending_payments.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.earningLabel}>Pending</Text>
              </View>

              <View style={styles.earningItem}>
                <Ionicons name="trending-up" size={24} color={COLORS.success} />
                <Text style={styles.earningValue}>
                  ₹{earnings.average_earning_per_trip.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.earningLabel}>Avg/Trip</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Trip History */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Trip History</Text>
          <Text style={styles.tripCount}>{tripHistory.length} trips</Text>
        </View>

        {tripHistory.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>No completed trips yet</Text>
          </View>
        ) : (
          <View style={styles.tripsList}>
            {tripHistory.map((trip) => (
              <ShipmentCard
                key={trip.id}
                shipment={trip}
                onPress={() => router.push(`/(tabs)/trips/${trip.id}`)}
              />
            ))}
          </View>
        )}
      </View>
<<<<<<< Updated upstream
    </ScrollView> 
    </View>
  );
}
=======
    </ScrollView>
  );
}

>>>>>>> Stashed changes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  earningsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  earningsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalEarnings: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningItem: {
    alignItems: 'center',
    gap: 8,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  earningLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  historySection: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  tripsList: {
    gap: 12,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 16,
  },
});
