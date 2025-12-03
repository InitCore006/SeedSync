import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { colors, withOpacity } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing, borderRadius, shadows } from '@/lib/constants/spacing';
import { useAuthStore } from '@/store/authStore';
import { useFarmerStore } from '@/store/farmerStore';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.85, 380);
const SWIPE_THRESHOLD = SIDEBAR_WIDTH * 0.3;
const SWIPE_VELOCITY_THRESHOLD = 500;

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
  color?: string;
  description?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const { farmer, dashboard } = useFarmerStore();
  
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isGestureActive, setIsGestureActive] = React.useState(false);

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
    if (!user?.phone_number) return '+91 XXXXXXXXXX';
    const phone = user.phone_number.replace(/\D/g, '');
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return user.phone_number;
  }, [user?.phone_number]);

  // Get farm statistics
  const farmStats = useMemo(() => {
    if (farmer) {
      return {
        totalArea: farmer.total_land_area || 0,
        irrigatedLand: farmer.irrigated_land || 0,
        rainFedLand: farmer.rain_fed_land || 0,
        farmerCategory: farmer.farmer_category || 'marginal',
        activePlots: dashboard?.statistics?.total_plots || 0,
        activeCrops: dashboard?.statistics?.active_crops || 0,
      };
    }
    return null;
  }, [farmer, dashboard]);

  // Open/Close animations
  const openSidebar = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeSidebar = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isGestureActive) {
        onClose();
      }
    });
  }, [isGestureActive, onClose]);

  React.useEffect(() => {
    if (visible) {
      openSidebar();
    } else {
      closeSidebar();
    }
  }, [visible, openSidebar, closeSidebar]);

  // Pan gesture for sidebar
  const panGesture = Gesture.Pan()
    .onStart(() => {
      setIsGestureActive(true);
    })
    .onUpdate((event) => {
      const newTranslateX = Math.min(0, Math.max(-SIDEBAR_WIDTH, event.translationX));
      translateX.setValue(newTranslateX);
      
      const progress = 1 - Math.abs(newTranslateX) / SIDEBAR_WIDTH;
      fadeAnim.setValue(progress);
    })
    .onEnd((event) => {
      setIsGestureActive(false);
      
      const shouldClose =
        event.translationX < -SWIPE_THRESHOLD ||
        event.velocityX < -SWIPE_VELOCITY_THRESHOLD;

      if (shouldClose) {
        closeSidebar();
      } else {
        openSidebar();
      }
    })
    .runOnJS(true);

  // Backdrop tap gesture
  const backdropTapGesture = Gesture.Tap()
    .onEnd(() => {
      closeSidebar();
    })
    .runOnJS(true);

  const menuSections: MenuSection[] = [
    {
      title: 'Dashboard',
      icon: 'speedometer-outline',
      items: [
        {
          id: 'dashboard',
          title: 'Home',
          icon: 'home-outline',
          route: '/(farmer)/dashboard',
          color: colors.primary,
          description: 'Overview & stats',
        },
        {
          id: 'weather',
          title: 'Weather',
          icon: 'partly-sunny-outline',
          route: '/(farmer)/weather',
          color: colors.info,
          description: 'Forecast & alerts',
        },
        {
          id: 'advisory',
          title: 'Advisory',
          icon: 'bulb-outline',
          route: '/(farmer)/advisory',
          color: colors.warning,
          description: 'AI recommendations',
        },
      ],
    },
    {
      title: 'Financials',
      icon: 'wallet-outline',
      items: [
        {
          id: 'wallet',
          title: 'Wallet',
          icon: 'wallet-outline',
          route: '/(farmer)/wallet',
          color: colors.success,
          description: 'Balance & transactions',
        },
        {
          id: 'bank',
          title: 'Bank Details',
          icon: 'card-outline',
          route: '/(farmer)/profile/bank-details',
          color: colors.accent,
          description: 'Manage accounts',
        },
      ],
    },
    {
      title: 'Marketplace',
      icon: 'storefront-outline',
      items: [
        {
          id: 'market',
          title: 'Market Prices',
          icon: 'trending-up-outline',
          route: '/(farmer)/market',
          color: colors.info,
          description: 'Live rates',
        },
        {
          id: 'trade',
          title: 'My Listings',
          icon: 'pricetag-outline',
          route: '/(farmer)/market/trade/my-listings',
          color: colors.primary,
          description: 'Active & sold',
        },
        {
          id: 'msp',
          title: 'MSP Rates',
          icon: 'cash-outline',
          route: '/(farmer)/market/msp',
          color: colors.success,
          description: 'Govt. pricing',
        },
      ],
    },
    {
      title: 'Services',
      icon: 'construct-outline',
      items: [
        {
          id: 'transport',
          title: 'Transport',
          icon: 'car-outline',
          route: '/(farmer)/transport',
          description: 'Book vehicles',
        },
        {
          id: 'fpo',
          title: 'FPO Network',
          icon: 'people-outline',
          route: '/(farmer)/fpo',
          description: 'Connect & collaborate',
        },
        {
          id: 'schemes',
          title: 'Govt Schemes',
          icon: 'document-text-outline',
          route: '/(farmer)/schemes',
          description: 'Benefits & subsidies',
        },
        {
          id: 'learning',
          title: 'Learning Hub',
          icon: 'school-outline',
          route: '/(farmer)/learning',
          description: 'Videos & articles',
        },
      ],
    },
    {
      title: 'Account',
      icon: 'person-outline',
      items: [
        {
          id: 'profile',
          title: 'My Profile',
          icon: 'person-outline',
          route: '/(farmer)/profile/profile',
          description: 'Personal info',
        },
        {
          id: 'documents',
          title: 'Documents',
          icon: 'folder-outline',
          route: '/(farmer)/profile/documents',
          description: 'Certificates & IDs',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications-outline',
          route: '/(farmer)/notifications',
          badge: 3,
          description: 'Alerts & updates',
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: 'settings-outline',
          route: '/(farmer)/profile/settings',
          description: 'Preferences',
        },
      ],
    },
  ];

  const handleMenuPress = (route: string) => {
    closeSidebar();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = async () => {
    closeSidebar();
    setTimeout(async () => {
      await logout();
      router.replace('/(auth)/login');
    }, 300);
  };

  if (!visible) return null;

  // Show loading state if user is not loaded
  if (!isAuthenticated || !user) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
        statusBarTranslucent
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSidebar}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop with Blur and Tap to Close */}
        <GestureDetector gesture={backdropTapGesture}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
            ) : (
              <View style={styles.androidBackdrop} />
            )}
          </Animated.View>
        </GestureDetector>

        {/* Sidebar Content with Swipe Gesture */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sidebar,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {/* Swipe Indicator */}
            <View style={styles.swipeIndicator}>
              <View style={styles.swipeHandle} />
            </View>

            {/* Header with Gradient */}
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.header,
                { paddingTop: insets.top + spacing.md },
              ]}
            >
              {/* Profile Section */}
             <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {profile?.profile.profile_picture ? (
                  // Display actual profile picture if available
                  <Image
                    source={{ uri: profile.profile.profile_picture }}
                    style={styles.avatarImage}
                    defaultSource={require('@/assets/images/default-avatar.png')}
                  />
                ) : (
                  // Display gradient with initials as fallback
                  <LinearGradient
                    colors={[colors.secondary, colors.accent]}
                    style={styles.avatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.avatarText}>{userInitials}</Text>
                  </LinearGradient>
                )}
                {user.is_active && <View style={styles.onlineIndicator} />}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.name} numberOfLines={1}>
                  {user.full_name || 'User Name'}
                </Text>
                <Text style={styles.phone} numberOfLines={1}>
                  {formattedPhone}
                </Text>
                {profile?.profile.village && profile?.profile.district && (
                  <Text style={styles.location} numberOfLines={1}>
                    <Ionicons name="location-outline" size={12} />
                    {' '}{profile.profile.village}, {profile.profile.district}
                  </Text>
                )}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.editProfileButton,
                  pressed && styles.editProfileButtonPressed,
                ]}
                onPress={() => handleMenuPress('/(farmer)/profile/profile')}
              >
                <Ionicons name="create-outline" size={18} color={colors.white} />
              </Pressable>
            </View>

              {/* Verification Status */}
              <View style={styles.verificationContainer}>
                <View style={styles.verificationBadge}>
                  <Ionicons
                    name={user.is_phone_verified ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={user.is_phone_verified ? colors.success : colors.error}
                  />
                  <Text style={[
                    styles.verificationText,
                    { color: user.is_phone_verified ? colors.success : colors.error }
                  ]}>
                    Phone
                  </Text>
                </View>
                <View style={styles.verificationBadge}>
                  <Ionicons
                    name={user.is_kyc_verified ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={user.is_kyc_verified ? colors.success : colors.warning}
                  />
                  <Text style={[
                    styles.verificationText,
                    { color: user.is_kyc_verified ? colors.success : colors.warning }
                  ]}>
                    KYC
                  </Text>
                </View>
              </View>

              {/* Farm Stats - Only show for farmers */}
              {user.role === 'farmer' && farmStats && (
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Ionicons name="leaf-outline" size={20} color={colors.white} />
                    <Text style={styles.statLabel}>Total Area</Text>
                    <Text style={styles.statValue}>
                      {farmStats.totalArea.toFixed(1)} acres
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="grid-outline" size={20} color={colors.white} />
                    <Text style={styles.statLabel}>Active Plots</Text>
                    <Text style={styles.statValue}>{farmStats.activePlots}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="flower-outline" size={20} color={colors.white} />
                    <Text style={styles.statLabel}>Active Crops</Text>
                    <Text style={styles.statValue}>{farmStats.activeCrops}</Text>
                  </View>
                </View>
              )}

              {/* Farmer Category Badge */}
              {user.role === 'farmer' && farmer?.farmer_category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {farmer.farmer_category.replace('_', ' ').toUpperCase()} FARMER
                  </Text>
                </View>
              )}
            </LinearGradient>

            {/* Menu Sections */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + spacing.xl + 60 },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {menuSections.map((section) => (
                <View key={section.title} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    {section.icon && (
                      <Ionicons
                        name={section.icon}
                        size={16}
                        color={colors.text.secondary}
                        style={styles.sectionIcon}
                      />
                    )}
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>

                  <View style={styles.menuItemsContainer}>
                    {section.items.map((item, index) => (
                      <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                          styles.menuItem,
                          pressed && styles.menuItemPressed,
                          index === section.items.length - 1 && styles.menuItemLast,
                        ]}
                        onPress={() => handleMenuPress(item.route)}
                      >
                        <View style={styles.menuItemLeft}>
                          <View
                            style={[
                              styles.iconContainer,
                              item.color && {
                                backgroundColor: withOpacity(item.color, 0.12),
                              },
                            ]}
                          >
                            <Ionicons
                              name={item.icon}
                              size={22}
                              color={item.color || colors.text.primary}
                            />
                          </View>
                          <View style={styles.menuTextContainer}>
                            <Text style={styles.menuItemText} numberOfLines={1}>
                              {item.title}
                            </Text>
                            {item.description && (
                              <Text style={styles.menuItemDescription} numberOfLines={1}>
                                {item.description}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View style={styles.menuItemRight}>
                          {item.badge && item.badge > 0 && (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>
                                {item.badge > 99 ? '99+' : item.badge}
                              </Text>
                            </View>
                          )}
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.gray[400]}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}

              {/* Support Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="help-circle-outline"
                    size={16}
                    color={colors.text.secondary}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>Support</Text>
                </View>

                <View style={styles.menuItemsContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleMenuPress('/(farmer)/profile/help')}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={22}
                          color={colors.info}
                        />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuItemText}>Help & Support</Text>
                        <Text style={styles.menuItemDescription}>24/7 assistance</Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.gray[400]}
                    />
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.menuItem,
                      styles.menuItemLast,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleMenuPress('/(farmer)/profile/about')}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="information-circle-outline"
                          size={22}
                          color={colors.accent}
                        />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuItemText}>About SeedSync</Text>
                        <Text style={styles.menuItemDescription}>v1.0.0</Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.gray[400]}
                    />
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={[
                styles.footer,
                { paddingBottom: insets.bottom + spacing.md },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed,
                ]}
                onPress={handleLogout}
              >
                <LinearGradient
                  colors={[withOpacity(colors.error, 0.1), withOpacity(colors.error, 0.05)]}
                  style={styles.logoutGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="log-out-outline" size={22} color={colors.error} />
                  <Text style={styles.logoutText}>Logout</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.md,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.white,
    ...shadows.xl,
    overflow: 'hidden',
  },
  swipeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -30 }],
    width: 6,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  swipeHandle: {
    width: 3,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.3),
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
   avatarImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
    backgroundColor: colors.gray[200], // Fallback background while loading
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  phone: {
    ...typography.body,
    color: withOpacity(colors.white, 0.85),
    fontSize: 13,
    marginBottom: 2,
  },
  location: {
    ...typography.caption,
    color: withOpacity(colors.white, 0.75),
    fontSize: 12,
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.white, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButtonPressed: {
    backgroundColor: withOpacity(colors.white, 0.3),
    transform: [{ scale: 0.95 }],
  },
  verificationContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withOpacity(colors.white, 0.85),
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  verificationText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: withOpacity(colors.white, 0.15),
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: withOpacity(colors.white, 0.8),
    fontSize: 10,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  statValue: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: withOpacity(colors.white, 0.2),
    marginHorizontal: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: withOpacity(colors.white, 0.2),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  menuItemsContainer: {
    marginTop: spacing.xs,
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: colors.gray[50],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  menuItemText: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
  },
  logoutButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.2),
    borderRadius: borderRadius.lg,
  },
  logoutButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});