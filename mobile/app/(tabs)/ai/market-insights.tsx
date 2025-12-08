import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { marketInsightsService, MarketInsightsResponse } from '@/services/marketInsightsService';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;

// Utility function to get crop color
const getCropColor = (crop: string): string => {
  const colors: Record<string, string> = {
    groundnut: '#f59e0b',
    mustard: '#eab308',
    sesame: '#a855f7',
    soybean: '#22c55e',
    sunflower: '#f97316',
  };
  return colors[crop.toLowerCase()] || COLORS.primary;
};

// Pie chart component
const PieChartSlice = ({ percentage, color, label, value, startAngle }: any) => {
  const size = 200;
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <View style={styles.pieChartLegendItem}>
      <View style={[styles.pieChartLegendColor, { backgroundColor: color }]} />
      <View style={styles.pieChartLegendText}>
        <Text style={styles.pieChartLegendLabel}>{label}</Text>
        <Text style={styles.pieChartLegendValue}>{value} ({percentage.toFixed(1)}%)</Text>
      </View>
    </View>
  );
};

// Utility function to aggregate data by crop
const aggregateByCrop = (data: any) => {
  const cropData: Record<string, { demand: number; supply: number; avgPrice: number; count: number }> = {};
  
  if (!data.crop_type || !Array.isArray(data.crop_type)) return [];
  
  data.crop_type.forEach((crop: string, idx: number) => {
    if (!cropData[crop]) {
      cropData[crop] = { demand: 0, supply: 0, avgPrice: 0, count: 0 };
    }
    cropData[crop].demand += data.demand_quintals?.[idx] || 0;
    cropData[crop].supply += data.supply_quintals?.[idx] || 0;
    cropData[crop].avgPrice += data.avg_price?.[idx] || 0;
    cropData[crop].count += 1;
  });

  return Object.entries(cropData).map(([crop, values]) => ({
    crop,
    demand: Math.round(values.demand),
    supply: Math.round(values.supply),
    gap: Math.round(values.demand - values.supply),
    avgPrice: Math.round(values.avgPrice / values.count),
  }));
};

