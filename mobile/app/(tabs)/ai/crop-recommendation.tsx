import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar, Picker } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { cropRecommendationService } from '@/services/cropRecommendationService';
import { farmersAPI } from '@/services/farmersService';
import { FarmerProfile } from '@/types/api';

const SOIL_TYPES = [
  { label: 'Black Soil', value: 'Black Soil' },
  { label: 'Alluvial Soil', value: 'Alluvial Soil' },
  { label: 'Red Soil', value: 'Red Soil' },
  { label: 'Sandy Soil', value: 'Sandy Soil' },
  { label: 'Loamy Soil', value: 'Loamy Soil' },
  { label: 'Clay Soil', value: 'Clay Soil' },
  { label: 'Laterite Soil', value: 'Laterite Soil' },
  { label: 'Mixed Soil', value: 'Mixed Soil' },
];

const WATER_LEVELS = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const SEASONS = [
  { label: 'Kharif (Monsoon)', value: 'kharif' },
  { label: 'Rabi (Winter)', value: 'rabi' },
];

export default function CropRecommendationScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Form state
  const [soilType, setSoilType] = useState(SOIL_TYPES[0].value);
  const [waterLevel, setWaterLevel] = useState(WATER_LEVELS[1].value);
  const [season, setSeason] = useState(SEASONS[0].value);
  
  const [loading, setLoading] = useState(false);
  const [recommendedCrop, setRecommendedCrop] = useState<string | null>(null);

  // Fetch farmer profile on mount
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      if (user?.role === 'farmer') {
        try {
          const response = await farmersAPI.getMyProfile();
          setFarmerProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch farmer profile:', error);
          Alert.alert('Error', 'Failed to load your profile. Please try again.');
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    fetchFarmerProfile();
  }, [user]);

  const handleGetRecommendation = async () => {
    if (!farmerProfile?.state || !farmerProfile?.district) {
      Alert.alert('Profile Incomplete', 'Please update your profile with state and district information.');
      return;
    }

    setLoading(true);
    setRecommendedCrop(null);
    
    try {
      const crop = await cropRecommendationService.predictCrop({
        state: farmerProfile.state,
        district: farmerProfile.district,
        season,
        soil_type: soilType,
        water_level: waterLevel,
      });

      setRecommendedCrop(crop);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecommendedCrop(null);
    setSoilType(SOIL_TYPES[0].value);
    setWaterLevel(WATER_LEVELS[1].value);
    setSeason(SEASONS[0].value);
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Crop Recommendation" 
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="leaf" size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>AI Crop Advisor</Text>
          <Text style={styles.heroSubtitle}>
            Get the best crop recommendation for your farm
          </Text>
        </View>

        {/* Location Info */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.locationTitle}>Your Farm Location</Text>
          </View>
          <Text style={styles.locationText}>
            {farmerProfile?.district || 'Not set'}, {farmerProfile?.state || 'Not set'}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Select Farm Details</Text>

          {/* Season */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
              <Text style={styles.inputLabel}>Season</Text>
            </View>
            <Picker
              selectedValue={season}
              onValueChange={setSeason}
              items={SEASONS}
            />
          </View>

          {/* Soil Type */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="planet" size={20} color={COLORS.text.secondary} />
              <Text style={styles.inputLabel}>Soil Type</Text>
            </View>
            <Picker
              selectedValue={soilType}
              onValueChange={setSoilType}
              items={SOIL_TYPES}
            />
          </View>

          {/* Water Level */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="water" size={20} color={COLORS.text.secondary} />
              <Text style={styles.inputLabel}>Water Availability</Text>
            </View>
            <Picker
              selectedValue={waterLevel}
              onValueChange={setWaterLevel}
              items={WATER_LEVELS}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleGetRecommendation}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Get Recommendation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {recommendedCrop && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text style={styles.resultTitle}>Recommended Crop</Text>
            </View>
            
            <View style={styles.cropDisplay}>
              <Text style={styles.cropName}>{recommendedCrop}</Text>
              <Text style={styles.cropSubtext}>
                Best suited for your farm conditions
              </Text>
            </View>

            <View style={styles.conditionsBox}>
              <Text style={styles.conditionsTitle}>Based on:</Text>
              <View style={styles.conditionRow}>
                <Ionicons name="location" size={16} color={COLORS.text.secondary} />
                <Text style={styles.conditionText}>{farmerProfile?.district}, {farmerProfile?.state}</Text>
              </View>
              <View style={styles.conditionRow}>
                <Ionicons name="calendar" size={16} color={COLORS.text.secondary} />
                <Text style={styles.conditionText}>{SEASONS.find(s => s.value === season)?.label}</Text>
              </View>
              <View style={styles.conditionRow}>
                <Ionicons name="planet" size={16} color={COLORS.text.secondary} />
                <Text style={styles.conditionText}>{soilType}</Text>
              </View>
              <View style={styles.conditionRow}>
                <Ionicons name="water" size={16} color={COLORS.text.secondary} />
                <Text style={styles.conditionText}>{waterLevel.charAt(0).toUpperCase() + waterLevel.slice(1)} Water</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
              <Text style={styles.resetButtonText}>Try Another</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        {!recommendedCrop && !loading && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Our AI model analyzes your farm's location, soil type, water availability, and season to recommend the most suitable crop for maximum yield.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  locationCard: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: 34,
  },
  formCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#22c55e30',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  cropDisplay: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    borderRadius: 20,
    padding: 32,
    marginBottom: 28,
  },
  cropName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  cropSubtext: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  conditionsBox: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  conditionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  conditionText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
  },
  resetButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
});
