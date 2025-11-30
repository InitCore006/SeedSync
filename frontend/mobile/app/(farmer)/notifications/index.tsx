import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCard from '@/components/notifications/NotificationCard';
import EmptyState from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface NotificationGroup {
  title: string;
  data: any[];
}

export default function NotificationsScreen() {
  const {
    notifications = [], // Default to empty array
    unreadCount = 0, // Default to 0
    isLoading = false,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications() || {}; // Handle undefined hook

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (fetchNotifications) {
      fetchNotifications();
    }
  }, []);

  const onRefresh = async () => {
    if (!fetchNotifications) return;
    setRefreshing(true);
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = async (notificationId: string, actionUrl?: string) => {
    if (!markAsRead) return;
    try {
      await markAsRead(notificationId);
      if (actionUrl) {
        router.push(actionUrl as any);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!markAllAsRead) return;
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!deleteNotification) return;
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const groupNotificationsByDate = (): NotificationGroup[] => {
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return [];
    }

    const filtered = filter === 'unread' 
      ? notifications.filter((n) => n && !n.read)
      : notifications.filter((n) => n); // Filter out any null/undefined

    if (filtered.length === 0) {
      return [];
    }

    const groups: { [key: string]: any[] } = {};

    filtered.forEach((notification) => {
      if (!notification || !notification.timestamp) return;

      try {
        const date = new Date(notification.timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey: string;
        if (date.toDateString() === today.toDateString()) {
          dateKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateKey = 'Yesterday';
        } else {
          dateKey = date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
        }

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(notification);
      } catch (error) {
        console.error('Error processing notification date:', error);
      }
    });

    // Convert to SectionList format with proper structure
    return Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data: data || [], // Ensure data is always an array
      }))
      .filter(section => section.data.length > 0); // Remove empty sections
  };

  const sections = groupNotificationsByDate();
  const safeNotificationsLength = notifications?.length || 0;
  const safeUnreadCount = unreadCount || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={() => router.push('/(farmer)/notifications/settings')}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({safeNotificationsLength})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({safeUnreadCount})
          </Text>
        </Pressable>
      </View>

      {/* Mark All as Read */}
      {safeUnreadCount > 0 && (
        <View style={styles.actionBar}>
          <Pressable style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      {isLoading && sections.length === 0 ? (
        <LoadingSpinner />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          description={
            filter === 'unread'
              ? "You're all caught up! No unread notifications"
              : "You don't have any notifications yet"
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item?.id || `notification-${index}`}
          renderItem={({ item }) => {
            if (!item) return null;
            return (
              <NotificationCard
                notification={item}
                onPress={() => handleNotificationPress(item.id, item.actionUrl)}
                onDelete={() => handleDeleteNotification(item.id)}
              />
            );
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  settingsButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.surface,
  },
  actionBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  markAllButton: {
    alignSelf: 'flex-end',
  },
  markAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
});