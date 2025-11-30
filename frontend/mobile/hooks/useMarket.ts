import { useEffect } from 'react';
import { useMarketStore } from '@/store/marketStore';
import * as Location from 'expo-location';

export const useMarket = () => {
  const {
    crops,
    prices,
    priceHistory,
    markets,
    priceAlerts,
    tradeDemands,
    myListings,
    marketNews,
    cropAnalytics,
    governmentSchemes,
    mspInfo,
    isLoading,
    error,
    fetchCrops,
    fetchPrices,
    fetchPriceHistory,
    fetchNearbyMarkets,
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert,
    fetchTradeDemands,
    createTradeListing,
    fetchMyListings,
    fetchMarketNews,
    fetchCropAnalytics,
    fetchGovernmentSchemes,
    fetchMSPInfo,
    clearError,
  } = useMarketStore();

  // Fetch markets near user location
  const fetchMarketsNearMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      await fetchNearbyMarkets(location.coords.latitude, location.coords.longitude);
    } catch (error: any) {
      console.error('Error fetching nearby markets:', error);
      throw error;
    }
  };

  // Get price trend for a crop
  const getPriceTrend = (cropId: string, days: number = 7) => {
    const history = priceHistory[cropId];
    if (!history || history.length < 2) return 'stable';

    const recentPrices = history.slice(-days);
    const firstPrice = recentPrices[0]?.price;
    const lastPrice = recentPrices[recentPrices.length - 1]?.price;
    
    if (!firstPrice || !lastPrice) return 'stable';
    
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  };

  // Get price statistics
  const getPriceStats = (cropId: string) => {
    const history = priceHistory[cropId];
    if (!history || history.length === 0) return null;

    const prices = history.map((h) => h.price).filter(p => p !== undefined && p !== null);
    if (prices.length === 0) return null;

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const currentPrice = prices[prices.length - 1];
    const change = currentPrice - prices[0];
    const changePercent = (change / prices[0]) * 100;

    return {
      current: currentPrice,
      max: maxPrice,
      min: minPrice,
      average: avgPrice,
      change,
      changePercent,
    };
  };

  // Check if price alert should be triggered
  const checkPriceAlert = (alert: any, currentPrice: number): boolean => {
    if (!alert || currentPrice === undefined || currentPrice === null) return false;
    
    if (alert.condition === 'above') {
      return currentPrice >= alert.targetPrice;
    } else {
      return currentPrice <= alert.targetPrice;
    }
  };

  // Filter prices by criteria
  const filterPrices = (filters: {
    cropName?: string;
    state?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    if (!prices || prices.length === 0) return [];
    
    return prices.filter((price) => {
      if (!price) return false;
      
      if (filters.cropName && price.cropName && !price.cropName.toLowerCase().includes(filters.cropName.toLowerCase())) {
        return false;
      }
      if (filters.state && price.state !== filters.state) {
        return false;
      }
      if (filters.district && price.district !== filters.district) {
        return false;
      }
      if (filters.minPrice !== undefined && price.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && price.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  };

  // Get trending crops
  const getTrendingCrops = () => {
    if (!prices || prices.length === 0) return [];
    
    return prices
      .filter((p) => p && p.priceChangePercent !== undefined && p.priceChangePercent > 2)
      .sort((a, b) => (b.priceChangePercent || 0) - (a.priceChangePercent || 0))
      .slice(0, 5);
  };

  return {
    // Data - with safe defaults
    crops: crops || [],
    prices: prices || [],
    priceHistory: priceHistory || {},
    markets: markets || [],
    priceAlerts: priceAlerts || [],
    tradeDemands: tradeDemands || [],
    myListings: myListings || [],
    marketNews: marketNews || [],
    cropAnalytics: cropAnalytics || null,
    governmentSchemes: governmentSchemes || [],
    mspInfo: mspInfo || [],
    isLoading: isLoading || false,
    error: error || null,

    // Methods
    fetchCrops,
    fetchPrices,
    fetchPriceHistory,
    fetchMarketsNearMe,
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert,
    fetchTradeDemands,
    createTradeListing,
    fetchMyListings,
    fetchMarketNews,
    fetchCropAnalytics,
    fetchGovernmentSchemes,
    fetchMSPInfo,
    clearError,

    // Utilities
    getPriceTrend,
    getPriceStats,
    checkPriceAlert,
    filterPrices,
    getTrendingCrops,
  };
};