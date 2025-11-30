import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HourlyForecast } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface HourlyForecastCardProps {
  forecasts: HourlyForecast[];
}

const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ forecasts }) => {
  const getWeatherIcon = (main: string) => {
    const icons: { [key: string]: string } = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
    };
    return icons[main] || '🌤️';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hourly Forecast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {forecasts.slice(0, 12).map((forecast, index) => {
          const time = new Date(forecast.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const isRaining = forecast.precipitation > 0;

          return (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.time}>{time}</Text>
              <Text style={styles.icon}>
                {getWeatherIcon(forecast.conditions[0]?.main || 'Clear')}
              </Text>
              <Text style={styles.temp}>{Math.round(forecast.temperature)}°</Text>
              {isRaining && (
                <View style={styles.rainContainer}>
                  <Text style={styles.rainIcon}>💧</Text>
                  <Text style={styles.rainText}>{forecast.precipitationProbability}%</Text>
                </View>
              )}
              <Text style={styles.wind}>💨 {Math.round(forecast.windSpeed)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    minWidth: 70,
  },
  time: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  temp: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  rainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rainIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  rainText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
  },
  wind: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
  },
});

export default HourlyForecastCard;