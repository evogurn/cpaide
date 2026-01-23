import api from '../utils/api';

export const notificationService = {
  // Get user notifications
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/notifications?${queryParams}` : '/notifications';
    const response = await api.get(url);
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Archive notification
  async archiveNotification(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/archive`);
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get system notifications for master admin
  async getSystemNotifications(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/notifications/system?${queryParams}` : '/notifications/system';
    const response = await api.get(url);
    return response.data;
  },

  // Get system notifications unread count for master admin
  async getSystemUnreadCount() {
    const response = await api.get('/notifications/system/unread-count');
    return response.data;
  }
};