import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/constants/colors';
import { AppHeader, Loading } from '@/components';
import { cropPlannerService, CropRecommendation } from '@/services/cropPlannerService';
import { weatherService } from '@/services/weatherService';

const { width } = Dimensions.get('window');

const CROP_ICONS: Record<string, string> = {
  groundnut: '🥜',
  soybean: '🫘',
  sunflower: '🌻',
  mustard: '🌼',
  safflower: '🌸',
  sesame: '🌾',
  linseed: '🌿',
  niger: '🌱',
  castor: '🪴',
};

// Helper to capitalize season for display
const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function RecommendationsScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [soilData, setSoilData] = useState<any>(null);
  const [season, setSeason] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const landAcres = parseFloat(params.land_acres as string);
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);
  const district = params.district as string;
  const state = params.state as string;

  // Form fields (editable)
  const [formData, setFormData] = useState({
    crop_name: '',
    crop_type: '',
    land_acres: landAcres,
    sowing_date: new Date(),
    maturity_days: 0,
    msp_price_per_quintal: 0,
    estimated_yield_quintals: 0,
    estimated_yield_per_acre: 0,
    seed_cost: 0,
    fertilizer_cost: 0,
    pesticide_cost: 0,
    labor_cost: 0,
    irrigation_cost: 0,
    notes: '',
  });

  useEffect(() => {
    analyzeAndRecommend();
  }, []);

  const analyzeAndRecommend = async () => {
    try {
      const weatherData = await weatherService.getWeatherByCoords(latitude, longitude);
      setWeather(weatherData);

      const soil = await cropPlannerService.getSoilData(district, state);
      setSoilData(soil);

      const currentSeason = cropPlannerService.getCurrentSeason();
      setSeason(currentSeason);

      const aiRecommendations = await generateAIRecommendations(
        landAcres,
        currentSeason,
        weatherData,
        soil
      );
      
      setRecommendations(aiRecommendations);
      if (aiRecommendations.length > 0) {
        handleSelectCrop(aiRecommendations[0]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async (
    acres: number,
    season: string,
    weatherData: any,
    soil: any
  ): Promise<CropRecommendation[]> => {
    console.log('🤖 Getting AI recommendations...');
    const aiRecommendations = await cropPlannerService.getAICropRecommendations(
      state,
      district,
      latitude,
      longitude,
      season,
      soil?.type || 'Loamy',
      weatherData
    );

    console.log('✅ AI Recommendations received:', aiRecommendations);

    const cropTypes = aiRecommendations.recommended_crops.map(c => c.crop_type);
    const mspPromises = cropTypes.map(cropType => 
      cropPlannerService.getCurrentMSP(cropType).catch(() => cropPlannerService.getDefaultMSP(cropType))
    );
    
    const mspValues = await Promise.all(mspPromises);
    console.log('💰 Fetched MSP values:', mspValues);

    const recommendations: CropRecommendation[] = [];

    aiRecommendations.recommended_crops.forEach((aiCrop, index) => {
      const yieldPerAcre = aiCrop.estimated_yield_per_acre;
      const totalYield = yieldPerAcre * acres;
      const msp = mspValues[index];
      const grossRevenue = totalYield * msp;

      const costMultipliers = getCostMultipliers(aiCrop.crop_type);
      const inputCosts = {
        seed_cost: costMultipliers.seed * acres,
        fertilizer_cost: costMultipliers.fertilizer * acres,
        pesticide_cost: costMultipliers.pesticide * acres,
        labor_cost: costMultipliers.labor * acres,
        irrigation_cost: costMultipliers.irrigation * acres,
        total: (costMultipliers.seed + costMultipliers.fertilizer + costMultipliers.pesticide + costMultipliers.labor + costMultipliers.irrigation) * acres,
      };

      const netProfit = grossRevenue - inputCosts.total;
      const profitPerAcre = netProfit / acres;

      const cropDetails = getCropDetails(aiCrop.crop_type, season);

      recommendations.push({
        crop_name: aiCrop.crop_name,
        crop_type: aiCrop.crop_type,
        suitability_score: aiCrop.suitability_score,
        estimated_yield_per_acre: yieldPerAcre,
        total_estimated_yield: totalYield,
        current_msp: msp,
        projected_gross_revenue: grossRevenue,
        estimated_input_costs: inputCosts,
        net_profit: netProfit,
        profit_per_acre: profitPerAcre,
        growing_period_days: cropDetails.growing_period_days,
        water_requirement: cropDetails.water_requirement,
        season: season,
        advantages: cropDetails.advantages,
        challenges: cropDetails.challenges,
        best_planting_time: cropDetails.best_planting_time,
      });
    });

    return recommendations.sort((a, b) => b.suitability_score - a.suitability_score);
  };

  const getCostMultipliers = (cropType: string) => {
    const costs: Record<string, any> = {
      groundnut: { seed: 3000, fertilizer: 4000, pesticide: 2000, labor: 5000, irrigation: 3000 },
      soybean: { seed: 2500, fertilizer: 3500, pesticide: 1800, labor: 4500, irrigation: 2500 },
      sunflower: { seed: 1500, fertilizer: 3000, pesticide: 1500, labor: 4000, irrigation: 2000 },
      mustard: { seed: 800, fertilizer: 2500, pesticide: 1200, labor: 3500, irrigation: 1500 },
      safflower: { seed: 1000, fertilizer: 2800, pesticide: 1400, labor: 3800, irrigation: 1800 },
      sesame: { seed: 600, fertilizer: 2000, pesticide: 1000, labor: 3000, irrigation: 1200 },
      linseed: { seed: 900, fertilizer: 2600, pesticide: 1300, labor: 3600, irrigation: 1600 },
      niger: { seed: 700, fertilizer: 2200, pesticide: 1100, labor: 3200, irrigation: 1400 },
      castor: { seed: 1200, fertilizer: 3200, pesticide: 1600, labor: 4200, irrigation: 2200 },
    };
    return costs[cropType] || { seed: 2000, fertilizer: 3000, pesticide: 1500, labor: 4000, irrigation: 2000 };
  };

  const getCropDetails = (cropType: string, season: string) => {
    const details: Record<string, any> = {
      groundnut: {
        growing_period_days: 120,
        water_requirement: 'Moderate (500-600mm)',
        advantages: ['High MSP support', 'Good market demand', 'Nitrogen fixing crop', 'Multiple uses'],
        challenges: ['Requires well-drained soil', 'Pest management needed', 'Timely harvest critical'],
        best_planting_time: season === 'rabi' ? 'October-November' : 'June-July',
      },
      soybean: {
        growing_period_days: 95,
        water_requirement: 'Moderate (450-500mm)',
        advantages: ['Short duration crop', 'Good protein source', 'Less water requirement', 'Industrial demand'],
        challenges: ['Yellow mosaic virus risk', 'Requires proper drainage', 'Market price volatility'],
        best_planting_time: 'June-early July',
      },
      sunflower: {
        growing_period_days: 90,
        water_requirement: 'Low to Moderate (400-500mm)',
        advantages: ['Drought tolerant', 'High oil content', 'Quick maturity', 'Good for rotation'],
        challenges: ['Bird damage risk', 'Head rot in rainy season', 'Lower yield per acre'],
        best_planting_time: season === 'rabi' ? 'January-February' : 'June-July',
      },
      mustard: {
        growing_period_days: 120,
        water_requirement: 'Low (350-400mm)',
        advantages: ['Cold tolerant', 'Low water requirement', 'Good for rabi season', 'High oil content'],
        challenges: ['Aphid attack risk', 'White rust disease', 'Needs timely irrigation'],
        best_planting_time: 'October-November',
      },
      safflower: {
        growing_period_days: 110,
        water_requirement: 'Low (400-450mm)',
        advantages: ['Drought resistant', 'Deep root system', 'Good for dry areas', 'Multiple uses'],
        challenges: ['Aphid susceptible', 'Bird damage', 'Seed dormancy issues'],
        best_planting_time: 'October-November',
      },
      sesame: {
        growing_period_days: 85,
        water_requirement: 'Low (300-400mm)',
        advantages: ['Highest oil content', 'Drought tolerant', 'Quick maturity', 'Export demand'],
        challenges: ['Shattering problem', 'Requires dry weather for harvest', 'Low yield'],
        best_planting_time: season === 'kharif' ? 'June-July' : 'March-April',
      },
      linseed: {
        growing_period_days: 130,
        water_requirement: 'Low to Moderate (400-450mm)',
        advantages: ['Omega-3 rich', 'Industrial uses', 'Cool season crop', 'Good market'],
        challenges: ['Long duration', 'Wilt disease risk', 'Moisture sensitive'],
        best_planting_time: 'October-November',
      },
      niger: {
        growing_period_days: 100,
        water_requirement: 'Low (400-500mm)',
        advantages: ['Grows on poor soil', 'Drought tolerant', 'Rainfed crop', 'Low input cost'],
        challenges: ['Low yield', 'Bird damage', 'Shattering issue'],
        best_planting_time: 'June-July',
      },
      castor: {
        growing_period_days: 140,
        water_requirement: 'Low to Moderate (500-600mm)',
        advantages: ['Industrial demand', 'Export quality', 'Drought tolerant', 'Long shelf life'],
        challenges: ['Long duration', 'Toxic seeds', 'Labor intensive'],
        best_planting_time: 'June-July',
      },
    };
    return details[cropType] || details.sunflower;
  };

  const handleSelectCrop = (crop: CropRecommendation) => {
    setSelectedCrop(crop);
    
    // Populate form with selected crop data
    setFormData({
      crop_name: crop.crop_name,
      crop_type: crop.crop_type,
      land_acres: landAcres,
      sowing_date: new Date(),
      maturity_days: crop.growing_period_days,
      msp_price_per_quintal: crop.current_msp,
      estimated_yield_quintals: crop.total_estimated_yield,
      estimated_yield_per_acre: crop.estimated_yield_per_acre,
      seed_cost: crop.estimated_input_costs.seed_cost,
      fertilizer_cost: crop.estimated_input_costs.fertilizer_cost,
      pesticide_cost: crop.estimated_input_costs.pesticide_cost,
      labor_cost: crop.estimated_input_costs.labor_cost,
      irrigation_cost: crop.estimated_input_costs.irrigation_cost,
      notes: `AI Recommended: ${crop.suitability_score}% suitable for ${state}, ${district}`,
    });
  };

  const handleSaveCropPlan = async () => {
    if (!selectedCrop || !formData.crop_type) {
      Alert.alert('Error', 'Please select a crop first');
      return;
    }

    setSaving(true);
    try {
      const totalCosts = formData.seed_cost + formData.fertilizer_cost + 
                        formData.pesticide_cost + formData.labor_cost + formData.irrigation_cost;
      const grossRevenue = formData.estimated_yield_quintals * formData.msp_price_per_quintal;
      const netProfit = grossRevenue - totalCosts;

      const plan = await cropPlannerService.createCropPlan({
        crop_type: formData.crop_type,
        crop_name: formData.crop_name,
        land_acres: formData.land_acres,
        sowing_date: formData.sowing_date.toISOString().split('T')[0],
        maturity_days: formData.maturity_days,
        season: season,
        msp_price_per_quintal: formData.msp_price_per_quintal,
        estimated_yield_quintals: formData.estimated_yield_quintals,
        estimated_yield_per_acre: formData.estimated_yield_per_acre,
        seed_cost: formData.seed_cost,
        fertilizer_cost: formData.fertilizer_cost,
        pesticide_cost: formData.pesticide_cost,
        labor_cost: formData.labor_cost,
        irrigation_cost: formData.irrigation_cost,
        notes: formData.notes,
      });

      // Show success message and auto-redirect
      Alert.alert(
        'Success! ✅',
        `Your ${formData.crop_name} plan has been saved!\n\n` +
        `📊 Expected Profit: ₹${netProfit.toLocaleString('en-IN')}\n` +
        `🌾 Estimated Yield: ${formData.estimated_yield_quintals.toFixed(1)} quintals\n\n` +
        `Redirecting to your saved plans...`
      );

      // Auto-redirect after 1.5 seconds
      setTimeout(() => {
        router.replace('/crop-planner/my-plans');
      }, 1500);
    } catch (error: any) {
      console.error('Save plan error:', error);
      Alert.alert('Error ❌', error.message || 'Failed to save crop plan');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, sowing_date: selectedDate });
    }
  };

  if (loading) {
    return <Loading fullScreen message="Analyzing conditions..." />;
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Crop Recommendations" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Analysis Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📍 {district}, {state}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>🌱 Soil: {soilData?.type || 'Loamy'}</Text>
            <Text style={styles.summaryText}>📅 Season: {capitalizeFirstLetter(season)}</Text>
            <Text style={styles.summaryText}>📏 {landAcres} acres</Text>
          </View>
        </View>

        {/* Horizontal Seed Cards */}
        <Text style={styles.sectionTitle}>Select Recommended Seed 🌾</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.seedScrollView}
          contentContainerStyle={styles.seedScrollContent}
        >
          {recommendations.map((crop, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.seedCard,
                selectedCrop?.crop_type === crop.crop_type && styles.seedCardSelected,
              ]}
              onPress={() => handleSelectCrop(crop)}
            >
              <Text style={styles.seedEmoji}>{CROP_ICONS[crop.crop_type] || '🌱'}</Text>
              <Text style={styles.seedName}>{crop.crop_name}</Text>
              <View style={styles.seedBadge}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.seedScore}>{crop.suitability_score}%</Text>
              </View>
              <Text style={styles.seedProfit}>
                ₹{Math.round(crop.net_profit / 1000)}K profit
              </Text>
              {selectedCrop?.crop_type === crop.crop_type && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Crop Plan Form */}
        {selectedCrop && (
          <>
            <Text style={styles.sectionTitle}>Crop Plan Details 📋</Text>
            
            <View style={styles.formCard}>
              {/* Crop Info */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Crop Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.crop_name}
                  onChangeText={(text) => setFormData({ ...formData, crop_name: text })}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Land Area (acres)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.land_acres.toString()}
                  onChangeText={(text) => setFormData({ ...formData, land_acres: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Date Picker */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Sowing Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                  <Text style={styles.dateText}>{formatDate(formData.sowing_date)}</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.sowing_date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}

              <View style={styles.formRow}>
                <Text style={styles.label}>Growing Period (days)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maturity_days.toString()}
                  onChangeText={(text) => setFormData({ ...formData, maturity_days: parseInt(text) || 0 })}
                  keyboardType="number-pad"
                />
              </View>

              {/* Financial Data */}
              <Text style={styles.subTitle}>💰 Financial Data</Text>

              <View style={styles.formRow}>
                <Text style={styles.label}>MSP (₹/quintal)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.msp_price_per_quintal.toString()}
                  onChangeText={(text) => setFormData({ ...formData, msp_price_per_quintal: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Estimated Yield (quintals)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.estimated_yield_quintals.toFixed(2)}
                  onChangeText={(text) => setFormData({ ...formData, estimated_yield_quintals: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Yield per Acre (quintals)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.estimated_yield_per_acre.toFixed(2)}
                  onChangeText={(text) => setFormData({ ...formData, estimated_yield_per_acre: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Cost Breakdown */}
              <Text style={styles.subTitle}>💸 Input Costs</Text>

              <View style={styles.formRow}>
                <Text style={styles.label}>Seed Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.seed_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, seed_cost: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Fertilizer Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fertilizer_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, fertilizer_cost: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Pesticide Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pesticide_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, pesticide_cost: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Labor Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.labor_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, labor_cost: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.label}>Irrigation Cost (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.irrigation_cost.toString()}
                  onChangeText={(text) => setFormData({ ...formData, irrigation_cost: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Total Summary */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Costs</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      formData.seed_cost + formData.fertilizer_cost + 
                      formData.pesticide_cost + formData.labor_cost + formData.irrigation_cost
                    )}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Gross Revenue</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(formData.estimated_yield_quintals * formData.msp_price_per_quintal)}
                  </Text>
                </View>
                <View style={[styles.summaryItem, { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 }]}>
                  <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Net Profit</Text>
                  <Text style={[styles.summaryValue, { color: COLORS.success, fontWeight: '700' }]}>
                    {formatCurrency(
                      (formData.estimated_yield_quintals * formData.msp_price_per_quintal) -
                      (formData.seed_cost + formData.fertilizer_cost + formData.pesticide_cost + formData.labor_cost + formData.irrigation_cost)
                    )}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  numberOfLines={3}
                  placeholder="Add any additional notes..."
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveCropPlan}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Crop Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 13,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  seedScrollView: {
    marginBottom: 24,
  },
  seedScrollContent: {
    paddingRight: 16,
  },
  seedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  seedCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdf4',
  },
  seedEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  seedName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  seedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  seedScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 4,
  },
  seedProfit: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  formCard: {
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
  formRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 15,
    color: '#1f2937',
    marginLeft: 8,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
