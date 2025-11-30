import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Notification } from '@/types/weather.types';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onDelete?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return colors.error;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.primary;
      case 'low':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weather':
        return '#2196F3';
      case 'crop':
        return '#4CAF50';
      case 'price':
        return '#FF9800';
      case 'market':
        return '#9C27B0';
      case 'ai':
        return '#00BCD4';
      case 'community':
        return '#FF5722';
      default:
        return colors.text.secondary;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        !notification.read && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{notification.icon || '📢'}</Text>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[styles.typeBadge, { backgroundColor: `${getTypeColor(notification.type)}20` }]}
          >
            <Text style={[styles.typeText, { color: getTypeColor(notification.type) }]}>
              {notification.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.time}>{formatTime(notification.timestamp)}</Text>
        </View>

        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>

        {notification.actionLabel && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionLabel}>{notification.actionLabel} →</Text>
          </View>
        )}
      </View>

      {notification.priority === 'urgent' && (
        <View style={styles.priorityIndicator}>
          <Text style={styles.priorityIcon}>🚨</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unread: {
    backgroundColor: `${colors.primary}05`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  icon: {
    fontSize: 32,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  time: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  message: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: spacing.xs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  priorityIndicator: {
    marginLeft: spacing.xs,
  },
  priorityIcon: {
    fontSize: 20,
  },
});

export default NotificationCard;