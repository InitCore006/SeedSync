import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WeatherData } from '@/types/crop.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface WeatherWidgetProps {
  weather: WeatherData;
}

export default function WeatherWidget({ weather }: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      default: return '🌤️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  return (
    <View style={styles.container}>
      {/* Current Weather */}
      <View style={styles.current}>
        <View style={styles.currentLeft}>
          <Text style={styles.temperature}>{weather.temperature}°C</Text>
          <Text style={styles.label}>Current Temperature</Text>
        </View>
        <View style={styles.currentRight}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statValue}>{weather.humidity}%</Text>
            <Text style={styles.statLabel}>Humidity</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🌧️</Text>
            <Text style={styles.statValue}>{weather.rainfall}mm</Text>
            <Text style={styles.statLabel}>Rainfall</Text>
          </View>
        </View>
      </View>

      {/* Wind Speed */}
      <View style={styles.windContainer}>
        <Text style={styles.windIcon}>💨</Text>
        <Text style={styles.windText}>Wind: {weather.windSpeed} km/h</Text>
      </View>

      {/* Forecast */}
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>3-Day Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weather.forecast.map((day, index) => (
            <View key={index} style={styles.forecastDay}>
              <Text style={styles.forecastDate}>{formatDate(day.date)}</Text>
              <Text style={styles.forecastIcon}>{getWeatherIcon(day.condition)}</Text>
              <Text style={styles.forecastTemp}>{day.temperature}°C</Text>
              <Text style={styles.forecastRain}>{day.rainfall}mm</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  current: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentLeft: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  currentRight: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  windContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  windIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  windText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  forecastContainer: {
    marginTop: spacing.sm,
  },
  forecastTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  forecastDay: {
    alignItems: 'center',
    marginRight: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    minWidth: 70,
  },
  forecastDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  forecastIcon: {
    fontSize: 32,
    marginVertical: spacing.xs,
  },
  forecastTemp: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  forecastRain: {
    ...typography.caption,
    color: colors.accent,
  },
});