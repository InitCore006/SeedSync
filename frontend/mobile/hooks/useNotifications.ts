import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  actionUrl?: string;
  icon?: string;
}

interface NotificationSettings {
  weatherAlerts: boolean;
  cropReminders: boolean;
  aiInsights: boolean;
  priceAlerts: boolean;
  marketUpdates: boolean;
  communityPosts: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await notificationService.getAll();
      
      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Weather Alert',
          message: 'Heavy rain expected in your area tomorrow',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'warning',
          icon: '🌧️',
          actionUrl: '/(farmer)/weather',
        },
        {
          id: '2',
          title: 'Market Update',
          message: 'Wheat prices increased by 5%',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          read: true,
          type: 'success',
          icon: '📈',
          actionUrl: '/(farmer)/market',
        },
        {
          id: '3',
          title: 'Payment Received',
          message: '₹5,000 credited to your wallet',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          read: false,
          type: 'success',
          icon: '💰',
          actionUrl: '/(farmer)/wallet',
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await notificationService.getSettings();
      
      // Mock settings for now
      const mockSettings: NotificationSettings = {
        weatherAlerts: true,
        cropReminders: true,
        aiInsights: true,
        priceAlerts: true,
        marketUpdates: false,
        communityPosts: true,
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Set default settings on error
      setSettings({
        weatherAlerts: true,
        cropReminders: true,
        aiInsights: true,
        priceAlerts: true,
        marketUpdates: false,
        communityPosts: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      // TODO: Replace with actual API call
      // await notificationService.updateSettings(newSettings);
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call
      // await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // await notificationService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call
      // await notificationService.delete(notificationId);
      
      setNotifications(prev => {
        const deleted = prev.find(n => n.id === notificationId);
        const filtered = prev.filter(n => n.id !== notificationId);
        
        if (deleted && !deleted.read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
        }
        
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    settings,
    fetchNotifications,
    fetchSettings,
    updateSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

// Export types
export type { Notification, NotificationSettings };