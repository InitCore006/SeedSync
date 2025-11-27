import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menuItems = [
    { id: '1', title: 'Edit Profile', icon: '✏️', route: '/(farmer)/settings/edit-profile' },
    { id: '2', title: 'Bank Accounts', icon: '🏦', route: '/(farmer)/settings/bank-accounts' },
    { id: '3', title: 'Documents', icon: '📄', route: '/(farmer)/documents' },
    { id: '4', title: 'Language', icon: '🌐', route: '/(farmer)/settings/language' },
    { id: '5', title: 'Help & Support', icon: '❓', route: '/(farmer)/settings/help-faq' },
    { id: '6', title: 'Privacy Policy', icon: '🔒', route: '/(farmer)/settings/privacy-policy' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'F'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Farmer Name'}</Text>
          <Text style={styles.phone}>{user?.phone || '+91 XXXXXXXXXX'}</Text>
          <Text style={styles.location}>📍 {user?.location || 'Location'}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </Pressable>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.surface,
    fontWeight: '700',
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  phone: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  menu: {
    padding: spacing.md,
  },
  menuItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  menuTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  menuArrow: {
    ...typography.h3,
    color: colors.primary,
  },
  logoutButton: {
    backgroundColor: `${colors.error}15`,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '700',
  },
  version: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});