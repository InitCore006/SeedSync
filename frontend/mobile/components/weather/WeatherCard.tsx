import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, withOpacity } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { weatherService, WeatherData } from '@/services/weather.service';

interface WeatherCardProps {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

export default function WeatherCard({ onMenuPress, onNotificationPress }: WeatherCardProps) {
  const insets = useSafeAreaInsets();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission required');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      console.log('Current Coordinates:', { latitude, longitude });

      const weatherData = await weatherService.getWeatherByCoords({ latitude, longitude });
      setWeather(weatherData);
      setLoading(false);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Unable to fetch weather');
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string): keyof typeof Ionicons.glyphMap => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain')) return 'rainy';
    if (lowerCondition.includes('cloud')) return 'cloudy';
    if (lowerCondition.includes('clear')) return 'sunny';
    if (lowerCondition.includes('storm')) return 'thunderstorm';
    if (lowerCondition.includes('snow')) return 'snow';
    if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) return 'cloudy';
    return 'partly-sunny';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={onMenuPress}>
            <Ionicons name="menu" size={24} color={colors.white} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error || !weather) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={onMenuPress}>
            <Ionicons name="menu" size={24} color={colors.white} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.white} />
          <Text style={styles.errorText}>{error || 'Unable to load weather'}</Text>
          <Pressable style={styles.retryButton} onPress={fetchWeather}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header Icons */}
      <View style={styles.header}>
        <Pressable 
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed
          ]} 
          onPress={onMenuPress}
        >
          <Ionicons name="menu" size={24} color={colors.white} />
        </Pressable>
        <Pressable 
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed
          ]} 
          onPress={onNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.white} />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Greeting & Location */}
        <View style={styles.topSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color={withOpacity(colors.white, 0.9)} />
            <Text style={styles.locationText}>{weather.location}</Text>
          </View>
        </View>

        {/* Weather Main */}
        <View style={styles.mainWeather}>
          <View style={styles.leftSection}>
            <View style={styles.temperatureRow}>
              <Text style={styles.temperature}>{weather.temperature}°</Text>
              <Ionicons 
                name={getWeatherIcon(weather.condition)} 
                size={64} 
                color={colors.white} 
              />
            </View>
            <Text style={styles.condition}>{weather.condition}</Text>
            <Text style={styles.feelsLike}>Feels like {weather.feelsLike}°C</Text>
          </View>

          {/* Weather Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Ionicons name="water-outline" size={18} color={colors.white} />
              <Text style={styles.detailValue}>{weather.humidity}%</Text>
              <Text style={styles.detailLabel}>Humidity</Text>
            </View>
            <View style={styles.detailBox}>
              <Ionicons name="speedometer-outline" size={18} color={colors.white} />
              <Text style={styles.detailValue}>{weather.windSpeed}</Text>
              <Text style={styles.detailLabel}>km/h</Text>
            </View>
          </View>
        </View>

        {/* Farming Tip */}
        <View style={styles.tipContainer}>
          <Ionicons name="bulb-outline" size={16} color={colors.white} />
          <Text style={styles.tipText}>
            {weatherService.getFarmingTip(weather.condition, weather.temperature, weather.humidity)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconButtonPressed: {
    backgroundColor: withOpacity(colors.white, 0.2),
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    fontSize: 14,
    color: colors.white,
    marginTop: spacing.sm,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    fontSize: 14,
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryButton: {
    backgroundColor: withOpacity(colors.white, 0.2),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.white,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: withOpacity(colors.white, 0.9),
    fontWeight: '500',
    marginLeft: 4,
  },
  mainWeather: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  leftSection: {
    flex: 1,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  temperature: {
    fontSize: 56,
    fontWeight: '300',
    color: colors.white,
    lineHeight: 56,
    marginRight: spacing.sm,
  },
  condition: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  feelsLike: {
    fontSize: 13,
    color: withOpacity(colors.white, 0.85),
    fontWeight: '400',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailBox: {
    backgroundColor: withOpacity(colors.white, 0.15),
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginTop: 4,
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 10,
    color: withOpacity(colors.white, 0.8),
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: withOpacity(colors.white, 0.15),
    borderRadius: 10,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: colors.white,
    marginLeft: spacing.xs,
    lineHeight: 16,
    fontWeight: '500',
  },
});