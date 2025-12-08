import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
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

export default function RecommendationsScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [soilData, setSoilData] = useState<any>(null);
  const [season, setSeason] = useState<string>('');

  const landAcres = parseFloat(params.land_acres as string);
  const latitude = parseFloat(params.latitude as string);
  const longitude = parseFloat(params.longitude as string);
  const district = params.district as string;
  const state = params.state as string;

  useEffect(() => {
    analyzeAndRecommend();
  }, []);

  const analyzeAndRecommend = async () => {
    try {
      // Get weather data
      const weatherData = await weatherService.getWeatherByCoords(latitude, longitude);
      setWeather(weatherData);

      // Get soil data
      const soil = await cropPlannerService.getSoilData(district, state);
      setSoilData(soil);

      // Get current season
      const currentSeason = cropPlannerService.getCurrentSeason();
      setSeason(currentSeason);

      // Generate AI-powered recommendations
      const aiRecommendations = await generateAIRecommendations(
        landAcres,
        currentSeason,
        weatherData,
        soil
      );
      
      setRecommendations(aiRecommendations);
      if (aiRecommendations.length > 0) {
        setSelectedCrop(aiRecommendations[0]);
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
    // Get AI-powered crop recommendations
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

    // Fetch MSP for all recommended crops in parallel
    const cropTypes = aiRecommendations.recommended_crops.map(c => c.crop_type);
    const mspPromises = cropTypes.map(cropType => 
      cropPlannerService.getCurrentMSP(cropType).catch(() => cropPlannerService.getDefaultMSP(cropType))
    );
    
    const mspValues = await Promise.all(mspPromises);
    console.log('💰 Fetched MSP values:', mspValues);

    // Build full recommendations with financial calculations
    const recommendations: CropRecommendation[] = [];

    // Process each AI-recommended crop
    aiRecommendations.recommended_crops.forEach((aiCrop, index) => {
      const yieldPerAcre = aiCrop.estimated_yield_per_acre;
      const totalYield = yieldPerAcre * acres;
      const msp = mspValues[index];
      const grossRevenue = totalYield * msp;

      // Calculate input costs based on crop type (estimated)
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

      // Get crop-specific details
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
        advantages: ['High MSP support', 'Good market demand', 'Nitrogen fixing crop', 'Multiple uses (oil, feed)'],
        challenges: ['Requires well-drained soil', 'Pest management needed', 'Timely harvest critical'],
        best_planting_time: season === 'Rabi' ? 'October-November' : 'June-July',
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
        best_planting_time: season === 'Rabi' ? 'January-February' : 'June-July',
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
        best_planting_time: season === 'Kharif' ? 'June-July' : 'March-April',
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
  };

  const handleProceedWithPlan = () => {
    if (!selectedCrop) return;

    router.push({
      pathname: '/crop-planner/plan-details',
      params: {
        crop_name: selectedCrop.crop_name,
        crop_type: selectedCrop.crop_type,
        land_acres: landAcres.toString(),
        estimated_yield: selectedCrop.total_estimated_yield.toString(),
        estimated_revenue: selectedCrop.projected_gross_revenue.toString(),
        growing_period_days: selectedCrop.growing_period_days.toString(),
        net_profit: selectedCrop.net_profit.toString(),
        input_costs: JSON.stringify(selectedCrop.estimated_input_costs),
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
          <Text style={styles.summaryTitle}>Analysis Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{district}, {state}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="leaf" size={20} color={COLORS.primary} />
              <Text style={styles.summaryLabel}>Soil Type</Text>
              <Text style={styles.summaryValue}>{soilData?.type || 'Loamy'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.summaryLabel}>Season</Text>
              <Text style={styles.summaryValue}>{season}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="resize" size={20} color={COLORS.primary} />
              <Text style={styles.summaryLabel}>Land Area</Text>
              <Text style={styles.summaryValue}>{landAcres} acres</Text>
            </View>
          </View>
        </View>

        {/* Recommendations List */}
        <Text style={styles.sectionTitle}>Recommended Oilseeds</Text>
        {recommendations.map((crop, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cropCard,
              selectedCrop?.crop_type === crop.crop_type && styles.cropCardSelected,
            ]}
            onPress={() => handleSelectCrop(crop)}
          >
            <View style={styles.cropHeader}>
              <View style={styles.cropIconContainer}>
                <Text style={styles.cropEmoji}>{CROP_ICONS[crop.crop_type] || '🌱'}</Text>
              </View>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.crop_name}</Text>
                <View style={styles.suitabilityBadge}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.suitabilityText}>
                    {crop.suitability_score}% Suitable
                  </Text>
                </View>
              </View>
              {selectedCrop?.crop_type === crop.crop_type && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </View>

            <View style={styles.cropStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Yield</Text>
                <Text style={styles.statValue}>
                  {crop.total_estimated_yield.toFixed(1)} quintals
                </Text>
                <Text style={styles.statSubtext}>
                  {crop.estimated_yield_per_acre}/acre
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(crop.projected_gross_revenue)}
                </Text>
                <Text style={styles.statSubtext}>Gross</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Profit</Text>
                <Text style={[styles.statValue, { color: COLORS.success }]}>
                  {formatCurrency(crop.net_profit)}
                </Text>
                <Text style={styles.statSubtext}>Net</Text>
              </View>
            </View>

            <View style={styles.cropDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.detailText}>
                  {crop.growing_period_days} days growing period
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="water" size={16} color="#6b7280" />
                <Text style={styles.detailText}>{crop.water_requirement}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Selected Crop Details */}
        {selectedCrop && (
          <>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            
            {/* Revenue Breakdown Chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Revenue Breakdown</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: ['Gross', 'Costs', 'Net Profit'],
                    datasets: [
                      {
                        data: [
                          selectedCrop.projected_gross_revenue,
                          selectedCrop.estimated_input_costs.total,
                          selectedCrop.net_profit,
                        ],
                      },
                    ],
                  }}
                  width={width - 64}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(67, 116, 9, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: COLORS.primary,
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>

              <View style={styles.breakdownList}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Gross Revenue</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(selectedCrop.projected_gross_revenue)}
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Input Costs</Text>
                  <Text style={[styles.breakdownValue, { color: '#ef4444' }]}>
                    -{formatCurrency(selectedCrop.estimated_input_costs.total)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownLabel, { fontWeight: '700' }]}>
                    Net Profit
                  </Text>
                  <Text style={[styles.breakdownValue, { fontWeight: '700', color: COLORS.success }]}>
                    {formatCurrency(selectedCrop.net_profit)}
                  </Text>
                </View>
                <Text style={styles.profitPerAcre}>
                  ≈ {formatCurrency(selectedCrop.profit_per_acre)} per acre
                </Text>
              </View>
            </View>

            {/* Cost Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cost Breakdown</Text>
              {Object.entries(selectedCrop.estimated_input_costs).map(([key, value]) => {
                if (key === 'total') return null;
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <View key={key} style={styles.costItem}>
                    <Text style={styles.costLabel}>{label}</Text>
                    <Text style={styles.costValue}>{formatCurrency(value as number)}</Text>
                  </View>
                );
              })}
            </View>

            {/* Advantages & Challenges */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Advantages</Text>
              {selectedCrop.advantages.map((advantage, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.listText}>{advantage}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Challenges</Text>
              {selectedCrop.challenges.map((challenge, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  <Text style={styles.listText}>{challenge}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedWithPlan}
          disabled={!selectedCrop}
        >
          <Text style={styles.proceedButtonText}>
            Create Cultivation Plan for {selectedCrop?.crop_name}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdf4',
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropEmoji: {
    fontSize: 28,
  },
  cropInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  suitabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suitabilityText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  cropStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  cropDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  breakdownList: {
    marginTop: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  profitPerAcre: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  costLabel: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  proceedButton: {
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
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});
