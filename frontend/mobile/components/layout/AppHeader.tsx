import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNotifications?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  transparent?: boolean;
}

export default function AppHeader({
  title,
  showBackButton = false,
  showMenuButton = true,
  showNotifications = true,
  onBackPress,
  onMenuPress,
  transparent = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleNotificationPress = () => {
    router.push('/(farmer)/notifications');
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.white}
        translucent={transparent}
      />
      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + spacing.xs,
            backgroundColor: transparent ? 'transparent' : colors.white,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Left Section - Menu/Back Button */}
          <View style={styles.leftSection}>
            {showBackButton ? (
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              </Pressable>
            ) : showMenuButton ? (
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                onPress={onMenuPress}
              >
                <Ionicons name="menu" size={26} color={colors.text.primary} />
              </Pressable>
            ) : (
              <View style={styles.logoContainer}>
                <Text style={styles.logo}>🌾</Text>
              </View>
            )}
            {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
          </View>

          {/* Right Section - Notifications */}
          <View style={styles.rightSection}>
            {showNotifications && (
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                onPress={handleNotificationPress}
              >
                <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
                {/* Notification Badge */}
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});