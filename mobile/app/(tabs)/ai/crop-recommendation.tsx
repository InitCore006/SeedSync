import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar, Picker } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { farmersAPI } from '@/services/farmersService';
import { geminiService } from '@/services/geminiService';
import { FarmerProfile } from '@/types/api';

// Indian Oilseeds Focus - EXACTLY 8 crops as per requirement
const OILSEED_CROPS = [
  'groundnut',
  'sesame',
  'mustard/rapeseed',
  'linseed',
  'niger',
  'sunflower',
  'safflower',
  'castor',
];

type RecommendationMode = 'auto' | 'soil_card';

const SOIL_TYPES = [
  { label: 'Black Soil (Regur)', value: 'Black Soil' },
  { label: 'Alluvial Soil', value: 'Alluvial Soil' },
  { label: 'Red Soil', value: 'Red Soil' },
  { label: 'Sandy Loam', value: 'Sandy Loam' },
  { label: 'Loamy Soil', value: 'Loamy Soil' },
  { label: 'Clay Soil', value: 'Clay Soil' },
  { label: 'Laterite Soil', value: 'Laterite Soil' },
  { label: 'Mixed Soil', value: 'Mixed Soil' },
];

const SOIL_HEALTH = [
  { label: 'Excellent (pH 6.5-7.5, High Organic Matter)', value: 'Excellent' },
  { label: 'Good (pH 6-8, Moderate Organic Matter)', value: 'Good' },
  { label: 'Average (Needs Improvement)', value: 'Average' },
  { label: 'Poor (Degraded, Low Fertility)', value: 'Poor' },
  { label: 'Not Tested Yet', value: 'Unknown' },
];

const SEED_QUALITY = [
  { label: 'Certified Seeds (Government Approved)', value: 'Certified' },
  { label: 'High-Quality Hybrid Seeds', value: 'Hybrid' },
  { label: 'Farm-Saved Seeds (Good Quality)', value: 'Farm-Saved-Good' },
  { label: 'Local Variety Seeds', value: 'Local' },
  { label: 'Unknown/Mixed Quality', value: 'Unknown' },
];

const IRRIGATION_TYPES = [
  { label: 'Drip Irrigation (Best for Oilseeds)', value: 'Drip' },
  { label: 'Sprinkler Irrigation', value: 'Sprinkler' },
  { label: 'Canal Irrigation', value: 'Canal' },
  { label: 'Well/Borewell Irrigation', value: 'Well' },
  { label: 'Rainfed (No Irrigation)', value: 'Rainfed' },
];

const SEASONS = [
  { label: 'Kharif (Monsoon: June-October)', value: 'Kharif' },
  { label: 'Rabi (Winter: November-March)', value: 'Rabi' },
  { label: 'Zaid (Summer: April-June)', value: 'Zaid' },
];

interface SoilData {
  ph: number;
  organic_carbon_pct: number;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  irrigation_pct: number;
  rainfall_mm: number;
  temperature_c: number;
}

interface GeminiRecommendationResponse {
  district: string;
  season: 'kharif' | 'rabi' | 'both';
  mode_used: 'auto' | 'soil_card';
  soil_data: SoilData;
  recommended_crop: string;
  confidence: number;
  reasoning?: string;
}

