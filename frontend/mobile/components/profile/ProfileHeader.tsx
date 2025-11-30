import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { UserProfile } from '@/types/profile.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface ProfileHeaderProps {
  profile: UserProfile;
  completeness: number;
  onEditPress: () => void;
}

export default function ProfileHeader({ profile, completeness, onEditPress }: ProfileHeaderProps) {
  const getKYCStatusColor = () => {
    switch (profile.kycStatus) {
      case 'verified':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getKYCStatusText = () => {
    switch (profile.kycStatus) {
      case 'verified':
        return '✓ KYC Verified';
      case 'rejected':
        return '✕ KYC Rejected';
      default:
        return '⏳ KYC Pending';
    }
  };

  return (
    <View style={styles.container}>
      {/* Cover Background */}
      <View style={styles.coverBackground}>
        <View style={styles.coverPattern} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {profile.firstName.charAt(0).toUpperCase()}
                {profile.lastName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Pressable style={styles.editImageButton} onPress={onEditPress}>
            <Text style={styles.editImageIcon}>📷</Text>
          </Pressable>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.userPhone}>+91 {profile.phoneNumber}</Text>
          {profile.email && <Text style={styles.userEmail}>{profile.email}</Text>}

          {/* Location */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>
              {profile.village}, {profile.district}, {profile.state}
            </Text>
          </View>

          {/* Edit Button */}
          <Pressable style={styles.editButton} onPress={onEditPress}>
            <Text style={styles.editButtonIcon}>✏️</Text>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Profile Completeness */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Profile</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${completeness}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(completeness)}%</Text>
            </View>
          </View>

          {/* KYC Status */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>KYC Status</Text>
            <View style={[styles.kycBadge, { backgroundColor: `${getKYCStatusColor()}20` }]}>
              <Text style={[styles.kycBadgeText, { color: getKYCStatusColor() }]}>
                {getKYCStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Farm Info */}
        {profile.farmSize && (
          <View style={styles.farmInfoCard}>
            <Text style={styles.farmInfoIcon}>🌾</Text>
            <View style={styles.farmInfoContent}>
              <Text style={styles.farmInfoTitle}>Farm Details</Text>
              <Text style={styles.farmInfoText}>
                {profile.farmSize} {profile.farmSizeUnit === 'acre' ? 'Acres' : 'Hectares'}
                {profile.soilType && ` • ${profile.soilType} soil`}
                {profile.irrigationType && ` • ${profile.irrigationType} irrigation`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  coverBackground: {
    height: 120,
    backgroundColor: colors.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  coverPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${colors.accent}30`,
    opacity: 0.3,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginTop: -60,
    marginBottom: spacing.md,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
  },
  profileImagePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.surface,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  editImageIcon: {
    fontSize: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  userPhone: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userEmail: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: spacing.xs,
  },
  editButtonIcon: {
    fontSize: 14,
  },
  editButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  kycBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kycBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  farmInfoCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  farmInfoIcon: {
    fontSize: 32,
  },
  farmInfoContent: {
    flex: 1,
  },
  farmInfoTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  farmInfoText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});