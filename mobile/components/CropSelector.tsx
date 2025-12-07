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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { cropsAPI, CropMaster, getCropIcon, getWaterRequirementColor } from '@/services/cropsService';

interface CropSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (crop: CropMaster) => void;
  selectedCropCode?: string;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCropCode,
}) => {
  const [crops, setCrops] = useState<CropMaster[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchCrops();
    }
  }, [visible]);

  useEffect(() => {
    filterCrops();
  }, [searchQuery, crops]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropsAPI.getCropMasters();
      setCrops(response.data.crops);
      setFilteredCrops(response.data.crops);
    } catch (error) {
      Alert.alert('Error', 'Failed to load crops. Please try again.');
      console.error('Failed to fetch crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCrops = () => {
    if (!searchQuery.trim()) {
      setFilteredCrops(crops);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = crops.filter(
      (crop) =>
        crop.crop_name_display.toLowerCase().includes(query) ||
        crop.hindi_name.toLowerCase().includes(query) ||
        crop.scientific_name.toLowerCase().includes(query)
    );
    setFilteredCrops(filtered);
  };

  const handleSelect = (crop: CropMaster) => {
    onSelect(crop);
    onClose();
    setSearchQuery('');
  };

  const renderCropCard = ({ item }: { item: CropMaster }) => {
    const isSelected = item.crop_code === selectedCropCode;

    return (
      <TouchableOpacity
        style={[styles.cropCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cropHeader}>
          <View style={styles.cropTitleRow}>
            <Text style={styles.cropIcon}>{getCropIcon(item.crop_name)}</Text>
            <View style={styles.cropTitleContainer}>
              <Text style={styles.cropName}>{item.crop_name_display}</Text>
              <Text style={styles.hindiName}>{item.hindi_name}</Text>
            </View>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          )}
        </View>

        <Text style={styles.scientificName}>{item.scientific_name}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Maturity</Text>
            <Text style={styles.infoValue}>{item.maturity_days} days</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="water-outline" size={16} color={getWaterRequirementColor(item.water_requirement)} />
            <Text style={styles.infoLabel}>Water</Text>
            <Text style={styles.infoValue}>{item.water_requirement}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="analytics-outline" size={16} color={COLORS.secondary} />
            <Text style={styles.infoLabel}>Oil Content</Text>
            <Text style={styles.infoValue}>{item.oil_content_percentage}%</Text>
          </View>
        </View>

        {item.growing_season.length > 0 && (
          <View style={styles.seasonContainer}>
            <Text style={styles.seasonLabel}>Seasons: </Text>
            {item.growing_season.map((season, index) => (
              <View key={index} style={styles.seasonBadge}>
                <Text style={styles.seasonText}>{season}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
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
          <Text style={styles.title}>Select Crop</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops (English, Hindi, or Scientific name)"
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

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            These are government-registered crops. Can't find your variety?{' '}
            <Text style={styles.linkText}>Request it below</Text>
          </Text>
        </View>

        {/* Crops List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading crops...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCrops}
            renderItem={renderCropCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="leaf-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyText}>No crops found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search terms
                </Text>
              </View>
            }
          />
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  linkText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
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
    paddingBottom: 40,
  },
  cropCard: {
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
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cropIcon: {
    fontSize: 36,
  },
  cropTitleContainer: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  hindiName: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  scientificName: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.secondary,
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  seasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  seasonLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  seasonBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  seasonText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
    textTransform: 'capitalize',
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
  },
});
