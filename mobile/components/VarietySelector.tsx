import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { cropsAPI, CropVariety, formatMaturityDays } from '@/services/cropsService';

interface VarietySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (variety: CropVariety) => void;
  onRequestNew: () => void;
  cropCode: string;
  cropName: string;
  selectedVarietyCode?: string;
}

export const VarietySelector: React.FC<VarietySelectorProps> = ({
  visible,
  onClose,
  onSelect,
  onRequestNew,
  cropCode,
  cropName,
  selectedVarietyCode,
}) => {
  const [varieties, setVarieties] = useState<CropVariety[]>([]);
  const [filteredVarieties, setFilteredVarieties] = useState<CropVariety[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariety, setSelectedVariety] = useState<CropVariety | null>(null);

  useEffect(() => {
    if (visible && cropCode) {
      fetchVarieties();
    }
  }, [visible, cropCode]);

  useEffect(() => {
    filterVarieties();
  }, [searchQuery, varieties]);

  const fetchVarieties = async () => {
    try {
      setLoading(true);
      const response = await cropsAPI.getCropVarieties(cropCode);
      setVarieties(response.data.varieties);
      setFilteredVarieties(response.data.varieties);
    } catch (error) {
      Alert.alert('Error', 'Failed to load varieties. Please try again.');
      console.error('Failed to fetch varieties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVarieties = () => {
    if (!searchQuery.trim()) {
      setFilteredVarieties(varieties);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = varieties.filter(
      (variety) =>
        variety.variety_name.toLowerCase().includes(query) ||
        variety.variety_code.toLowerCase().includes(query)
    );
    setFilteredVarieties(filtered);
  };

  const handleSelect = (variety: CropVariety) => {
    setSelectedVariety(variety);
  };

  const handleConfirm = () => {
    if (selectedVariety) {
      onSelect(selectedVariety);
      onClose();
      setSelectedVariety(null);
      setSearchQuery('');
    }
  };

  const renderVarietyCard = ({ item }: { item: CropVariety }) => {
    const isSelected = item.variety_code === selectedVariety?.variety_code;

    return (
      <TouchableOpacity
        style={[styles.varietyCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.varietyName}>{item.variety_name}</Text>
            <Text style={styles.varietyCode}>Code: {item.variety_code}</Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Maturity</Text>
            <Text style={styles.statValue}>{formatMaturityDays(item.maturity_days)}</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up-outline" size={18} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Yield Potential</Text>
            <Text style={styles.statValue}>{item.yield_potential_quintals_per_acre} Q/acre</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="analytics-outline" size={18} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Oil Content</Text>
            <Text style={styles.statValue}>{item.oil_content_percentage}%</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.disease_resistance.length > 0 && (
          <View style={styles.tagsContainer}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
            <Text style={styles.tagsLabel}>Resistant to: </Text>
            <View style={styles.tags}>
              {item.disease_resistance.slice(0, 2).map((disease, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{disease}</Text>
                </View>
              ))}
              {item.disease_resistance.length > 2 && (
                <Text style={styles.moreTag}>+{item.disease_resistance.length - 2}</Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDetailView = () => {
    if (!selectedVariety) return null;

    return (
      <View style={styles.detailView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{selectedVariety.variety_name}</Text>
            <Text style={styles.detailCode}>{selectedVariety.variety_code}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Key Specifications</Text>
            
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Maturity Period</Text>
              <Text style={styles.specValue}>{selectedVariety.maturity_days} days</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Yield Potential</Text>
              <Text style={styles.specValue}>
                {selectedVariety.yield_potential_quintals_per_acre} quintals/acre
              </Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Oil Content</Text>
              <Text style={styles.specValue}>{selectedVariety.oil_content_percentage}%</Text>
            </View>

            {selectedVariety.seed_rate_kg_per_acre && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Seed Rate</Text>
                <Text style={styles.specValue}>
                  {selectedVariety.seed_rate_kg_per_acre} kg/acre
                </Text>
              </View>
            )}

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Season</Text>
              <Text style={styles.specValue}>{selectedVariety.season_display}</Text>
            </View>
          </View>

          {selectedVariety.suitable_regions.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Suitable Regions</Text>
              <View style={styles.regionContainer}>
                {selectedVariety.suitable_regions.map((region, index) => (
                  <View key={index} style={styles.regionBadge}>
                    <Ionicons name="location-outline" size={14} color="#059669" />
                    <Text style={styles.regionText}>{region}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedVariety.disease_resistance.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Disease Resistance</Text>
              <View style={styles.diseaseContainer}>
                {selectedVariety.disease_resistance.map((disease, index) => (
                  <View key={index} style={styles.diseaseBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                    <Text style={styles.diseaseText}>{disease}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedVariety.description && (
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{selectedVariety.description}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.detailActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedVariety(null)}
          >
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Select This Variety</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Select Variety</Text>
            <Text style={styles.subtitle}>{cropName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {selectedVariety ? (
          renderDetailView()
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search varieties by name or code"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={COLORS.secondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Varieties List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading varieties...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredVarieties}
                renderItem={renderVarietyCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="flower-outline" size={64} color={COLORS.border} />
                    <Text style={styles.emptyText}>No varieties found</Text>
                    <Text style={styles.emptySubtext}>
                      Can't find what you're looking for?
                    </Text>
                    <TouchableOpacity
                      style={styles.requestButton}
                      onPress={() => {
                        onClose();
                        onRequestNew();
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#fff" />
                      <Text style={styles.requestButtonText}>Request New Variety</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}

            {/* Request New Variety Button */}
            {!loading && filteredVarieties.length > 0 && (
              <View style={styles.footerContainer}>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => {
                    onClose();
                    onRequestNew();
                  }}
                >
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.footerButtonText}>Don't see your variety? Request it</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  varietyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: COLORS.success,
    backgroundColor: '#f0fdf4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
  },
  varietyName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  varietyCode: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.secondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagsLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  moreTag: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 6,
    marginBottom: 20,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Detail View Styles
  detailView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    padding: 24,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  detailCode: {
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  detailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  specLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  regionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  regionText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  diseaseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diseaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  diseaseText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 22,
  },
  detailActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
