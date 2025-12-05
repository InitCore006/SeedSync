import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LotCard, Loading } from '@/components';
import { useLotsStore } from '@/store/lotsStore';
import { lotsAPI } from '@/services/lotsService';
import { ProcurementLot } from '@/types/api';

export default function MyLotsScreen() {
  const { myLots, setMyLots, setLoading, isLoading } = useLotsStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const response = await lotsAPI.getMyLots();
      setMyLots(response.data);
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

  if (isLoading && myLots.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myLots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <LotCard lot={item} onPress={() => handleLotPress(item)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/lots/create')}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
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
});