export default function MarketInsightsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<MarketInsightsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'opportunities' | 'prices' | 'forecast'>('overview');
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchMarketInsights();
  }, []);

  const fetchMarketInsights = async () => {
    try {
      setLoading(true);
      const role = user?.role as 'fpo' | 'retailer' | 'processor' | 'farmer' | undefined;
      const data = await marketInsightsService.getMarketInsights(role);
      setMarketData(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch market insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMarketInsights();
  };

  const renderInsightCard = (title: string, icon: string, data: Record<string, any>, color: string) => {
    const hasData = Object.keys(data).length > 0;

    return (
      <View style={styles.insightCard}>
        <View style={[styles.cardHeader, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        
        {hasData ? (
          <View style={styles.cardContent}>
            {Object.entries(data).map(([key, value], index) => (
              <View key={index} style={styles.dataRow}>
                <Text style={styles.dataKey}>{key.replace(/_/g, ' ').toUpperCase()}:</Text>
                <Text style={styles.dataValue}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="file-tray-outline" size={32} color={COLORS.text.tertiary} />
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCropBar = (crop: string, demand: number, supply: number, maxValue: number, avgPrice: number) => {
    const demandWidth = (demand / maxValue) * CHART_WIDTH;
    const supplyWidth = (supply / maxValue) * CHART_WIDTH;
    const gap = demand - supply;
    const gapColor = gap > 0 ? COLORS.error : '#22c55e';

    return (
      <View key={crop} style={styles.cropBarContainer}>
        <Text style={styles.cropName}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</Text>
        
        <View style={styles.barWrapper}>
          {/* Demand Bar */}
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Demand</Text>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: demandWidth, backgroundColor: '#3b82f6' }]} />
            </View>
            <Text style={styles.barValue}>{demand.toLocaleString()} Q</Text>
          </View>

          {/* Supply Bar */}
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Supply</Text>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: supplyWidth, backgroundColor: '#22c55e' }]} />
            </View>
            <Text style={styles.barValue}>{supply.toLocaleString()} Q</Text>
          </View>
        </View>

        {/* Gap and Price Info */}
        <View style={styles.cropFooter}>
          <View style={[styles.gapBadge, { backgroundColor: gapColor + '15' }]}>
            <Text style={[styles.gapText, { color: gapColor }]}>
              Gap: {gap > 0 ? '+' : ''}{gap.toLocaleString()} Q
            </Text>
          </View>
          <View style={styles.priceBadge}>
            <Ionicons name="cash-outline" size={14} color={COLORS.warning} />
            <Text style={styles.priceText}>₹{avgPrice.toLocaleString()}/Q</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderShortageCard = (shortage: any, index: number) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[shortage.month - 1];
    
    return (
      <View key={index} style={styles.shortageCard}>
        <View style={styles.shortageHeader}>
          <View style={styles.shortageIcon}>
            <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          </View>
          <View style={styles.shortageInfo}>
            <Text style={styles.shortageCrop}>{shortage.crop_type}</Text>
            <Text style={styles.shortageDate}>{month} {shortage.year}</Text>
          </View>
          <View style={styles.shortageGap}>
            <Text style={styles.shortageGapValue}>{Math.round(shortage.demand_supply_gap).toLocaleString()}</Text>
            <Text style={styles.shortageGapLabel}>Quintals Short</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPieChart = (cropStats: any[]) => {
    const total = cropStats.reduce((sum, stat) => sum + stat.demand, 0);
    
    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChartHeader}>
          <Text style={styles.chartTitle}>Crop Distribution by Demand</Text>
          <View style={styles.chartControls}>
            <TouchableOpacity 
              style={[styles.chartControlBtn, selectedChartType === 'pie' && styles.chartControlBtnActive]}
              onPress={() => setSelectedChartType('pie')}
            >
              <Ionicons name="pie-chart" size={16} color={selectedChartType === 'pie' ? COLORS.white : COLORS.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chartControlBtn, selectedChartType === 'bar' && styles.chartControlBtnActive]}
              onPress={() => setSelectedChartType('bar')}
            >
              <Ionicons name="bar-chart" size={16} color={selectedChartType === 'bar' ? COLORS.white : COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {selectedChartType === 'pie' ? (
          <View style={styles.pieChartContent}>
            {/* Donut Chart Visualization */}
            <View style={styles.donutChart}>
              {cropStats.map((stat, index) => {
                const percentage = (stat.demand / total) * 100;
                return (
                  <View key={stat.crop} style={styles.donutSegment}>
                    <View style={[styles.donutBar, { 
                      width: `${percentage}%`, 
                      backgroundColor: getCropColor(stat.crop),
                      height: 40
                    }]} />
                  </View>
                );
              })}
            </View>
            
            {/* Legend */}
            <View style={styles.pieChartLegend}>
              {cropStats.map((stat) => {
                const percentage = (stat.demand / total) * 100;
                return (
                  <PieChartSlice
                    key={stat.crop}
                    percentage={percentage}
                    color={getCropColor(stat.crop)}
                    label={stat.crop.charAt(0).toUpperCase() + stat.crop.slice(1)}
                    value={`${stat.demand.toLocaleString()} Q`}
                    startAngle={0}
                  />
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.barChartContent}>
            {cropStats.map((stat) => {
              const maxDemand = Math.max(...cropStats.map(s => s.demand));
              const barWidth = (stat.demand / maxDemand) * (width - 120);
              
              return (
                <View key={stat.crop} style={styles.barChartRow}>
                  <Text style={styles.barChartLabel}>{stat.crop.charAt(0).toUpperCase() + stat.crop.slice(1)}</Text>
                  <View style={styles.barChartBarContainer}>
                    <Animated.View 
                      style={[styles.barChartBar, { 
                        width: barWidth, 
                        backgroundColor: getCropColor(stat.crop)
                      }]} 
                    />
                  </View>
                  <Text style={styles.barChartValue}>{stat.demand.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderLineChart = (priceData: any) => {
    if (!priceData?.crop_type) return null;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData: Record<string, any[]> = {};

    // Group data by crop
    priceData.crop_type.forEach((crop: string, idx: number) => {
      if (!chartData[crop]) chartData[crop] = [];
      chartData[crop].push({
        month: months[priceData.month[idx] - 1],
        price: priceData.avg_price[idx],
        monthNum: priceData.month[idx],
        year: priceData.year[idx]
      });
    });

    // Get all unique months across all crops
    const allMonths = Array.from(new Set(priceData.month)).sort((a, b) => a - b);
    const monthLabels = allMonths.map(m => months[m - 1]);

    // Get all prices to calculate scale
    const allPrices = priceData.avg_price.filter((p: number) => p > 0);
    const maxPrice = Math.max(...allPrices);
    const minPrice = Math.min(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    // Get top 3 crops by average price
    const cropAverages = Object.entries(chartData).map(([crop, data]: [string, any]) => ({
      crop,
      avgPrice: data.reduce((sum: number, d: any) => sum + d.price, 0) / data.length,
      data: data.sort((a: any, b: any) => a.monthNum - b.monthNum)
    })).sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 3);

    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.lineChartHeader}>
          <Text style={styles.chartTitle}>Price Trends Comparison</Text>
          <Text style={styles.chartSubtitle}>Top 3 Crops by Average Price</Text>
        </View>
        
        {/* Legend */}
        <View style={styles.chartLegend}>
          {cropAverages.map(({ crop }) => (
            <View key={crop} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getCropColor(crop) }]} />
              <Text style={styles.legendLabel}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.lineChartContent}>
          <View style={styles.lineChartYAxis}>
            <Text style={styles.yAxisLabel}>₹{Math.round(maxPrice).toLocaleString()}</Text>
            <Text style={styles.yAxisLabel}>₹{Math.round((maxPrice + minPrice) / 2).toLocaleString()}</Text>
            <Text style={styles.yAxisLabel}>₹{Math.round(minPrice).toLocaleString()}</Text>
          </View>
          
          <View style={styles.lineChartGraph}>
            {/* Grid lines */}
            <View style={styles.gridLines}>
              {[0, 1, 2, 3, 4].map(i => (
                <View key={i} style={styles.gridLine} />
              ))}
            </View>
            
            {/* Line paths for each crop */}
            {cropAverages.map(({ crop, data }) => (
              <View key={crop} style={styles.linePath}>
                {data.map((point: any, index: number) => {
                  const monthIndex = allMonths.indexOf(point.monthNum);
                  if (monthIndex === -1) return null;
                  
                  const x = (monthIndex / (allMonths.length - 1)) * (width - 140);
                  const y = ((maxPrice - point.price) / priceRange) * 130;
                  
                  return (
                    <View key={`${crop}-${index}`} style={[styles.linePoint, { left: x, top: y }]}>
                      <View style={[styles.pointDot, { 
                        backgroundColor: getCropColor(crop),
                        borderWidth: 2,
                        borderColor: COLORS.white
                      }]} />
                    </View>
                  );
                })}
              </View>
            ))}
            
            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              {monthLabels.map((month, index) => (
                <Text key={index} style={styles.xAxisLabel}>{month}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Price Stats */}
        <View style={styles.priceStats}>
          {cropAverages.map(({ crop, avgPrice }) => (
            <View key={crop} style={styles.priceStatItem}>
              <View style={[styles.priceStatDot, { backgroundColor: getCropColor(crop) }]} />
              <View style={styles.priceStatInfo}>
                <Text style={styles.priceStatLabel}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</Text>
                <Text style={styles.priceStatValue}>₹{Math.round(avgPrice).toLocaleString()}/Q avg</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOpportunityScore = (shortage: any) => {
    const gap = shortage.demand_supply_gap?.[0] || 0;
    const score = Math.min((gap / 3000) * 100, 100);
    
    return (
      <View style={styles.opportunityScoreCard}>
        <View style={styles.scoreCircle}>
          <View style={[styles.scoreCircleInner, { 
            borderColor: score > 70 ? '#22c55e' : score > 40 ? COLORS.warning : COLORS.error,
            borderWidth: 8
          }]}>
            <Text style={styles.scoreValue}>{Math.round(score)}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>
        
        <View style={styles.scoreDetails}>
          <View style={styles.scoreDetailRow}>
            <Ionicons name="trending-up" size={20} color="#22c55e" />
            <Text style={styles.scoreDetailLabel}>Demand Gap:</Text>
            <Text style={styles.scoreDetailValue}>{Math.round(gap).toLocaleString()} Q</Text>
          </View>
          <View style={styles.scoreDetailRow}>
            <Ionicons name="flash" size={20} color={COLORS.warning} />
            <Text style={styles.scoreDetailLabel}>Urgency:</Text>
            <Text style={styles.scoreDetailValue}>{score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low'}</Text>
          </View>
          <View style={styles.scoreDetailRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.scoreDetailLabel}>Recommendation:</Text>
            <Text style={styles.scoreDetailValue}>{score > 70 ? 'Sell Now' : 'Monitor'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderExecutiveSummary = () => {
    if (!marketData?.farmer_insights) return null;

    const cropStats = aggregateByCrop(marketData.market_summary.actual);
    const topShortage = marketData.farmer_insights.market_shortages;
    const topPrice = marketData.farmer_insights.best_price_crops;
    const forecastShortage = marketData.farmer_insights.forecast_shortages;

    // Calculate key insights
    const highestGapCrop = topShortage.crop_type?.[0];
    const highestGapAmount = topShortage.demand_supply_gap?.[0];
    const bestPriceCrop = topPrice.crop_type?.[0];
    const bestPriceAmount = topPrice.avg_price?.[0];
    const nextOpportunityCrop = forecastShortage.crop_type?.[0];
    const nextOpportunityGap = forecastShortage.demand_supply_gap?.[0];

    return (
      <View style={styles.executiveCard}>
        <View style={styles.executiveHeader}>
          <View style={styles.executiveIcon}>
            <Ionicons name="bulb" size={28} color={COLORS.warning} />
          </View>
          <View style={styles.executiveHeaderText}>
            <Text style={styles.executiveTitle}>Key Insights for Farmers</Text>
            <Text style={styles.executiveSubtitle}>Personalized recommendations based on market data</Text>
          </View>
        </View>

        <View style={styles.insightGrid}>
          {/* Top Opportunity Now */}
          <View style={[styles.insightBox, { borderLeftColor: '#22c55e', borderLeftWidth: 4 }]}>
            <View style={styles.insightBoxHeader}>
              <Ionicons name="trending-up" size={20} color="#22c55e" />
              <Text style={styles.insightBoxLabel}>Best Opportunity Now</Text>
            </View>
            <Text style={styles.insightBoxCrop}>{highestGapCrop?.toUpperCase()}</Text>
            <Text style={styles.insightBoxValue}>+{Math.round(highestGapAmount || 0).toLocaleString()} Q shortage</Text>
            <Text style={styles.insightBoxHint}>High demand, limited supply</Text>
          </View>

          {/* Best Price */}
          <View style={[styles.insightBox, { borderLeftColor: COLORS.warning, borderLeftWidth: 4 }]}>
            <View style={styles.insightBoxHeader}>
              <Ionicons name="cash" size={20} color={COLORS.warning} />
              <Text style={styles.insightBoxLabel}>Highest Price</Text>
            </View>
            <Text style={styles.insightBoxCrop}>{bestPriceCrop?.toUpperCase()}</Text>
            <Text style={styles.insightBoxValue}>₹{Math.round(bestPriceAmount || 0).toLocaleString()}/Q</Text>
            <Text style={styles.insightBoxHint}>Best market rate available</Text>
          </View>

          {/* Future Opportunity */}
          <View style={[styles.insightBox, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]}>
            <View style={styles.insightBoxHeader}>
              <Ionicons name="calendar" size={20} color="#3b82f6" />
              <Text style={styles.insightBoxLabel}>Next Month's Best</Text>
            </View>
            <Text style={styles.insightBoxCrop}>{nextOpportunityCrop?.toUpperCase()}</Text>
            <Text style={styles.insightBoxValue}>+{Math.round(nextOpportunityGap || 0).toLocaleString()} Q forecast gap</Text>
            <Text style={styles.insightBoxHint}>Plan ahead for this crop</Text>
          </View>

          {/* Market Activity */}
          <View style={[styles.insightBox, { borderLeftColor: COLORS.primary, borderLeftWidth: 4 }]}>
            <View style={styles.insightBoxHeader}>
              <Ionicons name="bar-chart" size={20} color={COLORS.primary} />
              <Text style={styles.insightBoxLabel}>Total Market Activity</Text>
            </View>
            <Text style={styles.insightBoxCrop}>{cropStats.length} CROPS</Text>
            <Text style={styles.insightBoxValue}>{marketData.total_orders.toLocaleString()} orders</Text>
            <Text style={styles.insightBoxHint}>Active marketplace</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPriceCard = (price: any, index: number, isBest: boolean = true) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[price.month - 1];
    
    return (
      <View key={index} style={styles.priceCard}>
        <View style={styles.priceCardHeader}>
          <View style={[styles.priceIcon, { backgroundColor: isBest ? '#22c55e15' : COLORS.primary + '15' }]}>
            <Ionicons name={isBest ? "trending-up" : "cash"} size={20} color={isBest ? '#22c55e' : COLORS.primary} />
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceCrop}>{price.crop_type}</Text>
            <Text style={styles.priceDate}>{month} {price.year}</Text>
          </View>
        </View>
        <View style={styles.priceAmount}>
          <Text style={styles.priceSymbol}>₹</Text>
          <Text style={styles.priceValue}>{Math.round(price.avg_price).toLocaleString()}</Text>
          <Text style={styles.priceUnit}>/Q</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Market Insights"
          onMenuPress={() => setSidebarVisible(true)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Market Insights"
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Category Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <Ionicons name="grid" size={20} color={selectedTab === 'overview' ? COLORS.white : COLORS.text.secondary} />
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>Overview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'opportunities' && styles.tabActive]}
            onPress={() => setSelectedTab('opportunities')}
          >
            <Ionicons name="trending-up" size={20} color={selectedTab === 'opportunities' ? COLORS.white : COLORS.text.secondary} />
            <Text style={[styles.tabText, selectedTab === 'opportunities' && styles.tabTextActive]}>Opportunities</Text>
          </TouchableOpacity>
          
        
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'forecast' && styles.tabActive]}
            onPress={() => setSelectedTab('forecast')}
          >
            <Ionicons name="telescope" size={20} color={selectedTab === 'forecast' ? COLORS.white : COLORS.text.secondary} />
            <Text style={[styles.tabText, selectedTab === 'forecast' && styles.tabTextActive]}>Forecast</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {marketData && (
          <>
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <>
                {renderExecutiveSummary()}
                
                {/* Quick Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Ionicons name="cart" size={24} color={COLORS.primary} />
                    <Text style={styles.statValue}>{marketData.total_orders}</Text>
                    <Text style={styles.statLabel}>Total Orders</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="leaf" size={24} color="#22c55e" />
                    <Text style={styles.statValue}>{aggregateByCrop(marketData.market_summary.actual).length}</Text>
                    <Text style={styles.statLabel}>Active Crops</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="analytics" size={24} color={COLORS.warning} />
                    <Text style={styles.statValue}>
                      {Math.round(aggregateByCrop(marketData.market_summary.actual).reduce((sum, s) => sum + s.gap, 0))}
                    </Text>
                    <Text style={styles.statLabel}>Total Gap (Q)</Text>
                  </View>
                </View>

                {/* Crop Distribution Chart */}
                {renderPieChart(aggregateByCrop(marketData.market_summary.actual))}
              </>
            )}

            {/* Opportunities Tab */}
            {selectedTab === 'opportunities' && marketData.farmer_insights && (
              <>
                <View style={styles.tabHeader}>
                  <Ionicons name="bulb" size={28} color={COLORS.warning} />
                  <Text style={styles.tabHeaderTitle}>Market Opportunities</Text>
                  <Text style={styles.tabHeaderSubtitle}>Current shortages with high profit potential</Text>
                </View>

                {/* Opportunity Score */}
                {renderOpportunityScore(marketData.farmer_insights.market_shortages)}

                {/* Top Shortages */}
                <Text style={styles.sectionTitle}>🚨 High-Demand Crops</Text>
                <View style={styles.shortagesContainer}>
                  {marketData.farmer_insights.market_shortages.crop_type?.slice(0, 5).map((crop: any, idx: number) => 
                    renderShortageCard({
                      crop_type: crop,
                      year: marketData.farmer_insights!.market_shortages.year[idx],
                      month: marketData.farmer_insights!.market_shortages.month[idx],
                      demand_supply_gap: marketData.farmer_insights!.market_shortages.demand_supply_gap[idx]
                    }, idx)
                  )}
                </View>

                {/* Action Items */}
                <View style={styles.actionCard}>
                  <View style={styles.actionHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                    <Text style={styles.actionTitle}>Recommended Actions</Text>
                  </View>
                  
                  <View style={styles.actionList}>
                    {marketData.farmer_insights.market_shortages?.crop_type?.[0] && (
                      <View style={styles.actionItem}>
                        <View style={styles.actionNumber}>
                          <Text style={styles.actionNumberText}>1</Text>
                        </View>
                        <View style={styles.actionContent}>
                          <Text style={styles.actionItemTitle}>
                            Sell {marketData.farmer_insights.market_shortages.crop_type[0]} Now
                          </Text>
                          <Text style={styles.actionItemDesc}>
                            Current shortage of {Math.round(marketData.farmer_insights.market_shortages.demand_supply_gap[0]).toLocaleString()} quintals. 
                            High demand means better negotiating power.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}

            

            {/* Forecast Tab */}
            {selectedTab === 'forecast' && marketData.farmer_insights && (
              <>
                <View style={styles.tabHeader}>
                  <Ionicons name="telescope" size={28} color="#3b82f6" />
                  <Text style={styles.tabHeaderTitle}>AI Forecasts</Text>
                  <Text style={styles.tabHeaderSubtitle}>Predictions for next 60 days</Text>
                </View>

                {/* Forecast Shortages */}
                {marketData.farmer_insights.forecast_shortages?.crop_type && (
                  <>
                    <Text style={styles.sectionTitle}>📈 Predicted Shortages</Text>
                    <Text style={styles.sectionSubtitle}>Plan your planting based on future demand</Text>
                    <View style={styles.shortagesContainer}>
                      {marketData.farmer_insights.forecast_shortages.crop_type.slice(0, 5).map((crop: any, idx: number) => 
                        renderShortageCard({
                          crop_type: crop,
                          year: marketData.farmer_insights!.forecast_shortages.year[idx],
                          month: marketData.farmer_insights!.forecast_shortages.month[idx],
                          demand_supply_gap: marketData.farmer_insights!.forecast_shortages.demand_supply_gap[idx]
                        }, idx)
                      )}
                    </View>
                  </>
                )}

                {/* Forecast Prices */}
                {marketData.farmer_insights.forecast_best_prices?.crop_type && (
                  <>
                    <Text style={styles.sectionTitle}>🔮 Predicted Prices</Text>
                    <Text style={styles.sectionSubtitle}>AI-powered price forecasts</Text>
                    <View style={styles.priceGrid}>
                      {marketData.farmer_insights.forecast_best_prices.crop_type.slice(0, 6).map((crop: any, idx: number) => 
                        renderPriceCard({
                          crop_type: crop,
                          year: marketData.farmer_insights!.forecast_best_prices.year[idx],
                          month: marketData.farmer_insights!.forecast_best_prices.month[idx],
                          avg_price: marketData.farmer_insights!.forecast_best_prices.avg_price[idx]
                        }, idx, false)
                      )}
                    </View>
                  </>
                )}

                {/* Planning Tips */}
                <View style={styles.planningCard}>
                  <Ionicons name="calendar" size={24} color={COLORS.primary} />
                  <Text style={styles.planningTitle}>Smart Planning Tips</Text>
                  <View style={styles.planningTips}>
                    <View style={styles.planningTip}>
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                      <Text style={styles.planningTipText}>Start preparing seeds 30 days before predicted shortage</Text>
                    </View>
                    <View style={styles.planningTip}>
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                      <Text style={styles.planningTipText}>Monitor soil conditions for forecasted crops</Text>
                    </View>
                    <View style={styles.planningTip}>
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                      <Text style={styles.planningTipText}>Book FPO services early for predicted high-demand periods</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        )}

        {/* Empty State */}
        {!marketData?.data_available && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Market Data Available</Text>
            <Text style={styles.emptyStateText}>
              Market insights are generated based on order data. Check back later for updates.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
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
  tabBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabHeader: {
    margin: 20,
    marginBottom: 0,
    alignItems: 'center',
  },
  tabHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  tabHeaderSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  pieChartContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  pieChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  chartControls: {
    flexDirection: 'row',
    gap: 8,
  },
  chartControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartControlBtnActive: {
    backgroundColor: COLORS.primary,
  },
  pieChartContent: {
    gap: 20,
  },
  donutChart: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  donutSegment: {
    height: '100%',
  },
  donutBar: {
    height: '100%',
  },
  pieChartLegend: {
    gap: 12,
  },
  pieChartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pieChartLegendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieChartLegendText: {
    flex: 1,
  },
  pieChartLegendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  pieChartLegendValue: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  barChartContent: {
    gap: 16,
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barChartLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  barChartBarContainer: {
    flex: 1,
    height: 28,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    overflow: 'hidden',
  },
  barChartBar: {
    height: '100%',
    borderRadius: 14,
  },
  barChartValue: {
    width: 60,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'right',
  },
  lineChartContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lineChartHeader: {
    marginBottom: 16,
  },
  chartSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  priceStats: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  priceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priceStatInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  priceStatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  lineChartContent: {
    flexDirection: 'row',
    gap: 12,
  },
  lineChartYAxis: {
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  lineChartGraph: {
    flex: 1,
    height: 160,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  linePath: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
  },
  linePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  pointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  pointTooltip: {
    position: 'absolute',
    top: -28,
    left: -20,
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pointTooltipText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  opportunityScoreCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreDetails: {
    gap: 12,
  },
  scoreDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreDetailLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  scoreDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  planningCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  planningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 16,
  },
  planningTips: {
    gap: 12,
  },
  planningTip: {
    flexDirection: 'row',
    gap: 10,
  },
  planningTipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  summaryCard: {
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateRangeText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cropBarContainer: {
    marginBottom: 24,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  barWrapper: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 60,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  barBackground: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barValue: {
    width: 80,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'right',
  },
  cropFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gapBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gapText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.warning,
  },
  insightCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  dataRow: {
    marginBottom: 12,
  },
  dataKey: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    marginTop: 8,
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
  executiveCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  executiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  executiveIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.warning + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  executiveHeaderText: {
    flex: 1,
  },
  executiveTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  executiveSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  insightGrid: {
    gap: 16,
  },
  insightBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  insightBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightBoxCrop: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  insightBoxHint: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  actionCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  actionList: {
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    gap: 12,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  actionContent: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  actionItemDesc: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
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
    backgroundColor: COLORS.warning + '15',
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
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    gap: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  viewModeTextActive: {
    color: COLORS.white,
  },
  shortageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  shortageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shortageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortageInfo: {
    flex: 1,
  },
  shortageCrop: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  shortageDate: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  shortageGap: {
    alignItems: 'flex-end',
  },
  shortageGapValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 2,
  },
  shortageGapLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  shortagesContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  priceCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  priceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  priceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  priceCrop: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  priceDate: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  priceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginHorizontal: 20,
    marginBottom: 12,
  },
});
       
