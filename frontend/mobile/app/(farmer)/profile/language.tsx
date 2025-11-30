import React, { useState } from 'react';
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
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { Language } from '@/types/profile.types';

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isRTL: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isRTL: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isRTL: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isRTL: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isRTL: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRTL: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isRTL: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isRTL: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isRTL: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', isRTL: false },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isRTL: false },
];

export default function LanguageScreen() {
  const { settings, updateSettings } = useProfile();
  const [selectedLanguage, setSelectedLanguage] = useState(settings?.language || 'en');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === selectedLanguage) {
      router.back();
      return;
    }

    setSelectedLanguage(languageCode);
    setIsUpdating(true);

    try {
      await updateSettings({ language: languageCode });
      
      Alert.alert(
        'Language Changed',
        'The app language has been changed. Some changes will take effect after restarting the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsUpdating(false);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      setIsUpdating(false);
      Alert.alert('Error', 'Failed to change language. Please try again.');
      setSelectedLanguage(settings?.language || 'en');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Language</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>🌐</Text>
            <Text style={styles.infoBannerText}>
              Choose your preferred language. The app content will be displayed in the selected
              language.
            </Text>
          </View>

          {/* Language List */}
          <View style={styles.languageList}>
            {AVAILABLE_LANGUAGES.map((language) => (
              <Pressable
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.languageItemSelected,
                  isUpdating && styles.languageItemDisabled,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                disabled={isUpdating}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                </View>
                {selectedLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteIcon}>ℹ️</Text>
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Language Support</Text>
              <Text style={styles.noteText}>
                • All major Indian languages are supported
              </Text>
              <Text style={styles.noteText}>
                • Market prices and data are shown in your local language
              </Text>
              <Text style={styles.noteText}>
                • Some technical terms may remain in English
              </Text>
              <Text style={styles.noteText}>
                • More languages will be added in future updates
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoBannerIcon: {
    fontSize: 20,
  },
  infoBannerText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  languageList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  languageItemDisabled: {
    opacity: 0.5,
  },
  languageInfo: {
    flex: 1,
  },
  languageNativeName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  languageName: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  noteIcon: {
    fontSize: 20,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  noteText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});