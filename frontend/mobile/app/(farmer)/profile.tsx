import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/common/useAuth';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@lib/constants/colors';
import { typography } from '@lib/constants/typography';
import { spacing, borderRadius } from '@lib/constants/spacing';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={24} color={danger ? colors.error : colors.primary[500]} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userPhone}>{user?.phone_number}</Text>

          {user?.farm_details && (
            <View style={styles.farmInfo}>
              <Ionicons name="leaf-outline" size={16} color={colors.success} />
              <Text style={styles.farmText}>
                {user.farm_details.farm_size} acres • {user.farm_details.location}
              </Text>
            </View>
          )}
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push('/(farmer)/profile/edit')}
            />
            <MenuItem
              icon="leaf-outline"
              title="Farm Details"
              subtitle="Manage your farm information"
              onPress={() => router.push('/(farmer)/profile/farm-details')}
            />
            <MenuItem
              icon="card-outline"
              title="Bank Details"
              subtitle="Update payment information"
              onPress={() => router.push('/(farmer)/profile/bank-details')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage notification settings"
              onPress={() => router.push('/(farmer)/profile/notifications')}
            />
            <MenuItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => {
                Alert.alert('Coming Soon', 'Language selection will be available soon.');
              }}
            />
            <MenuItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Toggle dark mode"
              onPress={() => {
                Alert.alert('Coming Soon', 'Dark mode will be available soon.');
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="help-circle-outline"
              title="Help & FAQ"
              onPress={() => router.push('/(farmer)/profile/help')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Conditions"
              onPress={() => router.push('/(farmer)/profile/terms')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => router.push('/(farmer)/profile/privacy')}
            />
            <MenuItem
              icon="mail-outline"
              title="Contact Support"
              subtitle="support@seedsync.com"
              onPress={() => {
                Alert.alert('Contact Support', 'Email: support@seedsync.com\nPhone: 1800-XXX-XXXX');
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0"
              onPress={() => {}}
              showChevron={false}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out-outline"
              title="Logout"
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },

  header: {
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },

  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },

  profileCard: {
    backgroundColor: colors.background.default,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.inverse,
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.default,
  },

  userName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  userPhone: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },

  farmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.sm,
  },

  farmText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
  },

  section: {
    marginTop: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  menuContainer: {
    backgroundColor: colors.background.default,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  menuIconDanger: {
    backgroundColor: colors.error + '15',
  },

  menuContent: {
    flex: 1,
  },

  menuTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },

  menuTitleDanger: {
    color: colors.error,
  },

  menuSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});