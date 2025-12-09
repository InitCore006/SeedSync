import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LotCard, Loading, AppHeader, Sidebar } from '@/components';
import { useLotsStore } from '@/store/lotsStore';
import { lotsAPI } from '@/services/lotsService';
import { ProcurementLot } from '@/types/api';

type LotFilter = 'all' | 'available' | 'sold' | 'at_fpo';

export default function MyLotsScreen() {
  const { myLots, setMyLots, setLoading, isLoading } = useLotsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<LotFilter>('all');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const response = await lotsAPI.getMyLots();
      // Extract results array from paginated response
      const lotsData = response.data.results || response.data;
      setMyLots(Array.isArray(lotsData) ? lotsData : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load lots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLots();
  };

  const handleLotPress = (lot: ProcurementLot) => {
    router.push(`/(tabs)/lots/${lot.id}`);
  };

  const handleEditLot = (lot: ProcurementLot, event: any) => {
    event.stopPropagation();
    router.push(`/(tabs)/lots/edit-lot?id=${lot.id}`);
  };

  const handleDeleteLot = async (lot: ProcurementLot, event: any) => {
    event.stopPropagation();
    Alert.alert(
      'Delete Lot',
      `Are you sure you want to delete lot #${lot.lot_number}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await lotsAPI.deleteLot(lot.id);
              Alert.alert('Success', 'Lot deleted successfully');
              fetchLots(); // Refresh the list
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete lot');
            }
          },
        },
      ]
    );
  };

  const getFilteredLots = () => {
    switch (activeFilter) {
      case 'available':
        return myLots.filter(lot => lot.status === 'available');
      case 'sold':
        return myLots.filter(lot => lot.status === 'sold' || lot.status === 'delivered');
      case 'at_fpo':
        return myLots.filter(lot => lot.managed_by_fpo === true && lot.warehouse);
      default:
        return myLots;
    }
  };

  const filteredLots = getFilteredLots();

  const filters: { key: LotFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'available', label: 'Available', icon: 'checkmark-circle' },
    { key: 'sold', label: 'Sold', icon: 'trophy' },
    { key: 'at_fpo', label: 'At FPO', icon: 'business' },
  ];

 

  return (
    <View style={styles.container}>
      <AppHeader title="My Lots" onMenuPress={() => setSidebarVisible(true)} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                activeFilter === filter.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filter.icon as any}
                size={18}
                color={activeFilter === filter.key ? COLORS.white : COLORS.text.secondary}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredLots}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View>
            <LotCard lot={item} onPress={() => handleLotPress(item)} />
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => handleEditLot(item, e)}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={(e) => handleDeleteLot(item, e)}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>No lots found</Text>
            <Text style={styles.emptyHint}>
              {activeFilter !== 'all' 
                ? 'Try selecting a different filter' 
                : 'Create your first lot to get started'}
            </Text>
          </View>
        }
      />
      
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/lots/create')}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: -12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteText: {
    color: COLORS.error,
  },
});
