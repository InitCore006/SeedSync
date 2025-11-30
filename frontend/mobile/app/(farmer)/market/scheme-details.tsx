import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function SchemeDetailsScreen() {
  const { schemeId } = useLocalSearchParams<{ schemeId: string }>();
  const { governmentSchemes } = useMarket();

  const scheme = governmentSchemes.find((s) => s.id === schemeId);

  useEffect(() => {
    if (!scheme) {
      Alert.alert('Error', 'Scheme not found', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [scheme]);

  const handleApply = async () => {
    if (!scheme?.applicationUrl) {
      Alert.alert('Information', 'Application link not available');
      return;
    }

    const canOpen = await Linking.canOpenURL(scheme.applicationUrl);
    if (canOpen) {
      Linking.openURL(scheme.applicationUrl);
    } else {
      Alert.alert('Error', 'Cannot open application link');
    }
  };

  const handleShare = async () => {
    if (!scheme) return;

    try {
      await Share.share({
        message: `${scheme.name}\n\n${scheme.description}\n\nBenefits: ₹${scheme.benefitAmount.toLocaleString(
          'en-IN'
        )}\n\nApply: ${scheme.applicationUrl || 'Contact local office'}`,
        title: scheme.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For more information, please contact your local agriculture office or visit the nearest Krishi Vigyan Kendra (KVK).',
      [{ text: 'OK' }]
    );
  };

  if (!scheme) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Scheme Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const categoryConfig = {
    subsidy: { icon: '💰', color: '#4CAF50' },
    loan: { icon: '🏦', color: '#2196F3' },
    insurance: { icon: '🛡️', color: '#FF9800' },
    training: { icon: '📚', color: '#9C27B0' },
    equipment: { icon: '🚜', color: '#F44336' },
  };

  const config = categoryConfig[scheme.category as keyof typeof categoryConfig] || {
    icon: '📋',
    color: '#607D8B',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Scheme Details</Text>
        <Pressable onPress={handleShare}>
          <Text style={styles.shareButton}>📤</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Scheme Header */}
          <View style={styles.schemeHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: `${config.color}20` }]}>
              <Text style={styles.categoryIcon}>{config.icon}</Text>
              <Text style={[styles.categoryText, { color: config.color }]}>
                {scheme.category.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.schemeName}>{scheme.name}</Text>
            <Text style={styles.schemeNameHindi}>{scheme.nameHindi}</Text>

            {!scheme.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>⚠️ Currently Inactive</Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Benefit Amount</Text>
              <Text style={styles.statValue}>
                ₹{scheme.benefitAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            {scheme.maxBenefit && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Maximum Benefit</Text>
                  <Text style={styles.statValue}>
                    ₹{scheme.maxBenefit.toLocaleString('en-IN')}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Description</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{scheme.description}</Text>
            </View>
          </View>

          {/* Eligibility Criteria */}
          {scheme.eligibility && scheme.eligibility.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✓ Eligibility Criteria</Text>
              <View style={styles.listCard}>
                {scheme.eligibility.map((criteria, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listText}>{criteria}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Required Documents */}
          {scheme.documents && scheme.documents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📄 Required Documents</Text>
              <View style={styles.listCard}>
                {scheme.documents.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <Text style={styles.documentIcon}>📎</Text>
                    <Text style={styles.documentText}>{doc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Application Process */}
          {scheme.applicationProcess && scheme.applicationProcess.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Application Process</Text>
              <View style={styles.processCard}>
                {scheme.applicationProcess.map((step, index) => (
                  <View key={index} style={styles.processStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Important Dates */}
          {(scheme.startDate || scheme.endDate || scheme.lastDate) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Important Dates</Text>
              <View style={styles.datesCard}>
                {scheme.startDate && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Start Date:</Text>
                    <Text style={styles.dateValue}>
                      {new Date(scheme.startDate).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                )}
                {scheme.endDate && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>End Date:</Text>
                    <Text style={styles.dateValue}>
                      {new Date(scheme.endDate).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                )}
                {scheme.lastDate && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Last Date to Apply:</Text>
                    <Text style={[styles.dateValue, styles.importantDate]}>
                      {new Date(scheme.lastDate).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 Need Help?</Text>
            <View style={styles.helpCard}>
              <Text style={styles.helpIcon}>💡</Text>
              <Text style={styles.helpText}>
                For queries and assistance, contact your local agriculture office or visit the
                nearest Krishi Vigyan Kendra (KVK).
              </Text>
              <Pressable style={styles.contactButton} onPress={handleContactSupport}>
                <Text style={styles.contactButtonText}>Get Contact Info</Text>
              </Pressable>
            </View>
          </View>

          {/* Apply Button */}
          {scheme.isActive && (
            <Pressable
              style={[styles.applyButton, { backgroundColor: config.color }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                {scheme.applicationUrl ? 'Apply Online' : 'Contact Local Office'}
              </Text>
            </Pressable>
          )}

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteIcon}>ℹ️</Text>
            <Text style={styles.infoNoteText}>
              Please verify the details and eligibility criteria with your local authorities
              before applying.
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
  shareButton: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  schemeHeader: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  schemeName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  schemeNameHindi: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  inactiveBadge: {
    backgroundColor: `${colors.error}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  inactiveBadgeText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
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
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listBullet: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  listText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  documentIcon: {
    fontSize: 18,
  },
  documentText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  processCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  processStep: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  stepText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
    paddingTop: 4,
  },
  datesCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  dateLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  dateValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  importantDate: {
    color: colors.error,
  },
  helpCard: {
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  helpText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  contactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  contactButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
  },
  applyButton: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  applyButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
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