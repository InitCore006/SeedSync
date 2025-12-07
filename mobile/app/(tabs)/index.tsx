import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '@/constants/colors';
import { Loading, Sidebar, AppHeader } from '@/components';
import { StatsSection } from '@/components/StatsCard';
import { useAuthStore } from '@/store/authStore';
import { farmersAPI } from '@/services/farmersService';
import { logisticsAPI } from '@/services/logisticsService';
import { paymentsAPI } from '@/services/paymentsService';
import { weatherService, WeatherData } from '@/services/weatherService';
import { statsService, FarmerStats, LogisticsStats } from '@/services/statsService';
import { useFarmerStore } from '@/store/farmerStore';
import { useLogisticsStore } from '@/store/logisticsStore';

const { width, height } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { stats: farmerStats, setStats: setFarmerStats } = useFarmerStore();
  const { stats: logisticsStats, setStats: setLogisticsStats } = useLogisticsStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [walletData, setWalletData] = useState<{balance: number; pending_payments: number; total_earned: number} | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';

  const fetchFarmerStats = async () => {
    try {
      const response = await farmersAPI.getStats();
      setFarmerStats(response.data);
    } catch (error) {
      console.error('Failed to load farmer stats:', error);
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await paymentsAPI.getMyWallet();
      setWalletData(response.data.data);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const fetchLogisticsStats = async () => {
    try {
      const response = await logisticsAPI.getStats();
      setLogisticsStats(response.data);
    } catch (error) {
      console.error('Failed to load logistics stats:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const fetchWeather = async () => {
    try {
      // Try to get GPS location first
      const hasPermission = locationPermission || await requestLocationPermission();
      
      if (hasPermission) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const weatherData = await weatherService.getWeatherByCoords(
          location.coords.latitude,
          location.coords.longitude
        );
        setWeather(weatherData);
      } else {
        // Fallback to city-based weather
        const city = user?.profile?.city || user?.profile?.state || 'Mumbai';
        const weatherData = await weatherService.getWeatherByCity(city);
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Failed to load weather:', error);
      // Fallback to city if GPS fails
      try {
        const city = user?.profile?.city || user?.profile?.state || 'Mumbai';
        const weatherData = await weatherService.getWeatherByCity(city);
        setWeather(weatherData);
      } catch (fallbackError) {
        console.error('Fallback weather fetch failed:', fallbackError);
      }
    }
  };

  const fetchStats = async () => {
    try {
      if (isFarmer) {
        await Promise.all([fetchFarmerStats(), fetchWeather(), fetchWalletData()]);
      } else if (isLogistics) {
        await fetchLogisticsStats();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const farmerQuickActions = [
    {
      title: 'Create Lot',
      icon: 'add-circle',
      color: COLORS.primary,
      onPress: () => router.push('/(tabs)/lots/create'),
    },
    {
      title: 'Market Prices',
      icon: 'trending-up',
      color: COLORS.info,
      onPress: () => router.push('/(tabs)/market/prices'),
    },
    {
      title: 'Disease AI',
      icon: 'scan',
      color: COLORS.success,
      onPress: () => router.push('/ai/disease-detection'),
    },
    {
      title: user?.profile?.fpo_membership ? 'My FPO' : 'Gov Schemes',
      icon: user?.profile?.fpo_membership ? 'business' : 'shield-checkmark',
      color: COLORS.warning,
      onPress: () => router.push(user?.profile?.fpo_membership ? '/fpos/my-fpo' : '/(tabs)/schemes'),
    },
  ];

  const logisticsQuickActions = [
    {
      title: 'New Bookings',
      icon: 'notifications',
      color: COLORS.primary,
      onPress: () => router.push('/(tabs)/trips'),
    },
    {
      title: 'Active Trips',
      icon: 'navigate-circle',
      color: COLORS.info,
      onPress: () => router.push('/(tabs)/trips'),
    },
    {
      title: 'Earnings',
      icon: 'wallet',
      color: COLORS.warning,
      onPress: () => router.push('/(tabs)/history'),
    },
    {
      title: 'My Vehicles',
      icon: 'car-sport',
      color: COLORS.success,
      onPress: () => router.push('/(tabs)/vehicles'),
    },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        onMenuPress={() => setSidebarVisible(true)}
        showNotifications={true}
      />
      
      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Card - Farmer Weather / Logistics Map */}
        <View style={styles.heroCardContainer}>
          <View style={styles.heroCard}>

            {isFarmer ? (
              // Farmer Weather Card
              <View style={styles.weatherContent}>
                {/* Top: Personalized Greeting and Location */}
                <View style={styles.weatherHeaderRow}>
                  <Text style={styles.weatherGreeting}>
                    {weatherService.getGreeting()}, {user?.profile?.full_name?.split(' ')[0] || 'Farmer'}!
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={13} color="#fff" />
                    <Text style={styles.weatherLocation}>
                      {weather?.city || user?.profile?.city || user?.profile?.state || 'Your Location'}
                    </Text>
                  </View>
                </View>

                {/* Main Content: Temperature Left, Details Right */}
                <View style={styles.weatherMainRow}>
                  {/* Left Side: Large Temperature and Condition */}
                  <View style={styles.tempSection}>
                    <Text style={styles.temperature}>{weather?.temp || 28}°</Text>
                    <View style={styles.conditionRow}>
                      <Ionicons 
                        name={weatherService.getWeatherIcon(weather?.condition || 'Clear', weather?.icon || '01d') as any} 
                        size={24} 
                        color="#fff" 
                      />
                      <View style={styles.conditionTextContainer}>
                        <Text style={styles.weatherCondition}>{weather?.condition || 'Sunny'}</Text>
                        <Text style={styles.weatherDescription}>{weather?.description || 'clear sky'}</Text>
                      </View>
                    </View>
                    <Text style={styles.feelsLike}>Feels like {weather?.feelsLike || 31}°C</Text>
                  </View>

                  {/* Right Side: Detail Cards */}
                  <View style={styles.detailsSection}>
                    <View style={styles.weatherCardsColumn}>
                      <View style={styles.weatherDetailCard}>
                        <Ionicons name="water" size={18} color="#fff" />
                        <View style={styles.cardContent}>
                          <Text style={styles.weatherDetailValue}>{weather?.humidity || 65}%</Text>
                          <Text style={styles.weatherDetailLabel}>Humidity</Text>
                        </View>
                      </View>
                      <View style={styles.weatherDetailCard}>
                        <Ionicons name="speedometer" size={18} color="#fff" />
                        <View style={styles.cardContent}>
                          <Text style={styles.weatherDetailValue}>{weather?.windSpeed || 12}</Text>
                          <Text style={styles.weatherDetailLabel}>km/h</Text>
                        </View>
                      </View>
                      {weather?.rainfall && weather.rainfall > 0 && (
                        <View style={styles.weatherDetailCard}>
                          <Ionicons name="rainy" size={18} color="#fff" />
                          <View style={styles.cardContent}>
                            <Text style={styles.weatherDetailValue}>{weather.rainfall}mm</Text>
                            <Text style={styles.weatherDetailLabel}>Rain</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Weather Alert */}
                {weather?.alert && (
                  <View style={styles.weatherAlert}>
                    <Ionicons name="warning" size={16} color="#fbbf24" />
                    <Text style={styles.weatherAlertText}>{weather.alert}</Text>
                  </View>
                )}

                {/* Crop Recommendations */}
                <TouchableOpacity 
                  style={styles.cropRecommendationCard}
                  onPress={() => router.push('/crop-recommendations')}
                  activeOpacity={0.8}
                >
                  <View style={styles.cropRecommendationHeader}>
                    <View style={styles.cropIconContainer}>
                      <Ionicons name="leaf" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.cropRecommendationText}>
                      <Text style={styles.cropRecommendationTitle}>Crop Recommendations</Text>
                      <Text style={styles.cropRecommendationSubtitle}>
                        Best crops for current weather
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              // Logistics Map Card
              <View style={styles.mapContent}>
                <View style={styles.mapHeader}>
                  <View>
                    <Text style={styles.mapGreeting}>Hello,</Text>
                    <Text style={styles.mapName}>
                      {user?.profile?.full_name || 'Driver'}
                    </Text>
                  </View>
                  <View style={styles.mapStatusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Online</Text>
                  </View>
                </View>

                <View style={styles.mapPlaceholder}>
                  <Ionicons name="location" size={80} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.mapPlaceholderText}>Real-time Location Tracking</Text>
                </View>

                <View style={styles.tripInfo}>
                  <View style={styles.tripInfoItem}>
                    <View style={styles.tripPoint}>
                      <Ionicons name="radio-button-on" size={16} color="#fff" />
                    </View>
                    <View style={styles.tripInfoText}>
                      <Text style={styles.tripLabel}>Current Location</Text>
                      <Text style={styles.tripValue}>Indore, MP</Text>
                    </View>
                  </View>
                  <View style={styles.tripDivider} />
                  <View style={styles.tripInfoItem}>
                    <View style={styles.tripPoint}>
                      <Ionicons name="flag" size={16} color="#fff" />
                    </View>
                    <View style={styles.tripInfoText}>
                      <Text style={styles.tripLabel}>Next Destination</Text>
                      <Text style={styles.tripValue}>Bhopal, MP</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Wallet Section - Farmer Only */}
        {isFarmer && walletData && (
          <View style={styles.walletSection}>
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Ionicons name="wallet" size={24} color={COLORS.primary} />
                <Text style={styles.walletTitle}>My Wallet</Text>
              </View>
              <View style={styles.walletBalance}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>₹{walletData.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={styles.walletStats}>
                <View style={styles.walletStatItem}>
                  <Text style={styles.walletStatLabel}>Pending</Text>
                  <Text style={styles.walletStatValue}>₹{walletData.pending_payments.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.walletDivider} />
                <View style={styles.walletStatItem}>
                  <Text style={styles.walletStatLabel}>Total Earned</Text>
                  <Text style={styles.walletStatValue}>₹{walletData.total_earned.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Stats Section */}
        {isFarmer && farmerStats && (
          <View style={styles.statsContainer}>
            <StatsSection
              title="Overview"
              stats={[
                {
                  icon: 'leaf',
                  label: 'Total Lots',
                  value: farmerStats.total_lots_created || 0,
                  color: '#0284c7',
                  subtitle: 'Created'
                },
                {
                  icon: 'cash',
                  label: 'Total Earnings',
                  value: statsService.formatCurrency(farmerStats.total_earnings || 0),
                  color: '#16a34a',
                  subtitle: 'Revenue'
                },
                {
                  icon: 'scale',
                  label: 'Quantity Sold',
                  value: statsService.formatQuintals(farmerStats.total_quantity_sold_quintals || 0),
                  color: '#f59e0b',
                  subtitle: 'Total'
                },
                {
                  icon: 'time',
                  label: 'Pending Bids',
                  value: farmerStats.pending_bids || 0,
                  color: '#8b5cf6',
                  subtitle: 'Awaiting'
                },
              ]}
            />
          </View>
        )}

        {isLogistics && logisticsStats && (
          <View style={styles.statsContainer}>
            <StatsSection
              title="Overview"
              stats={[
                {
                  icon: 'navigate-circle',
                  label: 'Active Trips',
                  value: logisticsStats.active_shipments || 0,
                  color: '#0284c7',
                  subtitle: 'In transit'
                },
                {
                  icon: 'checkmark-circle',
                  label: 'Completed',
                  value: logisticsStats.completed_shipments || 0,
                  color: '#16a34a',
                  subtitle: 'Delivered'
                },
                {
                  icon: 'speedometer',
                  label: 'Success Rate',
                  value: logisticsStats.total_shipments > 0 
                    ? `${Math.round((logisticsStats.completed_shipments / logisticsStats.total_shipments) * 100)}%`
                    : '0%',
                  color: '#f59e0b',
                  subtitle: 'Performance'
                },
                {
                  icon: logisticsStats.is_verified ? 'shield-checkmark' : 'shield-outline',
                  label: 'Status',
                  value: logisticsStats.is_verified ? 'Verified' : 'Pending',
                  color: logisticsStats.is_verified ? '#8b5cf6' : '#ef4444',
                  subtitle: 'Account'
                },
              ]}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {(isFarmer ? farmerQuickActions : logisticsQuickActions).map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
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
  heroCardContainer: {
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingTop: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Farmer Weather Styles
  weatherContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  weatherHeaderRow: {
    marginBottom: 16,
  },
  weatherGreeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weatherLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  weatherMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 16,
  },
  tempSection: {
    flex: 1.2,
  },
  temperature: {
    fontSize: 68,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 68,
    letterSpacing: -3,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
  },
  conditionTextContainer: {
    flex: 1,
  },
  weatherCondition: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
  },
  weatherDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'capitalize',
  },
  feelsLike: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  detailsSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  weatherCardsColumn: {
    gap: 10,
  },
  weatherDetailCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
    minWidth: 120,
  },
  cardContent: {
    flex: 1,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 19,
  },
  weatherDetailLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  weatherAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  weatherAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
    fontWeight: '500',
  },
  cropRecommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cropRecommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cropIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropRecommendationText: {
    flex: 1,
  },
  cropRecommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 3,
  },
  cropRecommendationSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  // Logistics Map Styles
  mapContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  mapGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  mapName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  mapStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
  },
  tripInfo: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 18,
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tripPoint: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfoText: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 3,
  },
  tripValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tripDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 18,
    letterSpacing: -0.4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 130,
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  actionItem: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: 'white',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  // Wallet Section
  walletSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  walletBalance: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  walletStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletStatItem: {
    flex: 1,
  },
  walletStatLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  walletStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  walletDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
});
  