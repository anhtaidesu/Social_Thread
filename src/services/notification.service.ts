import axiosInstance from '../utils/axiosConfig';
import { Notification } from '../types';

// API URL from env
const API_URL = process.env.REACT_APP_SOCIAL_API_URL || 'http://localhost:8081';

/**
 * Response type for notification operations
 */
interface NotificationResponse {
  success: boolean;
  data: any;
  error: string | null;
}

/**
 * Service to handle notification-related API calls
 */
export const NotificationService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async (page = 1, limit = 20): Promise<NotificationResponse> => {
    try {
      console.log(`Fetching notifications: page=${page}, limit=${limit}`);
      const response = await axiosInstance.get(`${API_URL}/api/v1/notifications?page=${page}&limit=${limit}`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            notifications: response.data.data.notifications,
            pagination: response.data.data.pagination
          },
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Failed to fetch notifications'
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Error fetching notifications'
      };
    }
  },
  
  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/api/v1/notifications/unread-count`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data.count,
          error: null
        };
      }
      
      return {
        success: false,
        data: 0,
        error: response.data.message || 'Failed to get unread count'
      };
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return {
        success: false,
        data: 0,
        error: error.response?.data?.message || error.message || 'Error getting unread count'
      };
    }
  },
  
  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/api/v1/notifications/read`, {
        ids: [notificationId]
      });
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: notificationId,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Failed to mark notification as read'
      };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Error marking notification as read'
      };
    }
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/api/v1/notifications/mark-all-read`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: null,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Failed to mark all notifications as read'
      };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Error marking all notifications as read'
      };
    }
  },
  
  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/api/v1/notifications/${notificationId}`);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: notificationId,
          error: null
        };
      }
      
      return {
        success: false,
        data: null,
        error: response.data.message || 'Failed to delete notification'
      };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Error deleting notification'
      };
    }
  }
};

export default NotificationService; 