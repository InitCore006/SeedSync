import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';

interface AppHeaderProps {
  title?: string;
  onMenuPress: () => void;
  showNotifications?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function AppHeader({
  title,
  onMenuPress,
  showNotifications = true,
  showBackButton = false,
  onBackPress,
}: AppHeaderProps) {
  const { user } = useAuthStore();
  const { notifications, unreadCount } = useNotificationsStore();

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.primary} 
        translucent={true}
      />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity 
              onPress={onBackPress} 
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={onMenuPress} 
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={28} color={COLORS.white} />
            </TouchableOpacity>
          )}
          
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'SeedSync'}
            </Text>
            {user?.profile?.full_name && !title && (
              <Text style={styles.subtitle} numberOfLines={1}>
                Welcome, {user.profile.full_name.split(' ')[0]}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          {showNotifications && (
            <TouchableOpacity
              onPress={() => router.push('/notifications' as any)}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 44 : 44,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
