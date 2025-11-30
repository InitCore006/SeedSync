import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useWeather } from '@/hooks/useWeather';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { LineChart } from 'react-native-chart-kit';

export default function WeatherHistoryScreen() {
  const { weatherHistory, isLoading, fetchWeatherHistory } = useWeather();
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetchWeatherHistory(selectedPeriod);
  }, [selectedPeriod]);

  const periods = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ];

  const getChartData = (type: 'temperature' | 'rainfall') => {
    if (!weatherHistory.length) return null;

    const data = weatherHistory.slice(-selectedPeriod);
    
    if (type === 'temperature') {
      return {
        labels: data.map((h) => {
          const date = new Date(h.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
          {
            data: data.map((h) => h.temperature.max),
            color: () => colors.error,
            strokeWidth: 2,
          },
          {
            data: data.map((h) => h.temperature.min),
            color: () => colors.primary,
            strokeWidth: 2,
          },
        ],
        legend: ['Max Temp', 'Min Temp'],
      };
    } else {
      return {
        labels: data.map((h) => {
          const date = new Date(h.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
          {
            data: data.map((h) => h.rainfall || 0.1),
            color: () => colors.primary,
            strokeWidth: 2,
          },
        ],
        legend: ['Rainfall (mm)'],
      };
    }
  };

  const calculateStats = () => {
    if (!weatherHistory.length) return null;

    const data = weatherHistory.slice(-selectedPeriod);
    
    const avgTemp = data.reduce((sum, h) => sum + h.temperature.avg, 0) / data.length;
    const maxTemp = Math.max(...data.map((h) => h.temperature.max));
    const minTemp = Math.min(...data.map((h) => h.temperature.min));
    const totalRainfall = data.reduce((sum, h) => sum + h.rainfall, 0);
    const rainyDays = data.filter((h) => h.rainfall > 0).length;
    const avgHumidity = data.reduce((sum, h) => sum + h.humidity, 0) / data.length;

    return {
      avgTemp: avgTemp.toFixed(1),
      maxTemp: maxTemp.toFixed(1),
      minTemp: minTemp.toFixed(1),
      totalRainfall: totalRainfall.toFixed(1),
      rainyDays,
      avgHumidity: avgHumidity.toFixed(1),
    };
  };

  const stats = calculateStats();
  const tempChartData = getChartData('temperature');
  const rainfallChartData = getChartData('rainfall');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Weather History</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Period Selector */}
            <View style={styles.periodSelector}>
              {periods.map((period) => (
                <Pressable
                  key={period.value}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period.value && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period.value as 7 | 30 | 90)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period.value && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Statistics Summary */}
            {stats && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Summary Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🌡️</Text>
                    <Text style={styles.statLabel}>Avg Temp</Text>
                    <Text style={styles.statValue}>{stats.avgTemp}°C</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statLabel}>Max Temp</Text>
                    <Text style={styles.statValue}>{stats.maxTemp}°C</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>❄️</Text>
                    <Text style={styles.statLabel}>Min Temp</Text>
                    <Text style={styles.statValue}>{stats.minTemp}°C</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>🌧️</Text>
                    <Text style={styles.statLabel}>Total Rain</Text>
                    <Text style={styles.statValue}>{stats.totalRainfall} mm</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>☔</Text>
                    <Text style={styles.statLabel}>Rainy Days</Text>
                    <Text style={styles.statValue}>{stats.rainyDays}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statIcon}>💧</Text>
                    <Text style={styles.statLabel}>Avg Humidity</Text>
                    <Text style={styles.statValue}>{stats.avgHumidity}%</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Temperature Chart */}
            {tempChartData && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Temperature Trends</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={tempChartData}
                    width={Math.max(Dimensions.get('window').width - 32, selectedPeriod * 15)}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.surface,
                      backgroundGradientFrom: colors.surface,
                      backgroundGradientTo: colors.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                      labelColor: () => colors.text.secondary,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </ScrollView>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                    <Text style={styles.legendText}>Max Temperature</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendText}>Min Temperature</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Rainfall Chart */}
            {rainfallChartData && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Rainfall Pattern</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={rainfallChartData}
                    width={Math.max(Dimensions.get('window').width - 32, selectedPeriod * 15)}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.surface,
                      backgroundGradientFrom: colors.surface,
                      backgroundGradientTo: colors.surface,
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                      labelColor: () => colors.text.secondary,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                      },
                    }}
                    bezier
                    style={styles.chart}
                  />
                </ScrollView>
              </View>
            )}

            {/* Daily Records */}
            <View style={styles.recordsContainer}>
              <Text style={styles.recordsTitle}>Daily Records</Text>
              {weatherHistory.slice(-7).reverse().map((record, index) => (
                <View key={index} style={styles.recordCard}>
                  <View style={styles.recordDate}>
                    <Text style={styles.recordDay}>
                      {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </Text>
                    <Text style={styles.recordDateText}>
                      {new Date(record.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>

                  <View style={styles.recordDetails}>
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>Max</Text>
                      <Text style={[styles.recordValue, { color: colors.error }]}>
                        {record.temperature.max.toFixed(1)}°
                      </Text>
                    </View>
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>Min</Text>
                      <Text style={[styles.recordValue, { color: colors.primary }]}>
                        {record.temperature.min.toFixed(1)}°
                      </Text>
                    </View>
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>Rain</Text>
                      <Text style={styles.recordValue}>
                        {record.rainfall.toFixed(1)} mm
                      </Text>
                    </View>
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>Humidity</Text>
                      <Text style={styles.recordValue}>
                        {record.humidity.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: colors.surface,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '31%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  recordsContainer: {
    marginTop: spacing.md,
  },
  recordsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDate: {
    width: 80,
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  recordDay: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  recordDateText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordDetails: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: spacing.md,
  },
  recordItem: {
    flex: 1,
    alignItems: 'center',
  },
  recordLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  recordValue: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
});