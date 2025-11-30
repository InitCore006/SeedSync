import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '100';

export default function AboutScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* App Logo & Info */}
          <View style={styles.appInfoSection}>
            <View style={styles.appLogo}>
              <Text style={styles.appLogoText}>🌾</Text>
            </View>
            <Text style={styles.appName}>SeedSync</Text>
            <Text style={styles.appTagline}>Empowering Farmers, Growing Together</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                Version {APP_VERSION} (Build {BUILD_NUMBER})
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About SeedSync</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                SeedSync is a comprehensive agricultural management platform designed to help
                farmers manage their crops, access market information, connect with buyers, and
                make informed decisions using real-time data and expert advisory.
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresCard}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌾</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Crop Management</Text>
                  <Text style={styles.featureDescription}>
                    Track and manage all your crops in one place
                  </Text>
                </View>
              </View>

              <View style={styles.featureDivider} />

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Market Prices</Text>
                  <Text style={styles.featureDescription}>
                    Real-time market prices from mandis across India
                  </Text>
                </View>
              </View>

              <View style={styles.featureDivider} />

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🤝</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Direct Trading</Text>
                  <Text style={styles.featureDescription}>
                    Connect with buyers and sellers directly
                  </Text>
                </View>
              </View>

              <View style={styles.featureDivider} />

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌤️</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Weather Updates</Text>
                  <Text style={styles.featureDescription}>
                    Accurate weather forecasts and alerts
                  </Text>
                </View>
              </View>

              <View style={styles.featureDivider} />

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💡</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>Expert Advisory</Text>
                  <Text style={styles.featureDescription}>
                    Get guidance from agricultural experts
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.linksCard}>
              <Pressable
                style={styles.linkItem}
                onPress={() => handleOpenLink('https://seedsync.com/privacy')}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
                <Text style={styles.linkChevron}>›</Text>
              </Pressable>

              <View style={styles.linkDivider} />

              <Pressable
                style={styles.linkItem}
                onPress={() => handleOpenLink('https://seedsync.com/terms')}
              >
                <Text style={styles.linkText}>Terms of Service</Text>
                <Text style={styles.linkChevron}>›</Text>
              </Pressable>

              <View style={styles.linkDivider} />

              <Pressable
                style={styles.linkItem}
                onPress={() => handleOpenLink('https://seedsync.com/licenses')}
              >
                <Text style={styles.linkText}>Open Source Licenses</Text>
                <Text style={styles.linkChevron}>›</Text>
              </Pressable>

              <View style={styles.linkDivider} />

              <Pressable
                style={styles.linkItem}
                onPress={() => handleOpenLink('https://seedsync.com')}
              >
                <Text style={styles.linkText}>Visit Our Website</Text>
                <Text style={styles.linkChevron}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Social Media */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect With Us</Text>
            <View style={styles.socialButtons}>
              <Pressable
                style={styles.socialButton}
                onPress={() => handleOpenLink('https://facebook.com/seedsync')}
              >
                <Text style={styles.socialIcon}>📘</Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => handleOpenLink('https://twitter.com/seedsync')}
              >
                <Text style={styles.socialIcon}>🐦</Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => handleOpenLink('https://instagram.com/seedsync')}
              >
                <Text style={styles.socialIcon}>📸</Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => handleOpenLink('https://youtube.com/seedsync')}
              >
                <Text style={styles.socialIcon}>▶️</Text>
              </Pressable>
            </View>
          </View>

          {/* Credits */}
          <View style={styles.creditsCard}>
            <Text style={styles.creditsTitle}>Data Sources</Text>
            <Text style={styles.creditsText}>
              • Market data: Ministry of Agriculture & Farmers Welfare
            </Text>
            <Text style={styles.creditsText}>
              • Weather data: India Meteorological Department (IMD)
            </Text>
            <Text style={styles.creditsText}>
              • MSP data: Commission for Agricultural Costs & Prices (CACP)
            </Text>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightSection}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} SeedSync. All rights reserved.
            </Text>
            <Text style={styles.copyrightSubtext}>
              Made with ❤️ for Indian Farmers
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
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appLogoText: {
    fontSize: 48,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  appTagline: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  versionBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  versionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  featureDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 32 + spacing.md,
  },
  linksCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  linkText: {
    ...typography.body,
    color: colors.text.primary,
  },
  linkChevron: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  linkDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 28,
  },
  creditsCard: {
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  creditsTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  creditsText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  copyrightText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  copyrightSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});