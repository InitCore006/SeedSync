import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface AppHeaderProps {
  title?: string;
  showMenuButton?: boolean;
  showBackButton?: boolean;
  showNotifications?: boolean;
  onMenuPress?: () => void;
  onBackPress?: () => void;
}

export default function AppHeader({
  title,
  showMenuButton = false,
  showBackButton = false,
  showNotifications = false,
  onMenuPress,
  onBackPress,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showMenuButton && (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={onMenuPress}
            >
              <Ionicons name="menu" size={24} color={colors.text.primary} />
            </Pressable>
          )}
          
          {showBackButton && (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={onBackPress || (() => router.back())}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
          )}

          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {showNotifications && (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={() => router.push('/(farmer)/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
              {/* Notification Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconButtonPressed: {
    backgroundColor: colors.gray[100],
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
});