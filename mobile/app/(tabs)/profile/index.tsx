import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, AppHeader, Sidebar } from '@/components';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { formatPhoneNumber } from '@/utils/formatters';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const isFarmer = user?.role === 'farmer';
  const isLogistics = user?.role === 'logistics';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      route: '/(tabs)/profile/edit',
      roles: ['farmer', 'logistics'],
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      route: '/(tabs)/profile/payment-methods',
      roles: ['farmer'],
    },
    {
      icon: 'car-outline',
      label: 'My Vehicles',
      route: '/(tabs)/profile/vehicles',
      roles: ['logistics'],
    },
    {
      icon: 'document-text-outline',
      label: 'KYC Documents',
      route: '/(tabs)/profile/kyc',
      roles: ['farmer', 'logistics'],
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      route: '/(tabs)/profile/settings',
      roles: ['farmer', 'logistics'],
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      route: '/(tabs)/profile/support',
      roles: ['farmer', 'logistics'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader 
        title="My Profile"
        onMenuPress={() => setSidebarVisible(true)}
        showNotifications={true}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      
      <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profile?.profile_photo ? (
            <Image
              source={{ uri: user.profile.profile_photo }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {user?.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user?.profile?.full_name || 'User'}</Text>
        <Text style={styles.phone}>
          {formatPhoneNumber(user?.phone_number || '')}
        </Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role_display || user?.role?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Quick Stats for Farmers */}
      {isFarmer && user?.profile && (
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {user.profile.total_lots_created || 0}
            </Text>
            <Text style={styles.statLabel}>Lots Created</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>
              ₹{(user.profile.total_earnings || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="scale" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>
              {user.profile.total_quantity_sold_quintals || 0}Q
            </Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
        </View>
      )}

      {/* Quick Stats for Logistics */}
      {isLogistics && user?.profile && (
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="car" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {user.profile.total_trips || 0}
            </Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>
              ₹{(user.profile.total_earnings || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>
              {user.profile.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {filteredMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={COLORS.text.primary}
              />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.text.tertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          leftIcon={
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          }
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SeedSync v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 All Rights Reserved</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  logoutSection: {
    padding: 16,
    marginTop: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});
