import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { useFarmerStore } from '@/store/farmerStore';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.80; // 80% of screen width

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
  color?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { farmer, farmDetails } = useFarmerStore();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Opening animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Closing animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const menuSections: MenuSection[] = [
    {
      title: 'Quick Access',
      items: [
        {
          id: 'weather',
          title: 'Weather',
          icon: 'cloud-outline',
          route: '/(farmer)/weather',
          color: colors.info,
        },
        {
          id: 'advisory',
          title: 'Advisory',
          icon: 'bulb-outline',
          route: '/(farmer)/advisory',
          color: colors.warning,
        },
        {
          id: 'wallet',
          title: 'Wallet',
          icon: 'wallet-outline',
          route: '/(farmer)/wallet',
          color: colors.success,
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications-outline',
          route: '/(farmer)/notifications',
          badge: 3,
        },
      ],
    },
    {
      title: 'Services',
      items: [
        {
          id: 'transport',
          title: 'Transport',
          icon: 'car-outline',
          route: '/(farmer)/transport',
        },
        {
          id: 'fpo',
          title: 'FPO Network',
          icon: 'people-outline',
          route: '/(farmer)/fpo',
        },
        {
          id: 'schemes',
          title: 'Govt Schemes',
          icon: 'document-text-outline',
          route: '/(farmer)/schemes',
        },
        {
          id: 'learning',
          title: 'Learning Hub',
          icon: 'school-outline',
          route: '/(farmer)/learning',
        },
      ],
    },
    {
      title: 'Market',
      items: [
        {
          id: 'market',
          title: 'Market Prices',
          icon: 'trending-up-outline',
          route: '/(farmer)/market',
        },
        {
          id: 'trade',
          title: 'My Listings',
          icon: 'pricetag-outline',
          route: '/(farmer)/market/trade/my-listings',
        },
        {
          id: 'msp',
          title: 'MSP Rates',
          icon: 'cash-outline',
          route: '/(farmer)/market/msp',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'My Profile',
          icon: 'person-outline',
          route: '/(farmer)/profile/profile',
        },
        {
          id: 'documents',
          title: 'Documents',
          icon: 'folder-outline',
          route: '/(farmer)/profile/documents',
        },
        {
          id: 'bank',
          title: 'Bank Details',
          icon: 'card-outline',
          route: '/(farmer)/profile/bank-details',
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: 'settings-outline',
          route: '/(farmer)/profile/settings',
        },
      ],
    },
  ];

  const handleMenuPress = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    onClose();
    router.replace('/(auth)/login');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Animated Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sidebar Content */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.sm,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {farmer?.name?.charAt(0).toUpperCase() || 'F'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name} numberOfLines={1}>
                  {farmer?.name || 'Farmer'}
                </Text>
                <Text style={styles.phone} numberOfLines={1}>
                  {farmer?.phoneNumber || '+91 XXXXXXXXXX'}
                </Text>
                {farmDetails && (
                  <Text style={styles.farmArea}>
                    🌾 {farmDetails.totalArea} acres
                  </Text>
                )}
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          {/* Menu Sections */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {menuSections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleMenuPress(item.route)}
                  >
                    <View style={styles.menuItemLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          item.color && { backgroundColor: `${item.color}15` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={item.color || colors.text.primary}
                        />
                      </View>
                      <Text style={styles.menuItemText} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.badge && item.badge > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.gray[400]}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}

            {/* Help & Support */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
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
                      name="help-circle-outline"
                      size={22}
                      color={colors.text.primary}
                    />
                  </View>
                  <Text style={styles.menuItemText}>Help & Support</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.gray[400]}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => handleMenuPress('/(farmer)/profile/about')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="information-circle-outline"
                      size={22}
                      color={colors.text.primary}
                    />
                  </View>
                  <Text style={styles.menuItemText}>About</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.gray[400]}
                />
              </Pressable>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>

            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    maxWidth: 320, // Maximum width on larger screens
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: `${colors.primary}08`,
  },
  profileSection: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
    minWidth: 0, // Allow text truncation
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0, // Allow text truncation
  },
  name: {
    ...typography.body,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  phone: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  farmArea: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemPressed: {
    backgroundColor: colors.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0, // Allow text truncation
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: `${colors.error}15`,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  logoutButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  version: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },
});