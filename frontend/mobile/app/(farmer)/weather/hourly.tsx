import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useWeather } from '@/hooks/useWeather';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function HourlyForecastScreen() {
  const { weatherData, isLoading, fetchWeather } = useWeather();

  useEffect(() => {
    if (!weatherData) {
      fetchWeather();
    }
  }, []);

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

  const groupForecastsByDay = () => {
    if (!weatherData?.hourly) return [];

    const groups: { [key: string]: any[] } = {};

    weatherData.hourly.forEach((forecast) => {
      const date = new Date(forecast.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(forecast);
    });

    return Object.entries(groups).map(([date, forecasts]) => ({ date, forecasts }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Hourly Forecast</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoText}>
                Detailed hour-by-hour weather forecast for the next 24 hours
              </Text>
            </View>

            {groupForecastsByDay().map((group, groupIndex) => (
              <View key={groupIndex} style={styles.daySection}>
                <Text style={styles.dayTitle}>{group.date}</Text>
                {group.forecasts.map((forecast, index) => {
                  const time = new Date(forecast.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isRaining = forecast.precipitation > 0;

                  return (
                    <View key={index} style={styles.forecastCard}>
                      <View style={styles.timeSection}>
                        <Text style={styles.time}>{time}</Text>
                        <Text style={styles.icon}>
                          {getWeatherIcon(forecast.conditions[0]?.main || 'Clear')}
                        </Text>
                      </View>

                      <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Temperature</Text>
                            <Text style={styles.detailValue}>
                              {Math.round(forecast.temperature)}°C
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Feels Like</Text>
                            <Text style={styles.detailValue}>
                              {Math.round(forecast.feelsLike)}°C
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailRow}>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>💧 Humidity</Text>
                            <Text style={styles.detailValue}>{forecast.humidity}%</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>💨 Wind</Text>
                            <Text style={styles.detailValue}>
                              {Math.round(forecast.windSpeed)} km/h
                            </Text>
                          </View>
                        </View>

                        {isRaining && (
                          <View style={styles.rainInfo}>
                            <Text style={styles.rainIcon}>🌧️</Text>
                            <Text style={styles.rainText}>
                              {forecast.precipitationProbability}% chance •{' '}
                              {forecast.precipitation.toFixed(1)} mm
                            </Text>
                          </View>
                        )}

                        <View style={styles.cloudInfo}>
                          <Text style={styles.cloudLabel}>☁️ Cloud Cover:</Text>
                          <View style={styles.cloudBar}>
                            <View
                              style={[
                                styles.cloudProgress,
                                { width: `${forecast.cloudiness}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.cloudValue}>{forecast.cloudiness}%</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  daySection: {
    marginBottom: spacing.lg,
  },
  dayTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  forecastCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  time: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  detailsSection: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    padding: spacing.sm,
    borderRadius: 8,
  },
  rainIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  rainText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  cloudInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cloudLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cloudBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  cloudProgress: {
    height: '100%',
    backgroundColor: colors.text.secondary,
    borderRadius: 3,
  },
  cloudValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});