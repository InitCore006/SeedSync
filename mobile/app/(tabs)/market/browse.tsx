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
import { ProcurementLot, BidSuggestion } from '@/types/api';

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
  
  // Bid Suggestion
  const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);
  const [bidSuggestion, setBidSuggestion] = useState<BidSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

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

  const handleGetSuggestion = async (lot: ProcurementLot) => {
    setSelectedLot(lot);
    setLoadingSuggestion(true);
    setSuggestionModalVisible(true);
    setBidSuggestion(null);

    try {
      const response = await bidsAPI.getBidSuggestion(lot.id);
      setBidSuggestion(response.data.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to get bid suggestion. Make sure your processor profile has location set.';
      Alert.alert('Error', errorMessage);
      setSuggestionModalVisible(false);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleProceedToBid = () => {
    setSuggestionModalVisible(false);
    // Pre-fill with suggested bid amount
    if (bidSuggestion) {
      const suggestedAmount = (bidSuggestion.bid_suggestion.suggested_bid_min + 
                               bidSuggestion.bid_suggestion.suggested_bid_max) / 2;
      setBidAmount(suggestedAmount.toFixed(2));
    }
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
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => handleGetSuggestion(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
                <Text style={styles.suggestionButtonText}>AI Suggest</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bidButton}
                onPress={() => handleBidPress(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="hand-right" size={20} color={COLORS.white} />
                <Text style={styles.bidButtonText}>Place Bid</Text>
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
            <Ionicons name="basket-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>No lots available</Text>
            <Text style={styles.emptyHint}>
              Check back later or adjust your filters
            </Text>
          </View>
        }
      />

      {/* Bid Suggestion Modal */}
      <Modal
        visible={suggestionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSuggestionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            style={styles.suggestionModalScroll}
            contentContainerStyle={styles.suggestionModalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Bid Suggestion</Text>
              <TouchableOpacity
                onPress={() => setSuggestionModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {loadingSuggestion ? (
              <View style={styles.loadingContainer}>
                <Loading />
                <Text style={styles.loadingText}>Analyzing lot and calculating costs...</Text>
              </View>
            ) : bidSuggestion && selectedLot ? (
              <>
                {/* Recommendation Header */}
                <View style={[
                  styles.recommendationBanner,
                  bidSuggestion.recommendation.should_bid ? styles.recommendBanner : styles.dontRecommendBanner
                ]}>
                  <Ionicons 
                    name={bidSuggestion.recommendation.should_bid ? "checkmark-circle" : "close-circle"} 
                    size={32} 
                    color={COLORS.white} 
                  />
                  <View style={styles.recommendationTexts}>
                    <Text style={styles.recommendationTitle}>
                      {bidSuggestion.recommendation.should_bid ? "Recommended to Bid" : "Not Recommended"}
                    </Text>
                    <Text style={styles.recommendationSubtitle}>
                      Confidence: {bidSuggestion.recommendation.confidence_score}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.recommendationReason}>
                  {bidSuggestion.recommendation.recommendation_reason}
                </Text>

                {/* Key Metrics */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Ionicons name="trending-up" size={24} color={COLORS.success} />
                    <Text style={styles.metricValue}>{bidSuggestion.financial_analysis.roi_percentage.toFixed(1)}%</Text>
                    <Text style={styles.metricLabel}>Expected ROI</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Ionicons name="navigate" size={24} color={COLORS.primary} />
                    <Text style={styles.metricValue}>{bidSuggestion.distance_info.distance_km.toFixed(0)} km</Text>
                    <Text style={styles.metricLabel}>Distance</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Ionicons name="car" size={24} color={COLORS.warning} />
                    <Text style={styles.metricValue}>₹{bidSuggestion.cost_analysis.total_logistics_cost.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>Logistics Cost</Text>
                  </View>
                </View>

                {/* Financial Analysis */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Financial Analysis</Text>
                  <View style={styles.financialRows}>
                    <View style={styles.financialRow}>
                      <Text style={styles.financialLabel}>Lot Price</Text>
                      <Text style={styles.financialValue}>
                        ₹{bidSuggestion.cost_analysis.lot_total_price.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.financialRow}>
                      <Text style={styles.financialLabel}>Logistics Cost</Text>
                      <Text style={styles.financialValue}>
                        ₹{bidSuggestion.cost_analysis.total_logistics_cost.toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.financialRow, styles.financialRowBorder]}>
                      <Text style={styles.financialLabel}>Total Cost</Text>
                      <Text style={[styles.financialValue, styles.financialValueBold]}>
                        ₹{bidSuggestion.cost_analysis.total_cost_with_logistics.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.financialRow}>
                      <Text style={styles.financialLabel}>Expected Revenue</Text>
                      <Text style={[styles.financialValue, styles.financialValueSuccess]}>
                        ₹{bidSuggestion.financial_analysis.expected_processing_revenue.toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.financialRow, styles.financialRowHighlight]}>
                      <Text style={[styles.financialLabel, styles.financialLabelBold]}>Net Profit</Text>
                      <Text style={[styles.financialValue, styles.financialValueBold, styles.financialValueSuccess]}>
                        ₹{bidSuggestion.financial_analysis.expected_net_profit.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Logistics Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Logistics Details</Text>
                  <View style={styles.logisticsInfo}>
                    <View style={styles.logisticsRow}>
                      <Ionicons name="car-sport" size={20} color={COLORS.text.secondary} />
                      <Text style={styles.logisticsLabel}>Vehicle Type</Text>
                      <Text style={styles.logisticsValue}>
                        {bidSuggestion.vehicle_recommendation.recommended_vehicle_type.replace('_', ' ')}
                      </Text>
                    </View>
                    <View style={styles.logisticsRow}>
                      <Ionicons name="speedometer" size={20} color={COLORS.text.secondary} />
                      <Text style={styles.logisticsLabel}>Travel Time</Text>
                      <Text style={styles.logisticsValue}>
                        ~{Math.round(bidSuggestion.distance_info.travel_duration_minutes)} mins
                      </Text>
                    </View>
                    <View style={styles.logisticsRow}>
                      <Ionicons name="location" size={20} color={COLORS.text.secondary} />
                      <Text style={styles.logisticsLabel}>Method</Text>
                      <Text style={styles.logisticsValue}>
                        {bidSuggestion.distance_info.distance_calculation_method === 'osrm' ? 'Road Distance' : 'Estimated'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Suggested Bid Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Suggested Bid Range</Text>
                  <View style={styles.bidRangeContainer}>
                    <View style={styles.bidRangeItem}>
                      <Text style={styles.bidRangeLabel}>Minimum</Text>
                      <Text style={styles.bidRangeValue}>
                        ₹{bidSuggestion.bid_suggestion.suggested_bid_min.toLocaleString()}
                      </Text>
                      <Text style={styles.bidRangePerUnit}>
                        ₹{(bidSuggestion.bid_suggestion.suggested_bid_min / selectedLot.quantity_quintals).toFixed(0)}/Q
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.text.tertiary} />
                    <View style={styles.bidRangeItem}>
                      <Text style={styles.bidRangeLabel}>Maximum</Text>
                      <Text style={styles.bidRangeValue}>
                        ₹{bidSuggestion.bid_suggestion.suggested_bid_max.toLocaleString()}
                      </Text>
                      <Text style={styles.bidRangePerUnit}>
                        ₹{(bidSuggestion.bid_suggestion.suggested_bid_max / selectedLot.quantity_quintals).toFixed(0)}/Q
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Warnings */}
                {bidSuggestion.warnings.length > 0 && (
                  <View style={styles.warningsContainer}>
                    <View style={styles.warningsHeader}>
                      <Ionicons name="warning" size={20} color={COLORS.warning} />
                      <Text style={styles.warningsTitle}>Important Considerations</Text>
                    </View>
                    {bidSuggestion.warnings.map((warning, index) => (
                      <Text key={index} style={styles.warningText}>• {warning}</Text>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => setSuggestionModalVisible(false)}
                    variant="outline"
                    style={styles.modalButton}
                  />
                  <Button
                    title="Place Bid"
                    onPress={handleProceedToBid}
                    style={styles.modalButton}
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

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
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bidButton: {
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
  // Suggestion Modal Styles
  suggestionModalScroll: {
    flex: 1,
  },
  suggestionModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '80%',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  recommendBanner: {
    backgroundColor: COLORS.success,
  },
  dontRecommendBanner: {
    backgroundColor: COLORS.error,
  },
  recommendationTexts: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  recommendationReason: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.primary,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  financialRows: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
  },
  financialRowHighlight: {
    backgroundColor: COLORS.success + '15',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  financialLabelBold: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  financialValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  financialValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  financialValueSuccess: {
    color: COLORS.success,
  },
  logisticsInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logisticsLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  logisticsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  bidRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bidRangeItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  bidRangeLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  bidRangeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  bidRangePerUnit: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  warningsContainer: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.warning,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
});
