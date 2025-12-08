import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { weatherService, WeatherData } from '@/services/weatherService';
import { geminiService } from '@/services/geminiService';

interface CropAdvisory {
  action: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export default function WeatherAdvisoryScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [advisories, setAdvisories] = useState<CropAdvisory[]>([]);

  useEffect(() => {
    fetchWeatherAndAdvisory();
  }, []);

  const fetchWeatherAndAdvisory = async () => {
    setLoading(true);
    try {
      // Get location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let weatherData: WeatherData;
      let forecastData: WeatherData[] = [];

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        weatherData = await weatherService.getWeatherByCoords(
          location.coords.latitude,
          location.coords.longitude
        );
        forecastData = await weatherService.getForecast(
          location.coords.latitude,
          location.coords.longitude
        );
      } else {
        const city = user?.profile?.state || 'Mumbai';
        weatherData = await weatherService.getWeatherByCity(city);
      }

      setWeather(weatherData);
      setForecast(forecastData.slice(0, 7)); // 7-day forecast

      // Generate AI advisory based on weather
      await generateAdvisories(weatherData, forecastData);
    } catch (error) {
      console.error('Weather fetch error:', error);
      Alert.alert('Error', 'Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAdvisories = async (current: WeatherData, forecast: WeatherData[]) => {
    try {
      const prompt = `You are a farming advisor. Based on this weather data, provide 4-5 specific farming actions:

Current Weather:
- Temperature: ${current.temperature}°C
- Condition: ${current.condition}
- Humidity: ${current.humidity}%
- Wind: ${current.windSpeed} km/h

7-Day Forecast Summary:
${forecast.map((day, i) => `Day ${i + 1}: ${day.condition}, ${day.temperature}°C`).join('\n')}

Provide practical farming actions in JSON format:
{
  "advisories": [
    {
      "action": "specific farming action",
      "reason": "why this is needed based on weather",
      "priority": "high/medium/low",
      "icon": "water/nutrition/leaf/warning-outline/sunny"
    }
  ]
}

Focus on: irrigation, fertilizer timing, pest control, harvesting, crop protection.
Return ONLY valid JSON.`;

      const response = await geminiService.generateJSON<{ advisories: CropAdvisory[] }>(prompt);
      setAdvisories(response.advisories || []);
    } catch (error) {
      console.error('Advisory generation error:', error);
      // Fallback advisories
      setAdvisories([
        {
          action: 'Monitor soil moisture regularly',
          reason: 'Current weather conditions require attention to water levels',
          priority: 'medium',
          icon: 'water',
        },
      ]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return COLORS.text.secondary;
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return 'rainy';
    if (lowerCondition.includes('cloud')) return 'cloudy';
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return 'sunny';
    if (lowerCondition.includes('storm')) return 'thunderstorm';
    return 'partly-sunny';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader 
          title="Weather Advisory" 
          onMenuPress={() => setSidebarVisible(true)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Weather Advisory" 
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView style={styles.scrollView}>
        {/* Current Weather */}
        {weather && (
          <View style={styles.currentWeatherCard}>
            <View style={styles.weatherHeader}>
              <Ionicons 
                name={getWeatherIcon(weather.condition) as any} 
                size={64} 
                color={COLORS.primary} 
              />
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{weather.temperature}°C</Text>
                <Text style={styles.condition}>{weather.condition}</Text>
                <Text style={styles.location}>{weather.location}</Text>
              </View>
            </View>

            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="water" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{weather.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="eye" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>Visibility</Text>
                <Text style={styles.detailValue}>{weather.visibility || 'Good'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Farming Advisories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>AI Farming Actions</Text>
          </View>

          {advisories.map((advisory, index) => (
            <View key={index} style={styles.advisoryCard}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(advisory.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(advisory.priority) }]}>
                  {advisory.priority.toUpperCase()}
                </Text>
              </View>
              <View style={styles.advisoryContent}>
                <View style={styles.advisoryHeader}>
                  <Ionicons name={advisory.icon as any} size={24} color={COLORS.primary} />
                  <Text style={styles.advisoryAction}>{advisory.action}</Text>
                </View>
                <Text style={styles.advisoryReason}>{advisory.reason}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 7-Day Forecast */}
        {forecast.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            </View>

            <View style={styles.forecastGrid}>
              {forecast.map((day, index) => (
                <View key={index} style={styles.forecastCard}>
                  <Text style={styles.forecastDay}>
                    {index === 0 ? 'Today' : new Date(Date.now() + index * 86400000).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </Text>
                  <Ionicons 
                    name={getWeatherIcon(day.condition) as any} 
                    size={32} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.forecastTemp}>{day.temperature}°C</Text>
                  <Text style={styles.forecastCondition}>{day.condition}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherAndAdvisory}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
          <Text style={styles.refreshButtonText}>Refresh Weather</Text>
        </TouchableOpacity>

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  currentWeatherCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  condition: {
    fontSize: 18,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  advisoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  advisoryContent: {
    gap: 8,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advisoryAction: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  advisoryReason: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginLeft: 36,
  },
  forecastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  forecastCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forecastDay: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  forecastCondition: {
    fontSize: 11,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '15',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
