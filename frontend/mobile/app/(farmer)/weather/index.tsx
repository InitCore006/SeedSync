import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useWeather } from '@/hooks/useWeather';
import WeatherCard from '@/components/weather/WeatherCard';
import HourlyForecastCard from '@/components/weather/HourlyForecastCard';
import DailyForecastCard from '@/components/weather/DailyForecastCard';
import WeatherAlertCard from '@/components/weather/WeatherAlertCard';
import SoilMoistureCard from '@/components/weather/SoilMoistureCard';
import FarmingRecommendationCard from '@/components/weather/FarmingRecommendationCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function WeatherScreen() {
  const {
    weatherData,
    isLoading,
    isRefreshing,
    error,
    fetchWeather,
    refreshWeather,
    clearError,
  } = useWeather();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  };

  if (isLoading && !weatherData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Weather</Text>
          <Pressable onPress={() => router.push('/(farmer)/weather/history')}>
            <Text style={styles.historyButton}>History</Text>
          </Pressable>
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Weather</Text>
        </View>
        <EmptyState
          icon="⚠️"
          title="Unable to Load Weather"
          description={error}
          actionLabel="Try Again"
          onAction={() => {
            clearError();
            fetchWeather();
          }}
        />
      </SafeAreaView>
    );
  }

  if (!weatherData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Weather</Text>
        </View>
        <EmptyState
          icon="🌤️"
          title="No Weather Data"
          description="Unable to fetch weather information"
          actionLabel="Refresh"
          onAction={fetchWeather}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather</Text>
        <Pressable onPress={() => router.push('/(farmer)/weather/history')}>
          <Text style={styles.historyButton}>History</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Weather Alerts */}
          {weatherData.alerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⚠️ Weather Alerts</Text>
                <Pressable onPress={() => router.push('/(farmer)/weather/alerts')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </Pressable>
              </View>
              {weatherData.alerts.slice(0, 2).map((alert) => (
                <WeatherAlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => router.push(`/(farmer)/weather/alert/${alert.id}`)}
                />
              ))}
            </View>
          )}

          {/* Current Weather */}
          <WeatherCard
            weather={weatherData.current}
            locationName={weatherData.location.name}
          />

          {/* Soil Moisture */}
          {weatherData.soilMoisture && (
            <SoilMoistureCard soilMoisture={weatherData.soilMoisture} />
          )}

          {/* Farming Recommendations */}
          {weatherData.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Farming Recommendations</Text>
              {weatherData.recommendations.map((rec) => (
                <FarmingRecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </View>
          )}

          {/* Hourly Forecast */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hourly Forecast</Text>
              <Pressable onPress={() => router.push('/(farmer)/weather/hourly')}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            <HourlyForecastCard forecasts={weatherData.hourly} />
          </View>

          {/* Daily Forecast */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            </View>
            {weatherData.daily.map((forecast, index) => (
              <DailyForecastCard
                key={index}
                forecast={forecast}
                onPress={() =>
                  router.push({
                    pathname: '/(farmer)/weather/daily-detail',
                    params: { date: forecast.date },
                  })
                }
              />
            ))}
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Last updated:{' '}
              {new Date(weatherData.lastUpdated).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(farmer)/weather/radar')}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionText}>Weather Map</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(farmer)/weather/seasonal')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Seasonal Data</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  historyButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  lastUpdated: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  lastUpdatedText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});