import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';
import { colors, withOpacity } from '@/lib/constants/colors';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { typography } from '@/lib/constants/typography';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.32;

interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  badge?: string;
}

interface StatItem {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isLoading, logout } = useAuthStore();
  const { farmer, dashboard } = useFarmerStore();
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Get user initials
  const userInitials = useMemo(() => {
    if (!user?.full_name) return 'F';
    const names = user.full_name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.full_name.charAt(0).toUpperCase();
  }, [user?.full_name]);

  // Get formatted phone number
  const formattedPhone = useMemo(() => {
    if (!user?.phone_number) return '';
    const phone = user.phone_number.replace(/\D/g, '');
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return user.phone_number;
  }, [user?.phone_number]);

  // Get location display
  const locationDisplay = useMemo(() => {
    if (!profile) return null;
    const parts = [];
    if (profile.profile.village) parts.push(profile.profile.village);
    if (profile.profile.district) parts.push(profile.profile.district);
    if (profile.profile.state) parts.push(profile.profile.state);
    return parts.join(', ');
  }, [profile]);

  // Calculate profile completeness
  const profileCompleteness = useMemo(() => {
    if (!profile) return 0;
    
    const fields = [
      user?.full_name,
      user?.email,
      profile.profile.date_of_birth,
      profile.profile.gender,
      profile.profile.profile_picture,
      profile.profile.address_line1,
      profile.profile.village,
      profile.profile.district,
      profile.profile.state,
      profile.profile.pincode,
      profile.profile.bank_name,
      profile.profile.account_number,
      profile.profile.ifsc_code,
    ];
    
    const filledFields = fields.filter(field => field && field !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }, [user, profile]);

  // Get farm statistics
  const farmStats = useMemo((): StatItem[] => {
    if (!farmer || !dashboard) {
      return [
        {
          label: 'Total Land',
          value: '0 Ac',
          icon: 'leaf-outline',
          color: colors.success,
        },
        {
          label: 'Farm Plots',
          value: '0',
          icon: 'grid-outline',
          color: colors.primary,
        },
        {
          label: 'Active Crops',
          value: '0',
          icon: 'flower-outline',
          color: colors.secondary,
        },
        {
          label: 'Total Harvest',
          value: '0 Qtl',
          icon: 'scale-outline',
          color: colors.accent,
        },
      ];
    }

    return [
      {
        label: 'Total Land',
        value: `${farmer.total_land_area.toFixed(1)} Ac`,
        icon: 'leaf-outline',
        color: colors.success,
      },
      {
        label: 'Farm Plots',
        value: dashboard.statistics?.total_plots?.toString() || '0',
        icon: 'grid-outline',
        color: colors.primary,
      },
      {
        label: 'Active Crops',
        value: dashboard.statistics?.active_crops?.toString() || '0',
        icon: 'flower-outline',
        color: colors.secondary,
      },
      {
        label: 'Total Harvest',
        value: dashboard.statistics?.total_harvest 
          ? `${dashboard.statistics.total_harvest} Qtl`
          : '0 Qtl',
        icon: 'scale-outline',
        color: colors.accent,
      },
    ];
  }, [farmer, dashboard]);

  const menuSections: { title: string; items: ProfileMenuItem[] }[] = [
    {
      title: 'Account Management',
      items: [
        {
          id: 'edit',
          title: 'Edit Profile',
          subtitle: 'Update personal information',
          icon: 'person-outline',
          route: '/(farmer)/profile/edit-profile',
          color: colors.primary,
        },
        {
          id: 'bank',
          title: 'Bank Details',
          subtitle: 'Manage payment accounts',
          icon: 'card-outline',
          route: '/(farmer)/profile/bank-details',
          color: colors.success,
        },
        {
          id: 'documents',
          title: 'Documents & KYC',
          subtitle: profile?.is_kyc_verified ? 'Verified' : 'Pending verification',
          icon: 'document-text-outline',
          route: '/(farmer)/profile/documents',
          color: colors.info,
          badge: !profile?.is_kyc_verified ? '!' : undefined,
        },
      ],
    },
    {
      title: 'Farm Management',
      items: [
        {
          id: 'analytics',
          title: 'Farm Analytics',
          subtitle: 'View detailed insights',
          icon: 'stats-chart-outline',
          route: '/(farmer)/crops/farm-analytics',
          color: colors.accent,
        },
        {
          id: 'schemes',
          title: 'Government Schemes',
          subtitle: 'Explore benefits & subsidies',
          icon: 'gift-outline',
          route: '/(farmer)/schemes',
          color: colors.warning,
        },
      ],
    },
    {
      title: 'Settings & Support',
      items: [
        {
          id: 'settings',
          title: 'App Settings',
          subtitle: 'Preferences & notifications',
          icon: 'settings-outline',
          route: '/(farmer)/profile/settings',
          color: colors.gray[600],
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'Change app language',
          icon: 'language-outline',
          route: '/(farmer)/profile/language',
          color: colors.info,
        },
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: '24/7 assistance available',
          icon: 'help-circle-outline',
          route: '/(farmer)/profile/help',
          color: colors.info,
        },
        {
          id: 'about',
          title: 'About SeedSync',
          subtitle: 'Version & information',
          icon: 'information-circle-outline',
          route: '/(farmer)/profile/about',
          color: colors.gray[600],
        },
      ],
    },
  ];

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to update profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        // TODO: Upload image to server
        // await profileService.uploadProfileImage(result.assets[0].uri);
        console.log('Selected image:', result.assets[0].uri);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.retryText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profile?.profile.profile_picture && !imageError ? (
              <Image
                source={{ uri: profile.profile.profile_picture }}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={[colors.secondary, colors.accent]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{userInitials}</Text>
              </LinearGradient>
            )}
            
            {/* Upload Button */}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleImagePick}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userPhone}>{formattedPhone}</Text>
          {locationDisplay && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color={withOpacity(colors.white, 0.9)} />
              <Text style={styles.userLocation}>{locationDisplay}</Text>
            </View>
          )}

          {/* Verification Badges */}
          <View style={styles.badgeContainer}>
            <View style={[
              styles.badge,
              user.is_phone_verified ? styles.badgeSuccess : styles.badgeWarning
            ]}>
              <Ionicons
                name={user.is_phone_verified ? 'checkmark-circle' : 'time'}
                size={14}
                color={user.is_phone_verified ? colors.success : colors.warning}
              />
              <Text style={[
                styles.badgeText,
                { color: user.is_phone_verified ? colors.success : colors.warning }
              ]}>
                {user.is_phone_verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View style={[
              styles.badge,
              user.is_kyc_verified ? styles.badgeSuccess : styles.badgeWarning
            ]}>
              <Ionicons
                name={user.is_kyc_verified ? 'shield-checkmark' : 'shield-outline'}
                size={14}
                color={user.is_kyc_verified ? colors.success : colors.warning}
              />
              <Text style={[
                styles.badgeText,
                { color: user.is_kyc_verified ? colors.success : colors.warning }
              ]}>
                KYC {user.is_kyc_verified ? 'Done' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Completeness Card */}
        {profileCompleteness < 100 && (
          <View style={styles.completenessCard}>
            <View style={styles.completenessHeader}>
              <View>
                <Text style={styles.completenessTitle}>Complete Your Profile</Text>
                <Text style={styles.completenessSubtitle}>
                  {100 - profileCompleteness}% remaining
                </Text>
              </View>
              <View style={styles.completenessCircle}>
                <Text style={styles.completenessPercent}>{profileCompleteness}%</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={[styles.progressFill, { width: `${profileCompleteness}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => router.push('/(farmer)/profile/edit-profile' as any)}
            >
              <Text style={styles.completeButtonText}>Complete Now</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

      
        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index !== section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.menuIconContainer,
                    { backgroundColor: withOpacity(item.color, 0.1) }
                  ]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.badge && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>SeedSync v1.0.0</Text>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
  header: {
    height: HEADER_HEIGHT,
    paddingTop: (StatusBar.currentHeight || 44) + spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
    ...shadows.lg,
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + spacing.sm,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(colors.white, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.gray[200],
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '700',
    fontSize: 32,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  userName: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  userPhone: {
    ...typography.body,
    color: withOpacity(colors.white, 0.9),
    fontSize: 14,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  userLocation: {
    ...typography.caption,
    color: withOpacity(colors.white, 0.85),
    fontSize: 12,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeSuccess: {
    backgroundColor: withOpacity(colors.white, 0.25),
  },
  badgeWarning: {
    backgroundColor: withOpacity(colors.warning, 0.25),
  },
  badgeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  completenessCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
    ...shadows.sm,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  completenessTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  completenessSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  completenessCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: withOpacity(colors.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  completenessPercent: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  completeButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  menuSectionTitle: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  menuBadge: {
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  logoutText: {
    ...typography.button,
    color: colors.white,
    fontSize: 15,
  },
  versionText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});