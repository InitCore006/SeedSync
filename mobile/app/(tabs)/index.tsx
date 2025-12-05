import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Loading } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { lotsAPI } from '@/services/lotsService';
import { bidsAPI } from '@/services/bidsService';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    myLots: 0,
    receivedBids: 0,
    sentBids: 0,
    activeLots: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [lotsRes, bidsRes] = await Promise.all([
        lotsAPI.getMyLots(),
        bidsAPI.getMyBids(),
      ]);

      const lots = lotsRes.data;
      const bids = bidsRes.data;

      setStats({
        myLots: lots.length,
        receivedBids: bids.received.length,
        sentBids: bids.sent.length,
        activeLots: lots.filter((l: any) => l.status === 'open').length,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const quickActions = [
    {
      title: 'Create Lot',
      icon: 'add-circle',
      color: COLORS.primary,
      onPress: () => router.push('/(tabs)/lots/create'),
    },
    {
      title: 'Disease Detection',
      icon: 'camera',
      color: COLORS.success,
      onPress: () => router.push('/ai/disease-detection'),
    },
    {
      title: 'Price Prediction',
      icon: 'analytics',
      color: COLORS.secondary,
      onPress: () => router.push('/ai/price-prediction'),
    },
    {
      title: 'Find FPO',
      icon: 'location',
      color: COLORS.warning,
      onPress: () => router.push('/fpos'),
    },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name}! 👋</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.myLots}</Text>
          <Text style={styles.statLabel}>Total Lots</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeLots}</Text>
          <Text style={styles.statLabel}>Active Lots</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.receivedBids}</Text>
          <Text style={styles.statLabel}>Received Bids</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.sentBids}</Text>
          <Text style={styles.statLabel}>Sent Bids</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon as any} size={32} color={action.color} />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
});
