import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar, Loading } from '@/components';
import { useNotificationsStore } from '@/store/notificationsStore';
import { notificationsAPI } from '@/services/notificationsService';
import { Notification } from '@/types/api';

export default function NotificationsScreen() {
  const { notifications, setNotifications, markAsRead } = useNotificationsStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.results || response.data);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await notificationsAPI.markAsRead(notification.id);
        markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.notification_type === 'bid_received' && notification.related_id) {
      router.push(`/(tabs)/bids/${notification.related_id}` as any);
    } else if (notification.notification_type === 'lot_status_change' && notification.related_id) {
      router.push(`/(tabs)/lots/${notification.related_id}` as any);
    } else if (notification.notification_type === 'shipment_update' && notification.related_id) {
      router.push(`/(tabs)/trips/${notification.related_id}` as any);
    } else if (notification.notification_type === 'payment_received' && notification.related_id) {
      router.push(`/(tabs)/payments/${notification.related_id}` as any);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_received':
        return 'pricetag';
      case 'bid_accepted':
      case 'bid_rejected':
        return 'checkmark-circle';
      case 'lot_status_change':
        return 'leaf';
      case 'shipment_update':
        return 'navigate';
      case 'payment_received':
      case 'payment_completed':
        return 'wallet';
      case 'weather_alert':
        return 'cloud';
      case 'advisory':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid_received':
      case 'bid_accepted':
        return COLORS.success;
      case 'bid_rejected':
        return COLORS.error;
      case 'payment_received':
      case 'payment_completed':
        return COLORS.primary;
      case 'weather_alert':
        return COLORS.warning;
      case 'shipment_update':
        return COLORS.info;
      default:
        return COLORS.secondary;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.notification_type) + '15' }]}>
        <Ionicons
          name={getNotificationIcon(item.notification_type) as any}
          size={24}
          color={getNotificationColor(item.notification_type)}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>

      {!item.is_read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Notifications"
          onMenuPress={() => setSidebarVisible(true)}
          showNotifications={false}
        />
        <Loading fullScreen />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        onMenuPress={() => setSidebarVisible(true)}
        showNotifications={false}
      />

      {notifications.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {notifications.filter(n => !n.is_read).length} unread
          </Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>No Notifications</Text>
            <Text style={styles.emptyHint}>You're all caught up!</Text>
          </View>
        }
      />

      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  markAllButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
});
