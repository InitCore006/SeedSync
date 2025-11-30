import { Notification, NotificationSettings } from '@/types/weather.types';

class NotificationService {
  private baseUrl = 'https://api.seedsync.com'; // Mock URL

  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'weather',
        title: 'Heavy Rainfall Alert',
        message: 'Heavy rain expected in your area tomorrow. Consider postponing field work.',
        priority: 'high',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        icon: '🌧️',
        actionUrl: '/(farmer)/weather',
        actionLabel: 'View Weather',
      },
      {
        id: '2',
        type: 'crop',
        title: 'Irrigation Reminder',
        message: 'Your Soybean crop needs irrigation. Soil moisture is below optimal level.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        icon: '💧',
        actionUrl: '/(farmer)/crops',
        actionLabel: 'View Crop',
      },
      {
        id: '3',
        type: 'price',
        title: 'Price Alert: Cotton',
        message: 'Cotton prices increased by 8%. Current price: ₹6,200/quintal',
        priority: 'medium',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: true,
        icon: '💰',
        actionUrl: '/(farmer)/market',
        actionLabel: 'View Market',
      },
      {
        id: '4',
        type: 'ai',
        title: 'AI Insight: Disease Risk',
        message: 'Increased risk of leaf blight in your region due to humid conditions.',
        priority: 'high',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        read: true,
        icon: '🤖',
        actionUrl: '/(farmer)/ai/crop-scanner',
        actionLabel: 'Scan Crop',
      },
      {
        id: '5',
        type: 'community',
        title: 'New Post from Expert',
        message: 'Dr. Sharma shared tips on organic pest control methods.',
        priority: 'low',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        read: true,
        icon: '👥',
        actionUrl: '/(farmer)/community',
        actionLabel: 'View Post',
      },
      {
        id: '6',
        type: 'market',
        title: 'Mandi Update',
        message: 'Nagpur Mandi: High demand for vegetables today.',
        priority: 'medium',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        read: true,
        icon: '🏪',
        actionUrl: '/(farmer)/market',
        actionLabel: 'View Market',
      },
    ];

    return mockNotifications;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`Marked notification ${notificationId} as read`);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Marked all notifications as read');
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`Deleted notification ${notificationId}`);
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      weatherAlerts: true,
      cropReminders: true,
      priceAlerts: true,
      marketUpdates: true,
      aiInsights: true,
      communityPosts: false,
    };
  }

  // Update notification settings
  async updateSettings(settings: NotificationSettings): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Updated notification settings:', settings);
  }

  // Register device for push notifications
  async registerDevice(token: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Registered device token:', token);
  }

  // Unregister device
  async unregisterDevice(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Unregistered device');
  }
}

export const notificationService = new NotificationService();