import { create } from 'zustand';
import { Notification, NotificationSettings } from '@/types/weather.types';
import { notificationService } from '@/services/notification.service';

interface NotificationState {
  // State
  notifications: Notification[];
  settings: NotificationSettings | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  settings: null,
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Fetch notifications
  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      const notifications = await notificationService.getNotifications();
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({
        notifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      const notifications = get().notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch (error: any) {
      console.error('Failed to mark as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      const notifications = get().notifications.map((n) => ({ ...n, read: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const notifications = get().notifications.filter((n) => n.id !== notificationId);
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
    }
  },

  // Fetch settings
  fetchSettings: async () => {
    try {
      const settings = await notificationService.getSettings();
      set({ settings });
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
    }
  },

  // Update settings
  updateSettings: async (settings: NotificationSettings) => {
    try {
      await notificationService.updateSettings(settings);
      set({ settings });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update settings' });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      notifications: [],
      settings: null,
      unreadCount: 0,
      isLoading: false,
      error: null,
    }),
}));