import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFPO } from '@/hooks/useFPO';
import { FPO } from '@/types/fpo.types';
import MembershipCard from '@/components/fpo/MembershipCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function FPODetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fpos, memberships, applyForMembership } = useFPO();
  const [fpo, setFPO] = useState<FPO | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const found = fpos.find((f) => f.id === id);
    setFPO(found || null);
  }, [id, fpos]);

  const membership = memberships.find((m) => m.fpoId === id);

  const handleApply = async () => {
    Alert.alert(
      'Apply for Membership',
      `Apply to join ${fpo?.name}?\n\nMembership Fee: ₹${fpo?.membershipFee}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              setIsApplying(true);
              await applyForMembership(id);
              Alert.alert(
                'Application Submitted',
                'Your membership application has been submitted successfully. You will be notified once approved.'
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

  const handleCall = () => {
    if (fpo?.phoneNumber) {
      Linking.openURL(`tel:${fpo.phoneNumber}`);
    }
  };

  const handleEmail = () => {
    if (fpo?.email) {
      Linking.openURL(`mailto:${fpo.email}`);
    }
  };

  const handleWebsite = () => {
    if (fpo?.website) {
      Linking.openURL(fpo.website);
    }
  };

  if (!fpo) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>FPO Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* FPO Header */}
        <View style={styles.fpoHeader}>
          <Text style={styles.fpoIcon}>🏛️</Text>
          <View style={styles.fpoHeaderContent}>
            <Text style={styles.fpoName}>{fpo.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {fpo.type.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Membership Status */}
        {membership && (
          <MembershipCard membership={membership} fpoName={fpo.name} />
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{fpo.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationContent}>
              <Text style={styles.locationText}>{fpo.location}</Text>
              <Text style={styles.locationSubtext}>
                {fpo.district}, {fpo.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{fpo.memberCount}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{fpo.established}</Text>
              <Text style={styles.statLabel}>Established</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statValue}>₹{fpo.membershipFee}</Text>
              <Text style={styles.statLabel}>Membership Fee</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesList}>
            {fpo.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceBullet}>✓</Text>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <Pressable style={styles.contactRow} onPress={handleCall}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{fpo.phoneNumber}</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </Pressable>

            <Pressable style={styles.contactRow} onPress={handleEmail}>
              <Text style={styles.contactIcon}>✉️</Text>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{fpo.email}</Text>
              </View>
              <Text style={styles.contactArrow}>→</Text>
            </Pressable>

            {fpo.website && (
              <Pressable style={styles.contactRow} onPress={handleWebsite}>
                <Text style={styles.contactIcon}>🌐</Text>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={styles.contactValue}>{fpo.website}</Text>
                </View>
                <Text style={styles.contactArrow}>→</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      {!membership && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.applyButton,
              isApplying && styles.applyButtonDisabled,
              pressed && styles.applyButtonPressed,
            ]}
            onPress={handleApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <LoadingSpinner color={colors.surface} />
            ) : (
              <Text style={styles.applyButtonText}>
                Apply for Membership (₹{fpo.membershipFee})
              </Text>
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
  fpoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  fpoIcon: {
    fontSize: 64,
  },
  fpoHeaderContent: {
    flex: 1,
  },
  fpoName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
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
  locationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationContent: {
    flex: 1,
  },
  locationText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
    textAlign: 'center',
  },
  servicesList: {
    gap: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  serviceBullet: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  serviceText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  contactArrow: {
    ...typography.h4,
    color: colors.text.secondary,
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