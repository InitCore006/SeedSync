import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DailyForecast } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface DailyForecastCardProps {
  forecast: DailyForecast;
  onPress?: () => void;
}

const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ forecast, onPress }) => {
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

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.day}>{getDayName(forecast.date)}</Text>
        <Text style={styles.date}>
          {new Date(forecast.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.icon}>
          {getWeatherIcon(forecast.conditions[0]?.main || 'Clear')}
        </Text>
        <Text style={styles.condition}>{forecast.conditions[0]?.description}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.tempContainer}>
          <Text style={styles.maxTemp}>{Math.round(forecast.temperature.max)}°</Text>
          <Text style={styles.minTemp}>{Math.round(forecast.temperature.min)}°</Text>
        </View>
        {forecast.precipitationProbability > 0 && (
          <View style={styles.rainChance}>
            <Text style={styles.rainIcon}>💧</Text>
            <Text style={styles.rainText}>{Math.round(forecast.precipitationProbability)}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  leftSection: {
    width: 80,
  },
  day: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  centerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  condition: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  maxTemp: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  minTemp: {
    ...typography.body,
    color: colors.text.secondary,
  },
  rainChance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rainIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rainText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default DailyForecastCard;