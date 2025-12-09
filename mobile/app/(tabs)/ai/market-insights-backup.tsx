import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { 
  marketInsightsService, 
  MarketForecastResponse,
  AllCropsForecastResponse,
  CropForecast
} from '@/services/marketInsightsService';

const { width } = Dimensions.get('window');

// Tab type
type TabType = 'overview' | 'allCrops' | 'demand' | 'seasonal';

// Crop options
const CROP_OPTIONS = [
  { label: 'All Crops', value: 'all' },
  { label: 'Sesame', value: 'sesame' },
  { label: 'Soybean', value: 'soybean' },
  { label: 'Mustard', value: 'mustard' },
  { label: 'Groundnut', value: 'groundnut' },
  { label: 'Sunflower', value: 'sunflower' },
];

// Time period options
const TIME_PERIODS = [
  { label: '7 Days', value: 7 },
  { label: '15 Days', value: 15 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
];

export default function MarketInsightsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketData, setMarketData] = useState<MarketForecastResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('price');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<number>(30);
  const [showCropFilter, setShowCropFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const data = await marketInsightsService.getMarketForecast('farmer');
      setMarketData(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  const getActionButtonStyle = (action: string) => {
    switch (action) {
      case 'Sell Soon':
        return { colors: ['#ef4444', '#dc2626'], icon: 'trending-down' as const, textColor: '#fff' };
      case 'Wait & Watch':
        return { colors: ['#3b82f6', '#2563eb'], icon: 'time' as const, textColor: '#fff' };
      case 'Flexible':
        return { colors: ['#10b981', '#059669'], icon: 'checkmark-circle' as const, textColor: '#fff' };
      default:
        return { colors: ['#6b7280', '#4b5563'], icon: 'eye' as const, textColor: '#fff' };
    }
  };

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/₹([\d,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(2)} K`;
    }
    return `₹${num.toFixed(2)}`;
  };

  const formatQuantity = (qty: string): string => {
    const match = qty.match(/([\d,]+)/);
    if (!match) return qty;
    const num = parseFloat(match[1].replace(/,/g, ''));
    if (num >= 10000) {
      return `${(num / 1000).toFixed(1)}K quintals`;
    }
    return qty;
  };

  const getCropDisplayName = (crop: string): string => {
    return crop.charAt(0).toUpperCase() + crop.slice(1);
  };

  const renderPriceTrendTab = () => {
    if (!marketData?.insights) return null;

    const { insights } = marketData;
    const currentPrice = parsePrice(insights.price_today);
    const futurePrice = parsePrice(insights.price_expected_30_days);
    const priceChange = futurePrice - currentPrice;
    const priceChangePercent = currentPrice > 0 ? ((priceChange / currentPrice) * 100) : 0;

    // Get selected crop or most valuable crop for display
    const displayCrop = selectedCrop === 'all' 
      ? (insights.top_crops_by_price[0]?.crop || 'market average')
      : selectedCrop;

    return (
      <View style={styles.tabContent}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowCropFilter(!showCropFilter)}
            >
              <Ionicons name="leaf" size={16} color={COLORS.primary} />
              <Text style={styles.filterButtonText}>
                {selectedCrop === 'all' ? 'All Crops' : getCropDisplayName(selectedCrop)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowTimeFilter(!showTimeFilter)}
            >
              <Ionicons name="calendar" size={16} color={COLORS.primary} />
              <Text style={styles.filterButtonText}>{timePeriod} Days</Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Crop Filter Dropdown */}
          {showCropFilter && (
            <View style={styles.filterDropdown}>
              {CROP_OPTIONS.map((crop) => (
                <TouchableOpacity
                  key={crop.value}
                  style={[
                    styles.filterOption,
                    selectedCrop === crop.value && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    setSelectedCrop(crop.value);
                    setShowCropFilter(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedCrop === crop.value && styles.filterOptionTextActive
                  ]}>
                    {crop.label}
                  </Text>
                  {selectedCrop === crop.value && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Time Filter Dropdown */}
          {showTimeFilter && (
            <View style={styles.filterDropdown}>
              {TIME_PERIODS.map((period) => (
                <TouchableOpacity
                  key={period.value}
                  style={[
                    styles.filterOption,
                    timePeriod === period.value && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    setTimePeriod(period.value);
                    setShowTimeFilter(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    timePeriod === period.value && styles.filterOptionTextActive
                  ]}>
                    {period.label}
                  </Text>
                  {timePeriod === period.value && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Crop Name Header */}
        <View style={styles.cropHeader}>
          <Ionicons name="leaf" size={24} color={COLORS.primary} />
          <Text style={styles.cropHeaderText}>
            {getCropDisplayName(displayCrop)} Price Forecast
          </Text>
        </View>

        {/* Price Cards */}
        <View style={styles.priceCardsRow}>
          <View style={[styles.priceCard, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.priceCardLabel}>Current Price</Text>
            <Text style={styles.priceCardValue}>
              ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.priceCardSubtext}>per quintal</Text>
            <Ionicons name="today" size={20} color={COLORS.primary} style={styles.priceCardIcon} />
          </View>
          <View style={[styles.priceCard, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.priceCardLabel}>{timePeriod}-Day Forecast</Text>
            <Text style={styles.priceCardValue}>
              ₹{futurePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.priceCardSubtext}>per quintal</Text>
            <Ionicons name="trending-up" size={20} color="#3b82f6" style={styles.priceCardIcon} />
          </View>
        </View>

        {/* Line Chart Visualization */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Price Trend (Next {timePeriod} Days)</Text>
            <View style={[
              styles.trendBadge,
              { backgroundColor: priceChange >= 0 ? '#dcfce7' : '#fee2e2' }
            ]}>
              <Ionicons 
                name={priceChange >= 0 ? "trending-up" : "trending-down"} 
                size={14} 
                color={priceChange >= 0 ? "#16a34a" : "#dc2626"} 
              />
              <Text style={[
                styles.trendBadgeText,
                { color: priceChange >= 0 ? "#16a34a" : "#dc2626" }
              ]}>
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.lineChart}>
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>
                ₹{Math.round(Math.max(currentPrice, futurePrice)).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.yAxisLabel}>
                ₹{Math.round((currentPrice + futurePrice) / 2).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.yAxisLabel}>
                ₹{Math.round(Math.min(currentPrice, futurePrice)).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.chartArea}>
              <View style={styles.chartGrid}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gridLine} />
                ))}
              </View>
              <View style={styles.lineChartPath}>
                {/* Simulated trend line */}
                <View style={styles.trendLineContainer}>
                  <View 
                    style={[
                      styles.trendLine,
                      {
                        height: priceChange >= 0 ? '60%' : '40%',
                        backgroundColor: priceChange >= 0 ? '#10b981' : '#ef4444',
                      }
                    ]}
                  />
                  <View style={styles.dataPoints}>
                    <View style={[styles.dataPoint, { backgroundColor: COLORS.primary }]}>
                      <View style={styles.dataPointLabel}>
                        <Text style={styles.dataPointLabelText}>
                          ₹{Math.round(currentPrice).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.dataPoint, { backgroundColor: '#3b82f6', right: 0, left: 'auto' }]}>
                      <View style={[styles.dataPointLabel, { right: 0, left: 'auto' }]}>
                        <Text style={styles.dataPointLabelText}>
                          ₹{Math.round(futurePrice).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>Today</Text>
                <Text style={styles.xAxisLabel}>{Math.round(timePeriod / 2)} Days</Text>
                <Text style={styles.xAxisLabel}>{timePeriod} Days</Text>
              </View>
            </View>
          </View>
          
          {/* Price Change Indicator */}
          <View style={styles.priceChangeIndicator}>
            <View style={styles.priceChangeLeft}>
              <Text style={styles.priceChangeLabel}>Expected Change:</Text>
              <Text style={[
                styles.priceChangeValue,
                { color: priceChange >= 0 ? "#10b981" : "#ef4444" }
              ]}>
                {priceChange >= 0 ? '+' : ''}₹{Math.abs(priceChange).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[
              styles.priceChangeChip,
              { backgroundColor: priceChange >= 0 ? '#dcfce7' : '#fee2e2' }
            ]}>
              <Ionicons 
                name={priceChange >= 0 ? "arrow-up" : "arrow-down"} 
                size={16} 
                color={priceChange >= 0 ? "#16a34a" : "#dc2626"} 
              />
              <Text style={[
                styles.priceChangeChipText,
                { color: priceChange >= 0 ? "#16a34a" : "#dc2626" }
              ]}>
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendation Card */}
        {insights.recommendation && (
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={styles.recommendationTitle}>Market Recommendation</Text>
            </View>
            <Text style={styles.recommendationMessage}>{insights.recommendation.message}</Text>
            {insights.recommendation.suggestion && (
              <Text style={styles.recommendationSuggestion}>
                💡 {insights.recommendation.suggestion}
              </Text>
            )}
            {insights.recommendation.best_time_to_sell && (
              <View style={styles.bestTimeContainer}>
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <Text style={styles.bestTimeText}>
                  Best Time: {insights.recommendation.best_time_to_sell}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderBestCropsTab = () => {
    if (!marketData?.insights?.top_crops_by_price) return null;

    const topCrops = marketData.insights.top_crops_by_price;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Top Performing Crops</Text>
        <Text style={styles.sectionSubtitle}>Best prices and market demand</Text>
        
        {topCrops.map((crop, index) => {
          const price = parsePrice(crop.average_price);
          const demandPercent = parseFloat(crop.market_demand.match(/[\d.]+/)?.[0] || '0');
          
          return (
            <View key={index} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <View style={styles.cropRank}>
                  <LinearGradient
                    colors={index === 0 ? ['#fbbf24', '#f59e0b'] : index === 1 ? ['#94a3b8', '#64748b'] : ['#cd7f32', '#b87333']}
                    style={styles.rankBadge}
                  >
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropName}>{crop.crop.charAt(0).toUpperCase() + crop.crop.slice(1)}</Text>
                  <View style={styles.cropMetrics}>
                    <View style={styles.cropMetric}>
                      <Ionicons name="cash" size={14} color="#10b981" />
                      <Text style={styles.cropMetricText}>{crop.average_price}</Text>
                    </View>
                    <View style={styles.cropMetric}>
                      <Ionicons name="trending-up" size={14} color="#3b82f6" />
                      <Text style={styles.cropMetricText}>{crop.market_demand}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Demand Bar */}
              <View style={styles.demandBarContainer}>
                <Text style={styles.demandBarLabel}>Market Share</Text>
                <View style={styles.demandBarTrack}>
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.demandBarFill, { width: `${Math.min(demandPercent * 3, 100)}%` }]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSeasonalTab = () => {
    if (!marketData?.insights) return null;

    const { insights } = marketData;
    const seasons = [
      { name: 'Rabi', months: 'Oct-Mar', icon: 'snow' as const, color: '#3b82f6', isBest: insights.best_season?.toLowerCase() === 'rabi' },
      { name: 'Kharif', months: 'Jun-Oct', icon: 'rainy' as const, color: '#10b981', isBest: insights.best_season?.toLowerCase() === 'kharif' },
      { name: 'Zaid', months: 'Mar-Jun', icon: 'sunny' as const, color: '#f59e0b', isBest: insights.best_season?.toLowerCase() === 'zaid' },
    ];

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Seasonal Analysis</Text>
        <Text style={styles.sectionSubtitle}>Best planting seasons for optimal returns</Text>

        {/* Seasonal Tip Card */}
        <View style={styles.seasonalTipCard}>
          <Ionicons name="bulb" size={24} color="#f59e0b" />
          <Text style={styles.seasonalTip}>{insights.seasonal_tip}</Text>
        </View>

        {/* Season Cards */}
        <View style={styles.seasonsContainer}>
          {seasons.map((season, index) => (
            <View 
              key={index} 
              style={[
                styles.seasonCard,
                season.isBest && styles.bestSeasonCard
              ]}
            >
              {season.isBest && (
                <View style={styles.bestSeasonBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.bestSeasonBadgeText}>Best</Text>
                </View>
              )}
              <View style={[styles.seasonIconContainer, { backgroundColor: season.color + '20' }]}>
                <Ionicons name={season.icon} size={32} color={season.color} />
              </View>
              <Text style={styles.seasonName}>{season.name}</Text>
              <Text style={styles.seasonMonths}>{season.months}</Text>
              
              {season.isBest && (
                <View style={styles.seasonRecommendation}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.seasonRecommendationText}>Recommended</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Calendar Visualization */}
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>Annual Planting Calendar</Text>
          <View style={styles.calendarGrid}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
              let season = '';
              let color = '#e5e7eb';
              
              if (index >= 9 || index <= 2) { // Oct-Mar (Rabi)
                season = 'R';
                color = insights.best_season?.toLowerCase() === 'rabi' ? '#3b82f6' : '#93c5fd';
              } else if (index >= 5 && index <= 9) { // Jun-Oct (Kharif)
                season = 'K';
                color = insights.best_season?.toLowerCase() === 'kharif' ? '#10b981' : '#6ee7b7';
              } else { // Mar-Jun (Zaid)
                season = 'Z';
                color = insights.best_season?.toLowerCase() === 'zaid' ? '#f59e0b' : '#fcd34d';
              }
              
              return (
                <View key={index} style={styles.calendarMonth}>
                  <View style={[styles.calendarMonthBar, { backgroundColor: color }]}>
                    <Text style={styles.calendarMonthSeason}>{season}</Text>
                  </View>
                  <Text style={styles.calendarMonthLabel}>{month}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.calendarLegend}>
            <View style={styles.calendarLegendItem}>
              <View style={[styles.calendarLegendColor, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.calendarLegendText}>Rabi</Text>
            </View>
            <View style={styles.calendarLegendItem}>
              <View style={[styles.calendarLegendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.calendarLegendText}>Kharif</Text>
            </View>
            <View style={styles.calendarLegendItem}>
              <View style={[styles.calendarLegendColor, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.calendarLegendText}>Zaid</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'price':
        return renderPriceTrendTab();
      case 'crops':
        return renderBestCropsTab();
      case 'season':
        return renderSeasonalTab();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader onMenuPress={() => setSidebarVisible(true)} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading market insights...</Text>
        </View>
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      </View>
    );
  }

  const actionStyle = marketData?.insights?.recommendation 
    ? getActionButtonStyle(marketData.insights.recommendation.action)
    : getActionButtonStyle('Monitor Market');

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => setSidebarVisible(true)} />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={[COLORS.primary, '#059669']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="analytics" size={32} color="#fff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Market Insights</Text>
              <Text style={styles.headerSubtitle}>Smart farming decisions based on data</Text>
            </View>
          </View>
          
          {/* Market Summary */}
          {marketData?.insights?.summary && (
            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <Ionicons name="wallet" size={20} color="#fff" />
                <Text style={styles.summaryValue}>
                  {formatNumber(parsePrice(marketData.insights.summary.total_market_value))}
                </Text>
                <Text style={styles.summaryLabel}>Total Market Value</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="cube" size={20} color="#fff" />
                <Text style={styles.summaryValue}>
                  {formatQuantity(marketData.insights.summary.total_quantity)}
                </Text>
                <Text style={styles.summaryLabel}>Total Volume</Text>
              </View>
            </View>
          )}
          
          {marketData?.insights?.summary && (
            <View style={[styles.summaryCards, { marginTop: 12 }]}>
              <View style={styles.summaryCard}>
                <Ionicons name="cash-outline" size={20} color="#fff" />
                <Text style={styles.summaryValue}>
                  ₹{parsePrice(marketData.insights.summary.average_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
                <Text style={styles.summaryLabel}>Average Price</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="receipt-outline" size={20} color="#fff" />
                <Text style={styles.summaryValue}>
                  {marketData.insights.summary.total_transactions.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.summaryLabel}>Total Orders</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Action Button */}
        {marketData?.insights?.recommendation && (
          <View style={styles.actionButtonContainer}>
            <LinearGradient
              colors={actionStyle.colors}
              style={styles.actionButton}
            >
              <Ionicons name={actionStyle.icon} size={24} color={actionStyle.textColor} />
              <Text style={[styles.actionButtonText, { color: actionStyle.textColor }]}>
                {marketData.insights.recommendation.action}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'price' && styles.activeTab]}
            onPress={() => setSelectedTab('price')}
          >
            <Ionicons 
              name="trending-up" 
              size={20} 
              color={selectedTab === 'price' ? COLORS.primary : '#6b7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'price' && styles.activeTabText]}>
              Price Trend
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'crops' && styles.activeTab]}
            onPress={() => setSelectedTab('crops')}
          >
            <Ionicons 
              name="leaf" 
              size={20} 
              color={selectedTab === 'crops' ? COLORS.primary : '#6b7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'crops' && styles.activeTabText]}>
              Best Crops
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'season' && styles.activeTab]}
            onPress={() => setSelectedTab('season')}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color={selectedTab === 'season' ? COLORS.primary : '#6b7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'season' && styles.activeTabText]}>
              Seasonal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderContent()}
      </ScrollView>

      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#f0fdf4',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#f0fdf4',
    marginTop: 4,
  },
  actionButtonContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#f0fdf4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabContent: {
    padding: 20,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  filterDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  filterOptionActive: {
    backgroundColor: '#f0fdf4',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cropHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  priceCardsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  priceCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceCardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  priceCardSubtext: {
    fontSize: 11,
    color: '#9ca3af',
  },
  priceCardIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lineChart: {
    flexDirection: 'row',
    height: 220,
  },
  yAxis: {
    width: 60,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 25,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  lineChartPath: {
    flex: 1,
    marginBottom: 25,
  },
  trendLineContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  trendLine: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.6,
  },
  dataPoints: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataPoint: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#fff',
    position: 'absolute',
    bottom: -7,
  },
  dataPointLabel: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  dataPointLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceChangeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceChangeLeft: {
    flex: 1,
  },
  priceChangeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceChangeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceChangeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  priceChangeChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  recommendationCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  recommendationMessage: {
    fontSize: 15,
    color: '#78350f',
    marginBottom: 8,
    lineHeight: 22,
  },
  recommendationSuggestion: {
    fontSize: 14,
    color: '#78350f',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  bestTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  bestTimeText: {
    fontSize: 13,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropRank: {
    marginRight: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  cropMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  cropMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cropMetricText: {
    fontSize: 13,
    color: '#6b7280',
  },
  demandBarContainer: {
    marginTop: 8,
  },
  demandBarLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  demandBarTrack: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  demandBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  seasonalTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  seasonalTip: {
    flex: 1,
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  seasonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  seasonCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bestSeasonCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  bestSeasonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bestSeasonBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  seasonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  seasonMonths: {
    fontSize: 12,
    color: '#6b7280',
  },
  seasonRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  seasonRecommendationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  calendarMonth: {
    width: (width - 88) / 6,
    alignItems: 'center',
  },
  calendarMonthBar: {
    width: '100%',
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calendarMonthSeason: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  calendarMonthLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarLegendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  calendarLegendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

