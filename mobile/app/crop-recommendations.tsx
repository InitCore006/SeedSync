import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BRAND_COLORS = {
  primary: '#4a7c0f',
  secondary: '#65a30d',
  dark: '#365314',
};

const cropRecommendations = [
  {
    name: 'Rice',
    season: 'Kharif',
    icon: 'leaf',
    color: '#84cc16',
    suitability: 'High',
    rainfall: '100-200cm',
    temperature: '20-35°C',
    soil: 'Clay loam',
  },
  {
    name: 'Wheat',
    season: 'Rabi',
    icon: 'nutrition',
    color: '#eab308',
    suitability: 'Medium',
    rainfall: '50-75cm',
    temperature: '10-25°C',
    soil: 'Loamy',
  },
  {
    name: 'Cotton',
    season: 'Kharif',
    icon: 'flower',
    color: '#f8fafc',
    suitability: 'High',
    rainfall: '50-100cm',
    temperature: '21-30°C',
    soil: 'Black soil',
  },
  {
    name: 'Sugarcane',
    season: 'Perennial',
    icon: 'restaurant',
    color: '#22c55e',
    suitability: 'Medium',
    rainfall: '75-150cm',
    temperature: '20-26°C',
    soil: 'Loamy',
  },
  {
    name: 'Maize',
    season: 'Kharif/Rabi',
    icon: 'cafe',
    color: '#fbbf24',
    suitability: 'High',
    rainfall: '50-100cm',
    temperature: '18-27°C',
    soil: 'Well-drained',
  },
  {
    name: 'Pulses',
    season: 'Rabi',
    icon: 'ellipse',
    color: '#a78bfa',
    suitability: 'Medium',
    rainfall: '40-65cm',
    temperature: '15-30°C',
    soil: 'Sandy loam',
  },
];

export default function CropRecommendationsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.dark, BRAND_COLORS.primary, BRAND_COLORS.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Recommendations</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Weather-based Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={BRAND_COLORS.primary} />
            <Text style={styles.infoTitle}>Based on Current Weather</Text>
          </View>
          <Text style={styles.infoText}>
            These crop recommendations are tailored to your current location's climate,
            soil type, and seasonal conditions. Choose crops that match your resources
            and market demand.
          </Text>
        </View>

        {/* Crop Cards */}
        <View style={styles.cropsSection}>
          <Text style={styles.sectionTitle}>Recommended Crops</Text>
          {cropRecommendations.map((crop, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cropCard}
              activeOpacity={0.7}
            >
              <View style={[styles.cropIconContainer, { backgroundColor: crop.color + '20' }]}>
                <Ionicons name={crop.icon as any} size={28} color={crop.color} />
              </View>
              
              <View style={styles.cropInfo}>
                <View style={styles.cropHeader}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <View style={[
                    styles.suitabilityBadge,
                    { backgroundColor: crop.suitability === 'High' ? '#dcfce7' : '#fef3c7' }
                  ]}>
                    <Text style={[
                      styles.suitabilityText,
                      { color: crop.suitability === 'High' ? '#16a34a' : '#ca8a04' }
                    ]}>
                      {crop.suitability}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cropDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={14} color="#64748b" />
                    <Text style={styles.detailText}>{crop.season}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="rainy" size={14} color="#64748b" />
                    <Text style={styles.detailText}>{crop.rainfall}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="thermometer" size={14} color="#64748b" />
                    <Text style={styles.detailText}>{crop.temperature}</Text>
                  </View>
                </View>
                
                <View style={styles.soilInfo}>
                  <Ionicons name="earth" size={14} color="#64748b" />
                  <Text style={styles.soilText}>Soil: {crop.soil}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  cropsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cropIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropInfo: {
    flex: 1,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  suitabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suitabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cropDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  soilInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  soilText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
