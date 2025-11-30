import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useWeather } from '@/hooks/useWeather';
import WeatherAlertCard from '@/components/weather/WeatherAlertCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function WeatherAlertsScreen() {
  const { weatherData, isLoading, fetchWeather } = useWeather();

  useEffect(() => {
    if (!weatherData) {
      fetchWeather();
    }
  }, []);

  const activeAlerts = weatherData?.alerts.filter((alert) => {
    return new Date(alert.endTime) > new Date();
  });

  const pastAlerts = weatherData?.alerts.filter((alert) => {
    return new Date(alert.endTime) <= new Date();
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Weather Alerts</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {!activeAlerts || activeAlerts.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No Active Alerts"
                description="There are no weather alerts for your area at the moment"
              />
            ) : (
              <>
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>⚠️</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>
                      {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.infoText}>
                      Stay informed about weather conditions that may affect your farming
                      activities
                    </Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Active Alerts</Text>
                  {activeAlerts.map((alert) => (
                    <WeatherAlertCard
                      key={alert.id}
                      alert={alert}
                      onPress={() => router.push(`/(farmer)/weather/alert/${alert.id}`)}
                    />
                  ))}
                </View>
              </>
            )}

            {pastAlerts && pastAlerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Alerts</Text>
                {pastAlerts.map((alert) => (
                  <WeatherAlertCard
                    key={alert.id}
                    alert={alert}
                    onPress={() => router.push(`/(farmer)/weather/alert/${alert.id}`)}
                  />
                ))}
              </View>
            )}

            <View style={styles.tipsCard}>
              <Text style={styles.tipsIcon}>💡</Text>
              <View style={styles.tipsContent}>
                <Text style={styles.tipsTitle}>Alert Tips</Text>
                <Text style={styles.tipsText}>
                  • Enable notifications to receive real-time weather alerts
                </Text>
                <Text style={styles.tipsText}>
                  • Check alerts before planning field activities
                </Text>
                <Text style={styles.tipsText}>
                  • Follow safety instructions during severe weather
                </Text>
                <Text style={styles.tipsText}>
                  • Share alerts with other farmers in your community
                </Text>
              </View>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}20`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tipsIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipsText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});