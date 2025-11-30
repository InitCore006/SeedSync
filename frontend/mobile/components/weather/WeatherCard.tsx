import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CurrentWeather } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface WeatherCardProps {
  weather: CurrentWeather;
  locationName: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, locationName }) => {
  const getWeatherIcon = (main: string) => {
    const icons: { [key: string]: string } = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Smoke: '💨',
      Haze: '🌫️',
      Dust: '🌪️',
      Fog: '🌫️',
    };
    return icons[main] || '🌤️';
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return colors.success;
    if (index <= 5) return colors.warning;
    if (index <= 7) return colors.error;
    return '#9C27B0';
  };

  const getUVIndexLabel = (index: number) => {
    if (index <= 2) return 'Low';
    if (index <= 5) return 'Moderate';
    if (index <= 7) return 'High';
    if (index <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.location}>{locationName}</Text>
          <Text style={styles.condition}>
            {weather.conditions[0]?.description || 'Clear'}
          </Text>
        </View>
        <Text style={styles.weatherIcon}>
          {getWeatherIcon(weather.conditions[0]?.main || 'Clear')}
        </Text>
      </View>

      <View style={styles.temperatureContainer}>
        <Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text>
        <Text style={styles.feelsLike}>Feels like {Math.round(weather.feelsLike)}°</Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💧</Text>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{weather.humidity}%</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💨</Text>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🌡️</Text>
          <Text style={styles.detailLabel}>Pressure</Text>
          <Text style={styles.detailValue}>{weather.pressure} mb</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>☀️</Text>
          <Text style={styles.detailLabel}>UV Index</Text>
          <Text style={[styles.detailValue, { color: getUVIndexColor(weather.uvIndex) }]}>
            {weather.uvIndex} ({getUVIndexLabel(weather.uvIndex)})
          </Text>
        </View>
      </View>

      {weather.rainfall !== undefined && weather.rainfall > 0 && (
        <View style={styles.rainfallContainer}>
          <Text style={styles.rainfallIcon}>🌧️</Text>
          <Text style={styles.rainfallText}>
            Rainfall: {weather.rainfall.toFixed(1)} mm
          </Text>
        </View>
      )}

      <View style={styles.sunContainer}>
        <View style={styles.sunItem}>
          <Text style={styles.sunIcon}>🌅</Text>
          <Text style={styles.sunLabel}>Sunrise</Text>
          <Text style={styles.sunTime}>
            {new Date(weather.sunrise).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.sunDivider} />

        <View style={styles.sunItem}>
          <Text style={styles.sunIcon}>🌇</Text>
          <Text style={styles.sunLabel}>Sunset</Text>
          <Text style={styles.sunTime}>
            {new Date(weather.sunset).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  location: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  condition: {
    ...typography.body,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  weatherIcon: {
    fontSize: 64,
  },
  temperatureContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  feelsLike: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  detailItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rainfallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}15`,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  rainfallIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  rainfallText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  sunContainer: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sunItem: {
    flex: 1,
    alignItems: 'center',
  },
  sunIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  sunLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  sunTime: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sunDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});

export default WeatherCard;