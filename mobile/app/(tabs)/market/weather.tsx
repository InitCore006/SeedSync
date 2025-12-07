import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { advisoryAPI } from '@/services/advisoryService';

interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  weather: string;
}

export default function WeatherScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const fetchWeather = async () => {
    if (!location) {
      Alert.alert('Error', 'Please enable location first');
      return;
    }

    setLoading(true);
    try {
      const response = await advisoryAPI.getWeather(
        location.latitude,
        location.longitude
      );
      setWeather(response.data.forecast || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const getWeatherIcon = (weather: string) => {
    if (weather.toLowerCase().includes('rain')) return 'rainy';
    if (weather.toLowerCase().includes('cloud')) return 'cloudy';
    if (weather.toLowerCase().includes('sun') || weather.toLowerCase().includes('clear'))
      return 'sunny';
    return 'partly-sunny';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather Forecast</Text>
        <Text style={styles.subtitle}>5-day weather prediction</Text>
        {!location && (
          <Button
            title="Enable Location"
            onPress={getLocation}
            style={styles.button}
          />
        )}
        {location && (
          <Button
            title="Get Weather"
            onPress={fetchWeather}
            loading={loading}
            style={styles.button}
          />
        )}
      </View>

      {loading && <Loading />}

      {!loading && weather.length > 0 && (
        <View style={styles.weatherContainer}>
          {weather.map((day, index) => (
            <View key={index} style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <Text style={styles.date}>{day.date}</Text>
                <Ionicons
                  name={getWeatherIcon(day.weather) as any}
                  size={32}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.weather}>{day.weather}</Text>
              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="thermometer" size={20} color={COLORS.secondary} />
                  <Text style={styles.detailText}>{day.temperature}°C</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water" size={20} color={COLORS.secondary} />
                  <Text style={styles.detailText}>{day.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="rainy" size={20} color={COLORS.secondary} />
                  <Text style={styles.detailText}>{day.rainfall}mm</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  weatherContainer: {
    padding: 20,
    paddingTop: 0,
  },
  weatherCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  weather: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
});
