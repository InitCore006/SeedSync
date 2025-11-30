import { useEffect } from 'react';
import { useWeatherStore } from '@/store/weatherStore';
import * as Location from 'expo-location';

export const useWeather = () => {
  const {
    weatherData,
    weatherHistory,
    seasonalData,
    isLoading,
    isRefreshing,
    error,
    lastFetchTime,
    fetchWeather,
    refreshWeather,
    fetchWeatherHistory,
    fetchSeasonalData,
    clearError,
  } = useWeatherStore();

  // Get user location and fetch weather
  const fetchWeatherForCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      await fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (error: any) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  // Refresh weather for current location
  const refreshWeatherForCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      await refreshWeather(location.coords.latitude, location.coords.longitude);
    } catch (error: any) {
      console.error('Error refreshing weather:', error);
      throw error;
    }
  };

  // Get weather history for current location
  const fetchHistoryForCurrentLocation = async (days: number = 30) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({});
      await fetchWeatherHistory(location.coords.latitude, location.coords.longitude, days);
    } catch (error: any) {
      console.error('Error fetching weather history:', error);
      throw error;
    }
  };

  // Check if data needs refresh (older than 30 minutes)
  const needsRefresh = () => {
    if (!lastFetchTime) return true;
    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - new Date(lastFetchTime).getTime() > thirtyMinutes;
  };

  return {
    // Data
    weatherData,
    weatherHistory,
    seasonalData,
    isLoading,
    isRefreshing,
    error,
    lastFetchTime,

    // Methods
    fetchWeather: fetchWeatherForCurrentLocation,
    refreshWeather: refreshWeatherForCurrentLocation,
    fetchWeatherHistory: fetchHistoryForCurrentLocation,
    fetchSeasonalData,
    clearError,
    needsRefresh,
  };
};