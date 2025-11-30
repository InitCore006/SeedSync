import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSchemes } from '@/hooks/useSchemes';
import { Scheme } from '@/types/scheme.types';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function SchemeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { schemes, applications, applyForScheme } = useSchemes();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const found = (schemes || []).find((s) => s?.id === id);
    setScheme(found || null);
  }, [id, schemes]);

  const safeApplications = Array.isArray(applications) ? applications : [];
  const application = safeApplications.find((a) => a?.schemeId === id);

  const handleApply = async () => {
    if (!scheme || !applyForScheme) return;

    Alert.alert(
      'Apply for Scheme',
      `Apply for ${scheme.name}?\n\nYou will be redirected to complete your application.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              setIsApplying(true);
              await applyForScheme(id);
              Alert.alert(
                'Application Submitted',
                'Your application has been submitted successfully. Track your application status in My Applications.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to submit application. Please try again.');
            } finally {
              setIsApplying(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenWebsite = () => {
    if (scheme?.officialWebsite) {
      Linking.openURL(scheme.officialWebsite).catch(() => {
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  if (!scheme) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Loading scheme details...</Text>
      </View>
    );
  }

  const safeBenefits = Array.isArray(scheme.benefits) ? scheme.benefits : [];
  const safeEligibility = Array.isArray(scheme.eligibility) ? scheme.eligibility : [];
  const safeDocuments = Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Scheme Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Scheme Header */}
        <View style={styles.schemeHeader}>
          {scheme.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {scheme.category.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.schemeName}>{scheme.name || 'Unnamed Scheme'}</Text>
          {scheme.department && (
            <Text style={styles.department}>
              Ministry: {scheme.department}
            </Text>
          )}
        </View>

        {/* Application Status */}
        {application && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Your Application</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      application.status === 'approved'
                        ? `${colors.success}20`
                        : application.status === 'rejected'
                        ? `${colors.error}20`
                        : `${colors.warning}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        application.status === 'approved'
                          ? colors.success
                          : application.status === 'rejected'
                          ? colors.error
                          : colors.warning,
                    },
                  ]}
                >
                  {(application.status || '').replace('-', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            {application.appliedDate && (
              <Text style={styles.applicationDate}>
                Applied on: {new Date(application.appliedDate).toLocaleDateString()}
              </Text>
            )}
            {application.remarks && (
              <Text style={styles.remarks}>
                Remarks: {application.remarks}
              </Text>
            )}
          </View>
        )}

        {/* Description */}
        {scheme.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{scheme.description}</Text>
          </View>
        )}

        {/* Benefits */}
        {safeBenefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsList}>
              {safeBenefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitBullet}>✓</Text>
                  <Text style={styles.benefitText}>{benefit || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Eligibility */}
        {safeEligibility.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
            <View style={styles.eligibilityList}>
              {safeEligibility.map((criterion, index) => (
                <View key={index} style={styles.eligibilityItem}>
                  <Text style={styles.eligibilityNumber}>{index + 1}.</Text>
                  <Text style={styles.eligibilityText}>{criterion || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Required Documents */}
        {safeDocuments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <View style={styles.documentsList}>
              {safeDocuments.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Text style={styles.documentIcon}>📄</Text>
                  <Text style={styles.documentText}>{doc || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Important Dates */}
        {(scheme.startDate || scheme.endDate) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Dates</Text>
            <View style={styles.datesCard}>
              {scheme.startDate && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>📅 Start Date</Text>
                  <Text style={styles.dateValue}>
                    {new Date(scheme.startDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {scheme.endDate && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>⏰ End Date</Text>
                  <Text style={styles.dateValue}>
                    {new Date(scheme.endDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Official Website */}
        {scheme.officialWebsite && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Official Website</Text>
            <Pressable
              style={({ pressed }) => [
                styles.websiteButton,
                pressed && styles.websiteButtonPressed,
              ]}
              onPress={handleOpenWebsite}
            >
              <Text style={styles.websiteIcon}>🌐</Text>
              <Text style={styles.websiteText}>Visit Official Website</Text>
              <Text style={styles.websiteArrow}>→</Text>
            </Pressable>
          </View>
        )}

        {/* Contact Information */}
        {scheme.contactNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Helpline</Text>
                <Text style={styles.contactValue}>{scheme.contactNumber}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {!application && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              isApplying && styles.applyButtonDisabled,
              pressed && !isApplying && styles.applyButtonPressed,
            ]}
            onPress={handleApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <LoadingSpinner color={colors.surface} />
            ) : (
              <Text style={styles.applyButtonText}>Apply Now</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  schemeHeader: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  schemeName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  department: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  applicationDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  remarks: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.success}10`,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  benefitBullet: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  benefitText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  eligibilityList: {
    gap: spacing.sm,
  },
  eligibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  eligibilityNumber: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    minWidth: 24,
  },
  eligibilityText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  documentsList: {
    gap: spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  documentIcon: {
    fontSize: 20,
  },
  documentText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
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
    alignItems: 'center',
  },
  dateLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  dateValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  websiteButtonPressed: {
    opacity: 0.7,
  },
  websiteIcon: {
    fontSize: 24,
  },
  websiteText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  websiteArrow: {
    ...typography.h4,
    color: colors.primary,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  contactIcon: {
    fontSize: 24,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  contactValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.border,
  },
  applyButtonPressed: {
    opacity: 0.7,
  },
  applyButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});