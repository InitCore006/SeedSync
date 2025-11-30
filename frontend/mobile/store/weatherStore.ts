import { create } from 'zustand';
import { WeatherData, WeatherHistory, SeasonalData } from '@/types/weather.types';
import { weatherService } from '@/services/weather.service';

interface WeatherState {
  // State
  weatherData: WeatherData | null;
  weatherHistory: WeatherHistory[];
  seasonalData: SeasonalData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchTime: string | null;

  // Actions
  fetchWeather: (latitude: number, longitude: number) => Promise<void>;
  refreshWeather: (latitude: number, longitude: number) => Promise<void>;
  fetchWeatherHistory: (latitude: number, longitude: number, days?: number) => Promise<void>;
  fetchSeasonalData: (state: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  // Initial state
  weatherData: null,
  weatherHistory: [],
  seasonalData: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchTime: null,

  // Fetch weather data
  fetchWeather: async (latitude: number, longitude: number) => {
    try {
      set({ isLoading: true, error: null });
      const data = await weatherService.getWeatherData(latitude, longitude);
      set({
        weatherData: data,
        lastFetchTime: new Date().toISOString(),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch weather data',
        isLoading: false,
      });
    }
  },

  // Refresh weather data
  refreshWeather: async (latitude: number, longitude: number) => {
    try {
      set({ isRefreshing: true, error: null });
      const data = await weatherService.getWeatherData(latitude, longitude);
      set({
        weatherData: data,
        lastFetchTime: new Date().toISOString(),
        isRefreshing: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to refresh weather data',
        isRefreshing: false,
      });
    }
  },

  // Fetch weather history
  fetchWeatherHistory: async (latitude: number, longitude: number, days: number = 30) => {
    try {
      set({ isLoading: true, error: null });
      const history = await weatherService.getWeatherHistory(latitude, longitude, days);
      set({
        weatherHistory: history,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch weather history',
        isLoading: false,
      });
    }
  },

  // Fetch seasonal data
  fetchSeasonalData: async (state: string) => {
    try {
      const data = await weatherService.getSeasonalData(state);
      set({ seasonalData: data });
    } catch (error: any) {
      console.error('Failed to fetch seasonal data:', error);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      weatherData: null,
      weatherHistory: [],
      seasonalData: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetchTime: null,
    }),
}));