import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar, LotCard, Loading, Input, Button } from '@/components';
import { lotsAPI } from '@/services/lotsService';
import { bidsAPI } from '@/services/bidsService';
import { ProcurementLot } from '@/types/api';

export default function MarketplaceBrowseScreen() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [lots, setLots] = useState<ProcurementLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  
  // Quick Bid Modal
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ProcurementLot | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    fetchMarketplaceLots();
  }, []);

  const fetchMarketplaceLots = async () => {
    try {
      setLoading(true);
      const response = await lotsAPI.getMarketplaceLots();
      setLots(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load marketplace lots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketplaceLots();
  };

  const handleBidPress = (lot: ProcurementLot) => {
    setSelectedLot(lot);
    setBidAmount(lot.expected_price_per_quintal?.toString() || '');
    setBidModalVisible(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedLot || !bidAmount) {
      Alert.alert('Error', 'Please enter a bid amount');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    try {
      setSubmittingBid(true);
      await bidsAPI.createBid({
        lot: selectedLot.id,
        offered_price_per_quintal: amount,
        bid_type: 'standard',
      });

      Alert.alert('Success', 'Your bid has been placed successfully!');
      setBidModalVisible(false);
      setBidAmount('');
      setSelectedLot(null);
      fetchMarketplaceLots(); // Refresh to show updated bid count
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to place bid';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingBid(false);
    }
  };

  const getFilteredLots = () => {
    let filtered = lots;

    if (selectedCrop !== 'all') {
      filtered = filtered.filter(lot => lot.crop_type === selectedCrop);
    }

    return filtered;
  };

  const filteredLots = getFilteredLots();

  const cropTypes = ['all', ...Array.from(new Set(lots.map(lot => lot.crop_type)))];

  if (loading && lots.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader 
          title="Browse Marketplace"
          onMenuPress={() => setSidebarVisible(true)}
          showBackButton
          onBackPress={() => router.back()}
        />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Browse Marketplace"
        onMenuPress={() => setSidebarVisible(true)}
        showBackButton
        onBackPress={() => router.back()}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        {/* Crop Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Crop Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPills}
          >
            {cropTypes.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[
                  styles.filterPill,
                  selectedCrop === crop && styles.filterPillActive,
                ]}
                onPress={() => setSelectedCrop(crop)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedCrop === crop && styles.filterPillTextActive,
                  ]}
                >
                  {crop === 'all' ? 'All Crops' : crop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quality Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Quality Grade</Text>
          <View style={styles.qualityFilters}>
            {qualityGrades.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.qualityPill,
                  selectedQuality === grade && styles.qualityPillActive,
                ]}
                onPress={() => setSelectedQuality(grade)}
              >
                <Text
                  style={[
                    styles.qualityPillText,
                    selectedQuality === grade && styles.qualityPillTextActive,
                  ]}
                >
                  {grade === 'all' ? 'All' : `Grade ${grade}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Lots List */}
      <FlatList
        data={filteredLots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.lotWrapper}>
            <LotCard lot={item} onPress={() => handleBidPress(item)} />
            <TouchableOpacity
              style={styles.bidButton}
              onPress={() => handleBidPress(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="hand-right" size={20} color={COLORS.white} />
              <Text style={styles.bidButtonText}>Place Bid</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>No lots available</Text>
            <Text style={styles.emptyHint}>
              Check back later or adjust your filters
            </Text>
          </View>
        }
      />

      {/* Quick Bid Modal */}
      <Modal
        visible={bidModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBidModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity
                onPress={() => setBidModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {selectedLot && (
              <>
                <View style={styles.lotInfo}>
                  <Text style={styles.lotInfoTitle}>{selectedLot.crop_type}</Text>
                  {selectedLot.crop_variety && (
                    <Text style={styles.lotInfoSubtitle}>{selectedLot.crop_variety}</Text>
                  )}
                  <View style={styles.lotInfoRow}>
                    <View style={styles.lotInfoItem}>
                      <Text style={styles.lotInfoLabel}>Quantity</Text>
                      <Text style={styles.lotInfoValue}>
                        {selectedLot.quantity_quintals} Q
                      </Text>
                    </View>
                    <View style={styles.lotInfoItem}>
                      <Text style={styles.lotInfoLabel}>Expected Price</Text>
                      <Text style={styles.lotInfoValue}>
                        ₹{selectedLot.expected_price_per_quintal}/Q
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bidInputSection}>
                  <Text style={styles.bidInputLabel}>Your Bid Amount (₹ per quintal)</Text>
                  <Input
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.totalAmount}>
                    Total: ₹{((parseFloat(bidAmount) || 0) * selectedLot.quantity_quintals).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => setBidModalVisible(false)}
                    variant="outline"
                    style={styles.modalButton}
                  />
                  <Button
                    title="Submit Bid"
                    onPress={handleSubmitBid}
                    loading={submittingBid}
                    style={styles.modalButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  filterPills: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
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
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
  },
  qualityFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  qualityPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  qualityPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  qualityPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  qualityPillTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
  },
  lotWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  bidButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bidButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  lotInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  lotInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  lotInfoSubtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  lotInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  lotInfoItem: {
    flex: 1,
  },
  lotInfoLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  lotInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bidInputSection: {
    marginBottom: 24,
  },
  bidInputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
