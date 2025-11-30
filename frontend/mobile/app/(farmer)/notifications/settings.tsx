import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationSettingsItem from '@/components/notifications/NotificationSettingsItem';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { NotificationSettings } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function NotificationSettingsScreen() {
  const { settings, fetchSettings, updateSettings } = useNotifications();

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    if (settings) {
      updateSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={{ width: 50 }} />
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔔</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Stay Informed</Text>
              <Text style={styles.infoText}>
                Customize which notifications you want to receive. You can always change these
                settings later.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Essential Alerts</Text>
            <Text style={styles.sectionDescription}>
              Important notifications for weather and crop health
            </Text>

            <NotificationSettingsItem
              icon="🌦️"
              title="Weather Alerts"
              description="Get notified about severe weather conditions and forecasts"
              value={settings.weatherAlerts}
              onValueChange={() => handleToggle('weatherAlerts')}
            />

            <NotificationSettingsItem
              icon="🌾"
              title="Crop Reminders"
              description="Reminders for irrigation, fertilization, and harvesting"
              value={settings.cropReminders}
              onValueChange={() => handleToggle('cropReminders')}
            />

            <NotificationSettingsItem
              icon="🤖"
              title="AI Insights"
              description="Get AI-powered recommendations and disease alerts"
              value={settings.aiInsights}
              onValueChange={() => handleToggle('aiInsights')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Updates</Text>
            <Text style={styles.sectionDescription}>
              Stay updated with market prices and trends
            </Text>

            <NotificationSettingsItem
              icon="💰"
              title="Price Alerts"
              description="Get notified when crop prices change significantly"
              value={settings.priceAlerts}
              onValueChange={() => handleToggle('priceAlerts')}
            />

            <NotificationSettingsItem
              icon="🏪"
              title="Market Updates"
              description="Latest news and updates from agricultural markets"
              value={settings.marketUpdates}
              onValueChange={() => handleToggle('marketUpdates')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community</Text>
            <Text style={styles.sectionDescription}>
              Engage with the farming community
            </Text>

            <NotificationSettingsItem
              icon="👥"
              title="Community Posts"
              description="New posts, comments, and mentions from the community"
              value={settings.communityPosts}
              onValueChange={() => handleToggle('communityPosts')}
            />
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsIcon}>💡</Text>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Notification Tips</Text>
              <Text style={styles.tipsText}>
                • Weather alerts are crucial for protecting your crops
              </Text>
              <Text style={styles.tipsText}>
                • Enable crop reminders to never miss important farming tasks
              </Text>
              <Text style={styles.tipsText}>
                • Price alerts help you sell at the right time
              </Text>
              <Text style={styles.tipsText}>
                • You can customize notification sounds in device settings
              </Text>
            </View>
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 16,
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