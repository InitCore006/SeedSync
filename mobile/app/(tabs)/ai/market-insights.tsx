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
  DemandForecastResponse,
  CropForecast
} from '@/services/marketInsightsService';

const { width } = Dimensions.get('window');

// Tab type
type TabType = 'marketInsights' | 'priceForecasting' | 'demandForecasting';

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
  const [allCropsData, setAllCropsData] = useState<AllCropsForecastResponse | null>(null);
  const [demandData, setDemandData] = useState<DemandForecastResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('marketInsights');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<number>(30);
  const [showCropFilter, setShowCropFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, [timePeriod]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const [farmerData, cropsData, demandForecast] = await Promise.all([
        marketInsightsService.getMarketForecast('farmer'),
        marketInsightsService.getAllCropsForecast(timePeriod, 5),
        marketInsightsService.getDemandForecast()
      ]);
      setMarketData(farmerData);
      setAllCropsData(cropsData);
      setDemandData(demandForecast);
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
        return { colors: ['#ef4444', '#dc2626'] as const, icon: 'trending-down' as const, textColor: '#fff' };
      case 'Wait & Watch':
        return { colors: ['#3b82f6', '#2563eb'] as const, icon: 'time' as const, textColor: '#fff' };
      case 'Flexible':
        return { colors: ['#10b981', '#059669'] as const, icon: 'checkmark-circle' as const, textColor: '#fff' };
      default:
        return { colors: ['#6b7280', '#4b5563'] as const, icon: 'eye' as const, textColor: '#fff' };
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

  // ==================== MARKET INSIGHTS TAB ====================
  // Shows farmer-specific market insights (NO price forecasting data)
  const renderMarketInsightsTab = () => {
    if (!marketData?.insights) return null;

    const { insights } = marketData;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Farmer Market Insights</Text>
        <Text style={styles.sectionSubtitle}>Key market information and actionable recommendations</Text>

        {/* Recommendation Card */}
        {insights.recommendation && (
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={styles.recommendationTitle}>Recommendation</Text>
            </View>
            <View style={[styles.actionBadge, { 
              backgroundColor: insights.recommendation.action === 'Sell Soon' ? '#fee2e2' : 
                               insights.recommendation.action === 'Wait & Watch' ? '#dbeafe' :
                               insights.recommendation.action === 'Flexible' ? '#dcfce7' : '#f3f4f6',
              borderColor: insights.recommendation.action === 'Sell Soon' ? '#dc2626' : 
                          insights.recommendation.action === 'Wait & Watch' ? '#3b82f6' :
                          insights.recommendation.action === 'Flexible' ? '#10b981' : '#6b7280'
            }]}>
              <Text style={[styles.actionBadgeText, {
                color: insights.recommendation.action === 'Sell Soon' ? '#dc2626' : 
                       insights.recommendation.action === 'Wait & Watch' ? '#3b82f6' :
                       insights.recommendation.action === 'Flexible' ? '#10b981' : '#6b7280'
              }]}>
                {insights.recommendation.action}
              </Text>
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

        {/* Top Crops by Price */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Top Crops by Price</Text>
        {insights.top_crops_by_price.map((crop, index) => {
          const price = parsePrice(crop.average_price);
          const demandPercent = parseFloat(crop.market_demand.match(/[\d.]+/)?.[0] || '0');
          
          return (
            <View key={index} style={styles.cropCard}>
              <View style={styles.cropHeaderRow}>
                <View style={styles.cropRank}>
                  <View style={[styles.rankBadge, { 
                    backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : '#cd7f32'
                  }]}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                </View>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropName}>{getCropDisplayName(crop.crop)}</Text>
                  <View style={styles.cropMetrics}>
                    <View style={styles.cropMetric}>
                      <Ionicons name="cash" size={16} color={COLORS.primary} />
                      <Text style={styles.cropMetricText}>
                        ₹{price.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.cropMetric}>
                      <Ionicons name="trending-up" size={16} color="#3b82f6" />
                      <Text style={styles.cropMetricText}>{crop.market_demand}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Demand Bar */}
              <View style={styles.demandBarContainer}>
                <Text style={styles.demandBarLabel}>Market Demand</Text>
                <View style={styles.demandBarTrack}>
                  <View 
                    style={[
                      styles.demandBarFill, 
                      { 
                        width: `${demandPercent}%`,
                        backgroundColor: index === 0 ? COLORS.primary : index === 1 ? '#3b82f6' : '#10b981'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Seasonal Information */}
        <View style={styles.seasonalTipCard}>
          <Ionicons name="sunny" size={24} color="#f59e0b" />
          <View style={{ flex: 1 }}>
            <Text style={styles.seasonalTipTitle}>Seasonal Tip</Text>
            <Text style={styles.seasonalTip}>{insights.seasonal_tip}</Text>
            <View style={styles.bestSeasonBadge}>
              <Ionicons name="star" size={14} color="#10b981" />
              <Text style={styles.bestSeasonText}>Best Season: {insights.best_season.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ==================== PRICE FORECASTING TAB ====================
  // Shows all crops price forecasting from /all-crops-forecast/ API
  const renderPriceForecastingTab = () => {
    if (!allCropsData?.forecasts) return null;

    const { forecasts, market_summary, quick_insights } = allCropsData;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Price Forecasting - All Crops</Text>
        <Text style={styles.sectionSubtitle}>Comprehensive price analysis for {forecasts.length} major crops</Text>

        {/* Trend Summary Cards */}
        <View style={styles.trendSummaryContainer}>
          <View style={[styles.trendSummaryCard, { backgroundColor: '#dcfce7', borderColor: '#16a34a' }]}>
            <Ionicons name="trending-up" size={24} color="#16a34a" />
            <Text style={[styles.trendSummaryCount, { color: '#16a34a' }]}>
              {market_summary.bullish_crops.length}
            </Text>
            <Text style={styles.trendSummaryLabel}>Bullish</Text>
            <Text style={styles.trendSummaryHint}>Prices Rising</Text>
          </View>

          <View style={[styles.trendSummaryCard, { backgroundColor: '#fee2e2', borderColor: '#dc2626' }]}>
            <Ionicons name="trending-down" size={24} color="#dc2626" />
            <Text style={[styles.trendSummaryCount, { color: '#dc2626' }]}>
              {market_summary.bearish_crops.length}
            </Text>
            <Text style={styles.trendSummaryLabel}>Bearish</Text>
            <Text style={styles.trendSummaryHint}>Prices Falling</Text>
          </View>

          <View style={[styles.trendSummaryCard, { backgroundColor: '#e0e7ff', borderColor: '#4f46e5' }]}>
            <Ionicons name="remove" size={24} color="#4f46e5" />
            <Text style={[styles.trendSummaryCount, { color: '#4f46e5' }]}>
              {market_summary.stable_crops.length}
            </Text>
            <Text style={styles.trendSummaryLabel}>Stable</Text>
            <Text style={styles.trendSummaryHint}>Steady Prices</Text>
          </View>
        </View>

        {/* Price Comparison Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Price Comparison - Current vs Expected (30 Days)</Text>
          <View style={styles.barChartContainer}>
            {forecasts.map((crop, index) => {
              const currentPrice = parsePrice(crop.current_price);
              const expectedPrice = parsePrice(crop.expected_price_30_days);
              const maxPrice = Math.max(...forecasts.map(c => parsePrice(c.expected_price_30_days)));
              const currentWidth = (currentPrice / maxPrice) * 100;
              const expectedWidth = (expectedPrice / maxPrice) * 100;

              return (
                <View key={index} style={styles.barChartRow}>
                  <Text style={styles.barChartLabel}>{crop.crop}</Text>
                  <View style={styles.barChartBars}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.barCurrent, { width: `${currentWidth}%` }]}>
                        <Text style={styles.barValue}>₹{currentPrice.toLocaleString('en-IN')}</Text>
                      </View>
                    </View>
                    <View style={styles.barWrapper}>
                      <View style={[styles.barExpected, { width: `${expectedWidth}%` }]}>
                        <Text style={styles.barValue}>₹{expectedPrice.toLocaleString('en-IN')}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
          
          {/* Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Current Price</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Expected Price</Text>
            </View>
          </View>
        </View>

        {/* Individual Crop Cards */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Detailed Analysis</Text>
        {forecasts.map((crop, index) => {
          const currentPrice = parsePrice(crop.current_price);
          const expectedPrice = parsePrice(crop.expected_price_30_days);
          const isPositive = expectedPrice >= currentPrice;
          const trendColor = crop.trend === 'BULLISH' ? '#16a34a' : crop.trend === 'BEARISH' ? '#dc2626' : '#4f46e5';
          const trendBg = crop.trend === 'BULLISH' ? '#dcfce7' : crop.trend === 'BEARISH' ? '#fee2e2' : '#e0e7ff';

          return (
            <View key={index} style={styles.cropDetailCard}>
              <View style={styles.cropDetailHeader}>
                <View style={styles.cropDetailTitle}>
                  <Ionicons name="leaf" size={24} color={COLORS.primary} />
                  <Text style={styles.cropDetailName}>{crop.crop}</Text>
                </View>
                <View style={[styles.trendChip, { backgroundColor: trendBg, borderColor: trendColor }]}>
                  <Ionicons 
                    name={crop.trend === 'BULLISH' ? 'trending-up' : crop.trend === 'BEARISH' ? 'trending-down' : 'remove'} 
                    size={16} 
                    color={trendColor} 
                  />
                  <Text style={[styles.trendChipText, { color: trendColor }]}>{crop.trend}</Text>
                </View>
              </View>

              <View style={styles.cropPriceRow}>
                <View style={styles.cropPriceCol}>
                  <Text style={styles.cropPriceLabel}>Current</Text>
                  <Text style={styles.cropPriceValue}>₹{currentPrice.toLocaleString('en-IN')}</Text>
                  <Text style={styles.cropPriceUnit}>per quintal</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#9ca3af" />
                <View style={styles.cropPriceCol}>
                  <Text style={styles.cropPriceLabel}>Expected (30d)</Text>
                  <Text style={[styles.cropPriceValue, { color: isPositive ? '#16a34a' : '#dc2626' }]}>
                    ₹{expectedPrice.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.cropPriceUnit}>{crop.price_change}</Text>
                </View>
              </View>

              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceRangeLabel}>Expected Price Range</Text>
                <View style={styles.priceRangeBar}>
                  <Text style={styles.priceRangeText}>{crop.price_range.min}</Text>
                  <View style={styles.priceRangeLine} />
                  <Text style={styles.priceRangeText}>{crop.price_range.max}</Text>
                </View>
              </View>

              <View style={styles.recommendationChip}>
                <Ionicons name="bulb" size={16} color="#f59e0b" />
                <Text style={styles.recommendationChipText}>{crop.recommendation}</Text>
              </View>
            </View>
          );
        })}

        {/* Quick Action Insights */}
        <View style={styles.quickInsightsCard}>
          <Text style={styles.quickInsightsTitle}>Quick Action Insights</Text>
          
          {quick_insights.buy_now.length > 0 && (
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="cart" size={20} color="#16a34a" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Buy Now</Text>
                <Text style={styles.insightText}>{quick_insights.buy_now.join(', ')}</Text>
              </View>
            </View>
          )}

          {quick_insights.wait_for_better_prices.length > 0 && (
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: '#fffbeb' }]}>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Wait for Better Prices</Text>
                <Text style={styles.insightText}>{quick_insights.wait_for_better_prices.join(', ')}</Text>
              </View>
            </View>
          )}

          {quick_insights.neutral.length > 0 && (
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: '#f3f4f6' }]}>
                <Ionicons name="remove-circle" size={20} color="#6b7280" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Neutral</Text>
                <Text style={styles.insightText}>{quick_insights.neutral.join(', ')}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ==================== DEMAND FORECASTING TAB ====================
  // Shows demand forecasting from /quick/demand/ API
  const renderDemandForecastingTab = () => {
    if (!demandData?.forecast || !allCropsData?.forecasts) return null;

    const { forecast } = demandData;
    const { forecasts } = allCropsData;

    const parseDemand = (demandStr: string): number => {
      const match = demandStr.match(/([\d,]+)/);
      return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
    };

    const currentDemand = parseDemand(forecast.current_demand);
    const expectedDemand = parseDemand(forecast.expected_demand);
    const demandChange = currentDemand > 0 ? ((expectedDemand - currentDemand) / currentDemand) * 100 : 0;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Demand Forecasting</Text>
        <Text style={styles.sectionSubtitle}>Market demand trends and 30-day projections</Text>

        {/* Overall Demand Overview */}
        <View style={styles.demandOverviewCard}>
          <Text style={styles.demandOverviewTitle}>Overall Market Demand</Text>
          
          {/* Demand Comparison Cards */}
          <View style={styles.demandComparisonRow}>
            <View style={styles.demandComparisonCard}>
              <Ionicons name="today" size={24} color="#3b82f6" />
              <Text style={styles.demandComparisonValue}>{forecast.current_demand}</Text>
              <Text style={styles.demandComparisonLabel}>Current Demand</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#9ca3af" />
            <View style={styles.demandComparisonCard}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={[styles.demandComparisonValue, { color: '#10b981' }]}>
                {forecast.expected_demand}
              </Text>
              <Text style={styles.demandComparisonLabel}>Expected Demand</Text>
            </View>
          </View>

          {/* Trend Indicator */}
          <View style={[styles.demandTrendBadge, {
            backgroundColor: forecast.trend === 'INCREASING' ? '#dcfce7' : 
                           forecast.trend === 'DECREASING' ? '#fee2e2' : '#e0e7ff',
            borderColor: forecast.trend === 'INCREASING' ? '#16a34a' : 
                        forecast.trend === 'DECREASING' ? '#dc2626' : '#4f46e5'
          }]}>
            <Ionicons 
              name={forecast.trend === 'INCREASING' ? 'trending-up' : 
                   forecast.trend === 'DECREASING' ? 'trending-down' : 'remove'} 
              size={20} 
              color={forecast.trend === 'INCREASING' ? '#16a34a' : 
                    forecast.trend === 'DECREASING' ? '#dc2626' : '#4f46e5'} 
            />
            <Text style={[styles.demandTrendText, {
              color: forecast.trend === 'INCREASING' ? '#16a34a' : 
                    forecast.trend === 'DECREASING' ? '#dc2626' : '#4f46e5'
            }]}>
              {forecast.trend} {Math.abs(demandChange).toFixed(1)}%
            </Text>
          </View>

          {/* 30 Days Total */}
          <View style={styles.totalDemandCard}>
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <View style={{ flex: 1 }}>
              <Text style={styles.totalDemandLabel}>Total 30-Day Demand</Text>
              <Text style={styles.totalDemandValue}>{forecast.total_30_days}</Text>
            </View>
          </View>
        </View>

        {/* Demand Visualization Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Demand Growth Projection</Text>
          <View style={styles.demandChartContainer}>
            <View style={styles.demandChartBar}>
              <View style={styles.demandBar}>
                <View style={[styles.demandBarFillStyle, { 
                  width: `${expectedDemand > 0 ? (currentDemand / expectedDemand) * 100 : 50}%`,
                  backgroundColor: '#3b82f6'
                }]}>
                  <Text style={styles.demandBarLabelText}>Current</Text>
                </View>
              </View>
              <Text style={styles.demandBarValueText}>{forecast.current_demand}</Text>
            </View>
            <View style={styles.demandChartBar}>
              <View style={styles.demandBar}>
                <View style={[styles.demandBarFillStyle, { 
                  width: '100%',
                  backgroundColor: '#10b981'
                }]}>
                  <Text style={styles.demandBarLabelText}>Expected</Text>
                </View>
              </View>
              <Text style={styles.demandBarValueText}>{forecast.expected_demand}</Text>
            </View>
          </View>
        </View>

        {/* Crop-wise Demand Contribution */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>
          Crop-wise Demand Analysis
        </Text>
        {forecasts.slice(0, 5).map((crop, index) => {
          const priceChange = parseFloat(crop.price_change.replace('%', '').replace('+', ''));
          const isPositive = priceChange >= 0;
          const demandLevel = Math.abs(priceChange) > 5 ? 'High' : Math.abs(priceChange) > 2 ? 'Medium' : 'Low';
          const demandColor = Math.abs(priceChange) > 5 ? '#16a34a' : Math.abs(priceChange) > 2 ? '#f59e0b' : '#6b7280';

          return (
            <View key={index} style={styles.demandCropCard}>
              <View style={styles.demandCropHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="leaf" size={20} color={COLORS.primary} />
                  <Text style={styles.demandCropName}>{crop.crop}</Text>
                </View>
                <View style={[styles.demandLevelBadge, { backgroundColor: demandColor + '20', borderColor: demandColor }]}>
                  <Text style={[styles.demandLevelText, { color: demandColor }]}>{demandLevel}</Text>
                </View>
              </View>

              <View style={styles.demandMetrics}>
                <View style={styles.demandMetricItem}>
                  <Ionicons name="trending-up" size={18} color={isPositive ? '#16a34a' : '#dc2626'} />
                  <Text style={styles.demandMetricLabel}>Price Trend</Text>
                  <Text style={[styles.demandMetricValue, { color: isPositive ? '#16a34a' : '#dc2626' }]}>
                    {crop.price_change}
                  </Text>
                </View>

                <View style={styles.demandMetricItem}>
                  <Ionicons name="stats-chart" size={18} color="#3b82f6" />
                  <Text style={styles.demandMetricLabel}>Market Trend</Text>
                  <Text style={styles.demandMetricValue}>{crop.trend}</Text>
                </View>

                <View style={styles.demandMetricItem}>
                  <Ionicons name="arrow-up" size={18} color="#10b981" />
                  <Text style={styles.demandMetricLabel}>Demand Level</Text>
                  <Text style={styles.demandMetricValue}>{demandLevel}</Text>
                </View>
              </View>

              <View style={styles.demandProgressBar}>
                <View style={styles.demandProgressTrack}>
                  <View 
                    style={[
                      styles.demandProgressFill, 
                      { 
                        width: `${Math.min(100, Math.abs(priceChange) * 10)}%`,
                        backgroundColor: demandColor
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.demandProgressLabel}>
                  {demandLevel} demand with {Math.abs(priceChange)}% price change
                </Text>
              </View>
            </View>
          );
        })}

        {/* Demand Insights */}
        <View style={styles.marketRecommendationsCard}>
          <Text style={styles.marketRecommendationsTitle}>Demand Insights</Text>
          
          <View style={styles.recommendationSection}>
            <View style={styles.recommendationSectionHeader}>
              <Ionicons 
                name={forecast.trend === 'INCREASING' ? "arrow-up-circle" : "arrow-down-circle"} 
                size={20} 
                color={forecast.trend === 'INCREASING' ? "#16a34a" : "#dc2626"} 
              />
              <Text style={[styles.recommendationSectionTitle, { 
                color: forecast.trend === 'INCREASING' ? "#16a34a" : "#dc2626" 
              }]}>
                Overall Demand is {forecast.trend}
              </Text>
            </View>
            <Text style={styles.recommendationSectionText}>
              {forecast.trend === 'INCREASING' 
                ? `Market demand is expected to increase by ${Math.abs(demandChange).toFixed(1)}% over the next 30 days. This is a good time to prepare for higher sales volumes.`
                : `Market demand shows ${forecast.trend.toLowerCase()} trend. Plan inventory accordingly.`
              }
            </Text>
          </View>

          <View style={styles.recommendationSection}>
            <View style={styles.recommendationSectionHeader}>
              <Ionicons name="calendar" size={20} color="#3b82f6" />
              <Text style={[styles.recommendationSectionTitle, { color: "#3b82f6" }]}>
                30-Day Projection
              </Text>
            </View>
            <Text style={styles.recommendationSectionText}>
              Total expected market demand over the next 30 days: {forecast.total_30_days}. Daily average: {forecast.expected_demand}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'marketInsights':
        return renderMarketInsightsTab();
      case 'priceForecasting':
        return renderPriceForecastingTab();
      case 'demandForecasting':
        return renderDemandForecastingTab();
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
            style={[styles.tab, selectedTab === 'marketInsights' && styles.activeTab]}
            onPress={() => setSelectedTab('marketInsights')}
          >
            <Ionicons 
              name="bulb" 
              size={20} 
              color={selectedTab === 'marketInsights' ? COLORS.primary : '#6b7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'marketInsights' && styles.activeTabText]}>
              Market Insights
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'priceForecasting' && styles.activeTab]}
            onPress={() => setSelectedTab('priceForecasting')}
          >
            <Ionicons 
              name="trending-up" 
              size={20} 
              color={selectedTab === 'priceForecasting' ? COLORS.primary : '#6b7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'priceForecasting' && styles.activeTabText]}>
              Price Forecast
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'demandForecasting' && styles.activeTab]}
            onPress={() => setSelectedTab('demandForecasting')}
          >
            <Ionicons 
              name="stats-chart" 
              size={20} 
              color={selectedTab === 'demandForecasting' ? COLORS.primary : '#6b7280'} 
            />
            <Text style={[styles.tabText, selectedTab === 'demandForecasting' && styles.activeTabText]}>
              Demand Forecast
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
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  actionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cropHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonalTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  bestSeasonText: {
    fontSize: 13,
    color: '#1f2937',
    marginTop: 4,
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
  cropCardHeader: {
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
  
  // ==================== PRICE FORECASTING TAB STYLES ====================
  trendSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  trendSummaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendSummaryCount: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  trendSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  trendSummaryHint: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  barChartContainer: {
    marginBottom: 12,
  },
  barChartRow: {
    marginBottom: 16,
  },
  barChartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  barChartBars: {
    gap: 6,
  },
  barWrapper: {
    height: 28,
  },
  barCurrent: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 80,
  },
  barExpected: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 80,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cropDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cropDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropDetailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cropDetailName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  trendChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cropPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropPriceCol: {
    flex: 1,
    alignItems: 'center',
  },
  cropPriceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  cropPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  cropPriceUnit: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  priceRangeContainer: {
    marginBottom: 12,
  },
  priceRangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  priceRangeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRangeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  priceRangeText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
  },
  recommendationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 6,
  },
  recommendationChipText: {
    fontSize: 13,
    color: '#92400e',
    flex: 1,
  },
  quickInsightsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickInsightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },

  // ==================== DEMAND FORECASTING TAB STYLES ====================
  demandOverviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  demandOverviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  demandComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  demandComparisonCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },
  demandComparisonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  demandComparisonLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  demandTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 12,
    gap: 8,
  },
  demandTrendText: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalDemandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  totalDemandLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalDemandValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  demandChartContainer: {
    marginTop: 8,
    gap: 16,
  },
  demandChartBar: {
    gap: 8,
  },
  demandBar: {
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  demandBarFillStyle: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  demandBarLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  demandBarValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  demandCropCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  demandCropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  demandCropName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  demandLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  demandLevelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  demandMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  demandMetricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  demandMetricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  demandMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  demandProgressBar: {
    marginTop: 8,
  },
  demandProgressTrack: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  demandProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  demandProgressLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  marketRecommendationsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  marketRecommendationsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  recommendationSection: {
    marginBottom: 16,
  },
  recommendationSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  recommendationSectionText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
});

