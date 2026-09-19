import { api } from './axios';
import { Notification } from '../types';

export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkAsReadResponse {
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  message: string;
}

export const notificationsApi = {
  list: async (): Promise<NotificationsListResponse> => {
    const res = await api.get<NotificationsListResponse>('/notifications');
    return res.data;
  },

  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    const res = await api.patch<MarkAsReadResponse>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const res = await api.patch<MarkAllAsReadResponse>('/notifications/read-all');
    return res.data;
  },
};
