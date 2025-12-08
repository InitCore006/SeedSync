import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '@/constants/colors';
import { AppHeader, Loading, Input, Button } from '@/components';
import { farmersAPI } from '@/services/farmersService';
import { cropPlannerService } from '@/services/cropPlannerService';
import { LinearGradient } from 'expo-linear-gradient';

interface LocationInfo {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

export default function CropPlannerScreen() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [totalLandAcres, setTotalLandAcres] = useState<number>(0);
  const [allocatedAcres, setAllocatedAcres] = useState<string>('');
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    try {
      const response = await farmersAPI.getMyProfile();
      const profile = response.data;
      
      setTotalLandAcres(profile.total_land_acres || 0);
      
      // Pre-fill with total land
      setAllocatedAcres(profile.total_land_acres?.toString() || '');
      
      // Try to get location from profile
      if (profile.latitude && profile.longitude) {
        setLocation({
          latitude: profile.latitude,
          longitude: profile.longitude,
          district: profile.district || '',
          state: profile.state || '',
        });
      }
    } catch (error) {
      console.error('Failed to load farmer data:', error);
      Alert.alert('Error', 'Failed to load your profile data');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to analyze soil and weather conditions'
        );
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      // Reverse geocode
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        setLocation({
          latitude,
          longitude,
          district: place.district || place.city || place.subregion || 'Unknown',
          state: place.region || 'Unknown',
        });
        Alert.alert('Success', 'Location detected successfully!');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAnalyze = async () => {
    // Validation
    if (!allocatedAcres || parseFloat(allocatedAcres) <= 0) {
      Alert.alert('Invalid Input', 'Please enter land area to allocate');
      return;
    }

    if (parseFloat(allocatedAcres) > totalLandAcres) {
      Alert.alert(
        'Invalid Input',
        `Allocated land cannot exceed your total land (${totalLandAcres} acres)`
      );
      return;
    }

    if (!location) {
      Alert.alert(
        'Location Required',
        'Please allow location access to analyze soil and weather conditions'
      );
      return;
    }

    setAnalyzing(true);
    try {
      // Navigate to recommendations with data
      router.push({
        pathname: '/crop-planner/recommendations',
        params: {
          land_acres: allocatedAcres,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          district: location.district,
          state: location.state,
        },
      });
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading your farm details..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AppHeader title="Crop Planner" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.headerCard}
        >
          <Ionicons name="calendar" size={40} color="#fff" />
          <Text style={styles.headerTitle}>Plan Your Next Crop</Text>
          <Text style={styles.headerSubtitle}>
            Get AI-powered recommendations with yield and revenue predictions
          </Text>
        </LinearGradient>

        {/* View My Plans Button */}
        <TouchableOpacity
          style={styles.myPlansButton}
          onPress={() => router.push('/crop-planner/my-plans')}
        >
          <View style={styles.myPlansContent}>
            <Ionicons name="list" size={22} color={COLORS.primary} />
            <Text style={styles.myPlansText}>View My Saved Crop Plans</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Farm Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Your Farm Details</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Land</Text>
            <Text style={styles.infoValue}>{totalLandAcres} acres</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Land Area to Allocate (in acres)</Text>
          <Input
            value={allocatedAcres}
            onChangeText={setAllocatedAcres}
            placeholder="Enter acres"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <Text style={styles.helperText}>
            Maximum: {totalLandAcres} acres available
          </Text>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Location & Soil Analysis</Text>
          </View>

          {location ? (
            <>
              <View style={styles.locationInfo}>
                <View style={styles.locationRow}>
                  <Ionicons name="pin" size={20} color={COLORS.secondary} />
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>District</Text>
                    <Text style={styles.locationValue}>{location.district}</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="map" size={20} color={COLORS.secondary} />
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>State</Text>
                    <Text style={styles.locationValue}>{location.state}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.updateLocationButton}
                onPress={requestLocation}
                disabled={locationLoading}
              >
                <Ionicons name="refresh" size={18} color={COLORS.primary} />
                <Text style={styles.updateLocationText}>Update Location</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={requestLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="location" size={20} color="#fff" />
                  <Text style={styles.locationButtonText}>
                    Detect My Location
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoBoxText}>
              Location is used to analyze soil type, weather patterns, and provide
              region-specific crop recommendations
            </Text>
          </View>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What You'll Get:</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="analytics" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Soil & Weather Analysis</Text>
              <Text style={styles.featureDesc}>
                Based on your location and current season
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="leaf" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Oilseed Recommendations</Text>
              <Text style={styles.featureDesc}>
                Top 3 suitable crops with suitability scores
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="trending-up" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Yield Prediction</Text>
              <Text style={styles.featureDesc}>
                Estimated production based on land area
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="cash" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Revenue Calculator</Text>
              <Text style={styles.featureDesc}>
                Projected income based on current MSP
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Cultivation Timeline</Text>
              <Text style={styles.featureDesc}>
                Complete schedule from planting to harvest
              </Text>
            </View>
          </View>
        </View>

        {/* Analyze Button */}
        <Button
          title="Analyze & Get Recommendations"
          onPress={handleAnalyze}
          loading={analyzing}
          style={styles.analyzeButton}
          icon={<Ionicons name="sparkles" size={20} color="#fff" />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  locationInfo: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  updateLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  updateLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#1e3a8a',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  myPlansButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  myPlansContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myPlansText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    marginLeft: 12,
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  analyzeButton: {
    marginBottom: 24,
  },
});
