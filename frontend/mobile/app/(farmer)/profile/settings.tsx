import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import Switch from '@/components/common/Switch';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { AppSettings } from '@/types/profile.types';

export default function SettingsScreen() {
  const { settings, isLoading, fetchSettings, updateSettings } = useProfile();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = async (category: string, key: string, value: boolean) => {
    if (!localSettings) return;

    const updatedSettings = {
      ...localSettings,
      [category]: {
        ...localSettings[category as keyof AppSettings],
        [key]: value,
      },
    };

    setLocalSettings(updatedSettings);

    try {
      await updateSettings(updatedSettings);
    } catch (error) {
      // Revert on error
      setLocalSettings(settings);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  if (isLoading || !localSettings) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
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
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive push notifications on your device
                  </Text>
                </View>
                <Switch
                  value={localSettings.notifications.enabled}
                  onValueChange={(value) => handleToggle('notifications', 'enabled', value)}
                />
              </View>

              {localSettings.notifications.enabled && (
                <>
                  <View style={styles.settingDivider} />
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Market Updates</Text>
                      <Text style={styles.settingDescription}>
                        Get notified about market price changes
                      </Text>
                    </View>
                    <Switch
                      value={localSettings.notifications.marketUpdates}
                      onValueChange={(value) =>
                        handleToggle('notifications', 'marketUpdates', value)
                      }
                    />
                  </View>

                  <View style={styles.settingDivider} />
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Price Alerts</Text>
                      <Text style={styles.settingDescription}>
                        Alerts when target prices are reached
                      </Text>
                    </View>
                    <Switch
                      value={localSettings.notifications.priceAlerts}
                      onValueChange={(value) =>
                        handleToggle('notifications', 'priceAlerts', value)
                      }
                    />
                  </View>

                  <View style={styles.settingDivider} />
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Weather Alerts</Text>
                      <Text style={styles.settingDescription}>
                        Get severe weather warnings
                      </Text>
                    </View>
                    <Switch
                      value={localSettings.notifications.weatherAlerts}
                      onValueChange={(value) =>
                        handleToggle('notifications', 'weatherAlerts', value)
                      }
                    />
                  </View>

                  <View style={styles.settingDivider} />
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Crop Reminders</Text>
                      <Text style={styles.settingDescription}>
                        Reminders for planting and harvesting
                      </Text>
                    </View>
                    <Switch
                      value={localSettings.notifications.cropReminders}
                      onValueChange={(value) =>
                        handleToggle('notifications', 'cropReminders', value)
                      }
                    />
                  </View>

                  <View style={styles.settingDivider} />
                  <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Trade Messages</Text>
                      <Text style={styles.settingDescription}>
                        Messages from buyers and sellers
                      </Text>
                    </View>
                    <Switch
                      value={localSettings.notifications.tradeMessages}
                      onValueChange={(value) =>
                        handleToggle('notifications', 'tradeMessages', value)
                      }
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Privacy</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Show Profile</Text>
                  <Text style={styles.settingDescription}>
                    Make your profile visible to other users
                  </Text>
                </View>
                <Switch
                  value={localSettings.privacy.showProfile}
                  onValueChange={(value) => handleToggle('privacy', 'showProfile', value)}
                />
              </View>

              <View style={styles.settingDivider} />
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Show Location</Text>
                  <Text style={styles.settingDescription}>
                    Share your location in listings
                  </Text>
                </View>
                <Switch
                  value={localSettings.privacy.showLocation}
                  onValueChange={(value) => handleToggle('privacy', 'showLocation', value)}
                />
              </View>

              <View style={styles.settingDivider} />
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Allow Messages</Text>
                  <Text style={styles.settingDescription}>
                    Let other users contact you
                  </Text>
                </View>
                <Switch
                  value={localSettings.privacy.allowMessages}
                  onValueChange={(value) => handleToggle('privacy', 'allowMessages', value)}
                />
              </View>
            </View>
          </View>

          {/* Data Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Data Usage</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-download Images</Text>
                  <Text style={styles.settingDescription}>
                    Automatically download images on WiFi
                  </Text>
                </View>
                <Switch
                  value={localSettings.dataUsage.autoDownloadImages}
                  onValueChange={(value) =>
                    handleToggle('dataUsage', 'autoDownloadImages', value)
                  }
                />
              </View>

              <View style={styles.settingDivider} />
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-download Videos</Text>
                  <Text style={styles.settingDescription}>
                    Automatically download videos on WiFi
                  </Text>
                </View>
                <Switch
                  value={localSettings.dataUsage.autoDownloadVideos}
                  onValueChange={(value) =>
                    handleToggle('dataUsage', 'autoDownloadVideos', value)
                  }
                />
              </View>

              <View style={styles.settingDivider} />
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Data Saver Mode</Text>
                  <Text style={styles.settingDescription}>
                    Reduce data usage for all features
                  </Text>
                </View>
                <Switch
                  value={localSettings.dataUsage.dataSaverMode}
                  onValueChange={(value) => handleToggle('dataUsage', 'dataSaverMode', value)}
                />
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Preferences</Text>
            <View style={styles.settingsCard}>
              <Pressable
                style={styles.settingItem}
                onPress={() => router.push('/(farmer)/profile/language')}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Language</Text>
                  <Text style={styles.settingDescription}>
                    {localSettings.language === 'en' ? 'English' : localSettings.language}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>

              <View style={styles.settingDivider} />
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Theme</Text>
                  <Text style={styles.settingDescription}>
                    {localSettings.theme === 'light'
                      ? 'Light'
                      : localSettings.theme === 'dark'
                      ? 'Dark'
                      : 'System'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteIcon}>ℹ️</Text>
            <Text style={styles.infoNoteText}>
              Changes are saved automatically. You can modify these settings anytime.
            </Text>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  infoNoteIcon: {
    fontSize: 16,
  },
  infoNoteText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
});