export default function CropRecommendationScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Mode selection
  const [mode, setMode] = useState<RecommendationMode>('auto');
  
  // Location (auto-filled from profile or current location)
  const [location, setLocation] = useState({ city: '', state: '' });
  const [currentLocation, setCurrentLocation] = useState<{ city: string; state: string } | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  
  // Soil Card inputs (only for soil_card mode)
  const [soilPH, setSoilPH] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<GeminiRecommendationResponse | null>(null);

  // Fetch farmer profile and auto-fill location
  useEffect(() => {
    const fetchFarmerProfile = async () => {
      if (user?.role === 'farmer') {
        try {
          const response = await farmersAPI.getMyProfile();
          const profile = response.data;
          setFarmerProfile(profile);
          
          // Auto-fill location from profile
          setLocation({
            city: profile.district || '',
            state: profile.state || '',
          });
        } catch (error) {
          console.error('Failed to fetch farmer profile:', error);
          Alert.alert('Error', 'Failed to load your profile. Please complete your profile first.');
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    fetchFarmerProfile();
  }, [user]);

  // Auto-fetch current location when mode is auto
  useEffect(() => {
    if (mode === 'auto' && !currentLocation && !fetchingLocation) {
      getCurrentDeviceLocation();
    }
  }, [mode]);

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 6 && month <= 10) return 'kharif';
    if (month >= 11 || month <= 2) return 'rabi';
    return 'both';
  };

  const getCurrentDeviceLocation = async () => {
    setFetchingLocation(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location. Using profile location instead.'
        );
        setFetchingLocation(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city and state
      const [address] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (address) {
        const detectedLocation = {
          city: address.city || address.district || address.subregion || 'Unknown',
          state: address.region || address.administrativeArea || 'Unknown',
        };
        setCurrentLocation(detectedLocation);
        setLocation(detectedLocation);
      } else {
        Alert.alert('Error', 'Could not determine your location. Using profile location.');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your current location. Using profile location.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!location.state || !location.city) {
      Alert.alert('Location Required', 'Please update your profile with state and city information.');
      return;
    }

    // Validate soil card inputs if in soil_card mode
    if (mode === 'soil_card') {
      if (!soilPH || !nitrogen || !phosphorus || !potassium) {
        Alert.alert('Soil Data Required', 'Please enter Soil pH, Nitrogen, Phosphorus, and Potassium values.');
        return;
      }
    }

    setLoading(true);
    setRecommendation(null);
    
    try {
      const currentSeason = getCurrentSeason();
      
      // Build soil card data string
      let soilCardData = '';
      if (mode === 'soil_card') {
        soilCardData = `
Soil Card Inputs (if provided):
- Soil pH: ${soilPH || 'null'}
- Nitrogen (kg/ha): ${nitrogen || 'null'}
- Phosphorus (kg/ha): ${phosphorus || 'null'}
- Potassium (kg/ha): ${potassium || 'null'}
- Organic Carbon %: ${organicCarbon || 'null'}`;
      } else {
        soilCardData = `
Soil Card Inputs (if provided):
- Soil pH: null
- Nitrogen (kg/ha): null
- Phosphorus (kg/ha): null
- Potassium (kg/ha): null
- Organic Carbon %: null`;
      }

      const prompt = `You are an agricultural intelligence engine specializing only in Indian oilseed crops.

Your role is to determine the best crop out of the following 8:

[
  "groundnut",
  "sesame",
  "mustard/rapeseed",
  "linseed",
  "niger",
  "sunflower",
  "safflower",
  "castor"
]

---------------------------------
📍 USER CONTEXT
State: ${location.state}
City: ${location.city}
Mode: ${mode.toUpperCase()}${soilCardData}

---------------------------------
🌱 Rules for Processing:

1. **City → District Mapping**
Pick the most likely district associated with the given city in the specified state.

2. **Season Detection**
Determine season using current Indian agriculture calendar:
- June–October → "kharif"
- November–February → "rabi"
- March–May → "both possible"
Current detected season: ${currentSeason}

3. **Soil and Climate Data Extraction**
If soil card values are provided, use them.
Otherwise infer realistic values for the determined district using known agricultural baselines.

Extract or infer:

{
 "ph": float,
 "organic_carbon_pct": float,
 "nitrogen_kg_ha": int,
 "phosphorus_kg_ha": int,
 "potassium_kg_ha": int,
 "irrigation_pct": int,
 "rainfall_mm": int,
 "temperature_c": float
}

4. **Crop Evaluation Logic**
Compare the soil & climate profile with best-known requirements for each of the 8 oilseeds.
Consider water requirement, soil tolerance, rainfall suitability, temperature preference, and season compatibility.

5. **Output Must Be Pure JSON**
No explanation, no extra text.

---------------------------------
📦 FINAL RESPONSE FORMAT:

{
  "district": "string",
  "season": "kharif | rabi | both",
  "mode_used": "auto | soil_card",
  "soil_data": {
    "ph": float,
    "organic_carbon_pct": float,
    "nitrogen_kg_ha": int,
    "phosphorus_kg_ha": int,
    "potassium_kg_ha": int,
    "irrigation_pct": int,
    "rainfall_mm": int,
    "temperature_c": float
  },
  "recommended_crop": "one_of_the_8",
  "confidence": int (0-100),
  "reasoning": "brief 2-3 sentence explanation of why this crop is best"
}

ONLY return valid JSON. The recommended_crop MUST be one of the 8 oilseeds listed above.`;

      const response = await geminiService.generateJSON<GeminiRecommendationResponse>(prompt);
      
      // Validate response
      if (!OILSEED_CROPS.includes(response.recommended_crop)) {
        throw new Error('Invalid crop recommendation received');
      }
      
      setRecommendation(response);
    } catch (error: any) {
      console.error('Recommendation error:', error);
      Alert.alert('Error', 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecommendation(null);
    setSoilPH('');
    setNitrogen('');
    setPhosphorus('');
    setPotassium('');
    setOrganicCarbon('');
  };

  if (profileLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Oilseed Recommendations" onMenuPress={() => setSidebarVisible(true)} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Oilseed Crop Advisor" 
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="leaf" size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>AI Oilseed Advisor</Text>
          <Text style={styles.heroSubtitle}>
            Professional recommendations for Indian oilseeds value chain
          </Text>
          <View style={styles.oilseedBadge}>
            <Text style={styles.oilseedBadgeText}>
              Specialized for: Groundnut, Soybean, Mustard, Sunflower & More
            </Text>
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.modeCard}>
          <Text style={styles.sectionTitle}>Select Recommendation Mode</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'auto' && styles.modeButtonActive]}
              onPress={() => {
                setMode('auto');
                if (!currentLocation) {
                  getCurrentDeviceLocation();
                }
              }}
            >
              <Ionicons 
                name="flash" 
                size={24} 
                color={mode === 'auto' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[styles.modeButtonText, mode === 'auto' && styles.modeButtonTextActive]}>
                Auto Mode
              </Text>
              <Text style={[styles.modeButtonDesc, mode === 'auto' && styles.modeButtonDescActive]}>
                AI infers everything
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, mode === 'soil_card' && styles.modeButtonActive]}
              onPress={() => {
                setMode('soil_card');
                // Use profile location for soil card mode
                if (farmerProfile) {
                  setLocation({
                    city: farmerProfile.district || '',
                    state: farmerProfile.state || '',
                  });
                }
              }}
            >
              <Ionicons 
                name="document-text" 
                size={24} 
                color={mode === 'soil_card' ? COLORS.white : COLORS.primary} 
              />
              <Text style={[styles.modeButtonText, mode === 'soil_card' && styles.modeButtonTextActive]}>
                Soil Card
              </Text>
              <Text style={[styles.modeButtonDesc, mode === 'soil_card' && styles.modeButtonDescActive]}>
                Use soil test data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auto-Detected Location */}
        <View style={styles.autoFilledSection}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location" size={18} color={COLORS.primary} /> Your Location
            </Text>
            {mode === 'auto' && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={getCurrentDeviceLocation}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="refresh" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="navigate" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {mode === 'auto' ? 'Current Location (GPS)' : 'City & State (from profile)'}
                </Text>
                {fetchingLocation ? (
                  <Text style={styles.infoValue}>Detecting location...</Text>
                ) : (
                  <Text style={styles.infoValue}>
                    {location.city || 'Not set'}, {location.state || 'Not set'}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Current Season (Auto-Detected)</Text>
                <Text style={styles.infoValue}>
                  {getCurrentSeason().charAt(0).toUpperCase() + getCurrentSeason().slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Soil Card Inputs (Only in Soil Card Mode) */}
        {mode === 'soil_card' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="flask" size={18} color={COLORS.text.primary} /> Soil Test Values
            </Text>
            <Text style={styles.helpText}>
              Enter values from your soil health card
            </Text>

            {/* Soil pH */}
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Ionicons name="flask" size={20} color={COLORS.text.secondary} />
                <Text style={styles.inputLabel}>Soil pH *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 6.5"
                placeholderTextColor={COLORS.text.tertiary}
                value={soilPH}
                onChangeText={setSoilPH}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Nitrogen */}
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Ionicons name="leaf" size={20} color={COLORS.text.secondary} />
                <Text style={styles.inputLabel}>Nitrogen (kg/ha) *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 250"
                placeholderTextColor={COLORS.text.tertiary}
                value={nitrogen}
                onChangeText={setNitrogen}
                keyboardType="numeric"
              />
            </View>

            {/* Phosphorus */}
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Ionicons name="leaf" size={20} color={COLORS.text.secondary} />
                <Text style={styles.inputLabel}>Phosphorus (kg/ha) *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 30"
                placeholderTextColor={COLORS.text.tertiary}
                value={phosphorus}
                onChangeText={setPhosphorus}
                keyboardType="numeric"
              />
            </View>

            {/* Potassium */}
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Ionicons name="leaf" size={20} color={COLORS.text.secondary} />
                <Text style={styles.inputLabel}>Potassium (kg/ha) *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 200"
                placeholderTextColor={COLORS.text.tertiary}
                value={potassium}
                onChangeText={setPotassium}
                keyboardType="numeric"
              />
            </View>

            {/* Organic Carbon */}
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Ionicons name="leaf" size={20} color={COLORS.text.secondary} />
                <Text style={styles.inputLabel}>Organic Carbon % (Optional)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 0.5"
                placeholderTextColor={COLORS.text.tertiary}
                value={organicCarbon}
                onChangeText={setOrganicCarbon}
                keyboardType="decimal-pad"
              />
              <Text style={styles.helpText}>
                AI will infer if not provided
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.formCard}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleGetRecommendations}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>Analyzing with AI...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Get AI Recommendations</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {recommendation && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              🌿 Recommended Oilseed Crop
            </Text>

            {/* Main Recommendation Card */}
            <View style={styles.recommendationCard}>
              <View style={styles.recHeader}>
                <View style={styles.recTitleSection}>
                  <Text style={styles.recCropName}>
                    {recommendation.recommended_crop.charAt(0).toUpperCase() + 
                     recommendation.recommended_crop.slice(1).replace('-', ' / ')}
                  </Text>
                  <Text style={styles.recVariety}>
                    📍 {recommendation.district}, {location.state}
                  </Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{recommendation.confidence}%</Text>
                  <Text style={styles.scoreLabel}>Confidence</Text>
                </View>
              </View>

              {/* Mode Badge */}
              <View style={[
                styles.demandBadge,
                recommendation.mode_used === 'auto' ? styles.demandHigh : styles.demandMedium
              ]}>
                <Text style={styles.demandText}>
                  {recommendation.mode_used === 'auto' ? '⚡ Auto Mode' : '📋 Soil Card Mode'}
                </Text>
              </View>

              {/* Season & District Info */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Ionicons name="calendar" size={18} color={COLORS.primary} />
                  <Text style={styles.metricLabel}>Season</Text>
                  <Text style={styles.metricValue}>
                    {recommendation.season.charAt(0).toUpperCase() + recommendation.season.slice(1)}
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Ionicons name="location" size={18} color="#4F46E5" />
                  <Text style={styles.metricLabel}>District</Text>
                  <Text style={styles.metricValue}>{recommendation.district}</Text>
                </View>
              </View>

              {/* Reasoning */}
              {recommendation.reasoning && (
                <View style={styles.benefitsSection}>
                  <Text style={styles.subSectionTitle}>
                    <Ionicons name="bulb" size={16} /> Why This Crop?
                  </Text>
                  <Text style={styles.benefitText}>{recommendation.reasoning}</Text>
                </View>
              )}

              {/* Soil Data Details */}
              <TouchableOpacity
                style={styles.technicalDetails}
                onPress={() => Alert.alert(
                  'Soil & Climate Data',
                  `pH: ${recommendation.soil_data.ph}\n` +
                  `Organic Carbon: ${recommendation.soil_data.organic_carbon_pct}%\n` +
                  `Nitrogen: ${recommendation.soil_data.nitrogen_kg_ha} kg/ha\n` +
                  `Phosphorus: ${recommendation.soil_data.phosphorus_kg_ha} kg/ha\n` +
                  `Potassium: ${recommendation.soil_data.potassium_kg_ha} kg/ha\n` +
                  `Irrigation: ${recommendation.soil_data.irrigation_pct}%\n` +
                  `Rainfall: ${recommendation.soil_data.rainfall_mm} mm\n` +
                  `Temperature: ${recommendation.soil_data.temperature_c}°C`,
                  [{ text: 'Close' }]
                )}
              >
                <Ionicons name="document-text" size={18} color={COLORS.primary} />
                <Text style={styles.technicalDetailsText}>View Soil & Climate Data</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
              <Text style={styles.resetButtonText}>Get New Recommendation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        {!recommendation && !loading && (
          <View style={styles.infoSection}>
            <Ionicons name="information-circle" size={32} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Professional AI Analysis</Text>
            <Text style={styles.infoText}>
              Our AI analyzes your farm's location, soil health, seed quality, and irrigation to recommend the most profitable oilseed crops with complete value chain opportunities.
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Region-specific recommendations</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Profitability analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Value chain integration</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>Market demand insights</Text>
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  oilseedBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  oilseedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  autoFillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  autoFillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoFillTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  autoFilledSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
  },
  modeButtonTextActive: {
    color: COLORS.white,
  },
  modeButtonDesc: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  modeButtonDescActive: {
    color: COLORS.white + 'CC',
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  formCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
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
    fontSize: 17,
    fontWeight: '700',
  },
  resultsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  recRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recRankText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  recTitleSection: {
    flex: 1,
  },
  recCropName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  recVariety: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
  demandBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  demandHigh: {
    backgroundColor: '#10B98120',
  },
  demandMedium: {
    backgroundColor: '#F59E0B20',
  },
  demandLow: {
    backgroundColor: '#EF444420',
  },
  demandText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 6,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  benefitsSection: {
    backgroundColor: '#10B98110',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  challengesSection: {
    backgroundColor: '#F59E0B10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  challengeText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  technicalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  technicalDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  valueChainSection: {
    backgroundColor: '#6366F110',
    borderRadius: 12,
    padding: 12,
  },
  valueChainItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  valueChainText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  insightsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  insightsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    marginTop: 8,
  },
  resetButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
});
