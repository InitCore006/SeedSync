import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { Notification, PaginatedResponse, ApiSuccess } from '@/types/api';
import { AxiosResponse } from 'axios';

export const notificationsAPI = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: (params?: {
    is_read?: boolean;
    type?: string;
  }): Promise<AxiosResponse<PaginatedResponse<Notification>>> => {
    return api.get(ENDPOINTS.NOTIFICATIONS.LIST, { params });
  },

  /**
   * Mark notification as read
   */
  markAsRead: (id: number): Promise<AxiosResponse<ApiSuccess>> => {
    return api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: (): Promise<AxiosResponse<ApiSuccess>> => {
    return api.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  /**
   * Delete notification
   */
  deleteNotification: (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },
};
